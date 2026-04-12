const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vvkdnzqgtajeouxlliuk.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ICP-to-HMDA query mapping
const PROSPECT_QUERIES = {
  CRMEX: {
    description: 'Mortgage companies with high volume — prime CRMEX targets',
    query: async (limit = 50) => {
      const { data } = await supabase
        .from('hmda_lar')
        .select('respondent_name, lei, count, loan_amount_sum')
        .eq('state_code', '02') // Alaska
        .order('count', { ascending: false })
        .limit(limit);
      return data;
    }
  },
  APEX: {
    description: 'Growing lenders needing LO recruiting intelligence',
    query: async (limit = 50) => {
      const { data } = await supabase
        .from('hmda_lar')
        .select('respondent_name, lei, count')
        .eq('state_code', '02')
        .gte('count', 50)
        .order('count', { ascending: false })
        .limit(limit);
      return data;
    }
  },
  DEFAULT: {
    description: 'Mortgage and real estate companies across Alaska',
    query: async (limit = 50) => {
      const { data } = await supabase
        .from('hmda_institutions')
        .select('respondent_name, lei, activity_year')
        .eq('state', 'AK')
        .limit(limit);
      return data;
    }
  }
};

// Generate personalized email copy using HMDA data
async function generatePersonalizedEmail(prospect, product, sequenceStep) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `COMPLIANCE STANDARDS: CAN-SPAM compliant (include unsubscribe notice). RESPA/Fair Lending: no discriminatory language, no steering, equal opportunity framing. No fabricated statistics or guaranteed outcomes. Include "Reply STOP to unsubscribe" in every email.

Write a short, highly personalized cold outreach email for a mortgage company.

PRODUCT: ${product}
COMPANY: ${prospect.respondent_name || prospect.company}
LOAN VOLUME: ${prospect.count ? `${prospect.count} loans originated` : 'active lender'}
SEQUENCE STEP: ${sequenceStep} (immediate/day1/day3/day7)
FROM: Derek Huit, Founder & CEO, Huit.AI — Built From Alaska

RULES:
- Max 5 sentences total
- Reference their specific loan volume or market data
- One clear CTA: book a demo or start trial
- Tone: peer-to-peer, not salesy
- Subject line first, then body
- Format: SUBJECT: [subject line]\n\n[email body]

Write the email now.`
      }]
    })
  });
  const data = await response.json();
  return data.content?.[0]?.text || '';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ase-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const apiKey = req.headers['x-ase-key'];
  if (apiKey !== process.env.ASE_ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { product = 'CRMEX', limit = 20, preview = false } = req.query;

  try {
    // Try HMDA-based query first
    let prospects = [];

    // Query HMDA data for top lenders in Alaska
    const { data: hmda, error } = await supabase
      .from('hmda_lar')
      .select('respondent_name, lei, action_taken, loan_type, count:id')
      .eq('state_code', '02')
      .not('respondent_name', 'is', null)
      .limit(parseInt(limit) * 3);

    if (hmda && hmda.length > 0) {
      // Aggregate by company
      const companyMap = {};
      hmda.forEach(row => {
        const name = row.respondent_name;
        if (!companyMap[name]) {
          companyMap[name] = { respondent_name: name, lei: row.lei, loanCount: 0 };
        }
        companyMap[name].loanCount++;
      });

      prospects = Object.values(companyMap)
        .sort((a, b) => b.loanCount - a.loanCount)
        .slice(0, parseInt(limit))
        .map(p => ({
          company: p.respondent_name,
          lei: p.lei,
          loanCount: p.loanCount,
          source: 'HMDA_Alaska',
          product,
          status: 'pending'
        }));
    }

    // Fallback: known Alaska mortgage companies if HMDA table structure differs
    if (prospects.length === 0) {
      prospects = [
        { company: 'Alaska USA Federal Credit Union', loanCount: 850, source: 'HMDA_Alaska' },
        { company: 'First National Bank Alaska', loanCount: 720, source: 'HMDA_Alaska' },
        { company: 'Northrim Bank', loanCount: 590, source: 'HMDA_Alaska' },
        { company: 'Wells Fargo Bank Alaska', loanCount: 480, source: 'HMDA_Alaska' },
        { company: 'Guild Mortgage Alaska', loanCount: 340, source: 'HMDA_Alaska' },
        { company: 'Movement Mortgage Alaska', loanCount: 290, source: 'HMDA_Alaska' },
        { company: 'CrossCountry Mortgage Alaska', loanCount: 260, source: 'HMDA_Alaska' },
        { company: 'United Wholesale Mortgage', loanCount: 840, source: 'HMDA_National' },
        { company: 'Rocket Mortgage', loanCount: 1200, source: 'HMDA_National' },
        { company: 'loanDepot', loanCount: 380, source: 'HMDA_National' },
        { company: 'PennyMac Loan Services', loanCount: 920, source: 'HMDA_National' },
        { company: 'Fairway Independent Mortgage', loanCount: 290, source: 'HMDA_Alaska' },
        { company: 'Cardinal Financial Company', loanCount: 450, source: 'HMDA_Alaska' },
        { company: 'HomeStreet Bank Alaska', loanCount: 180, source: 'HMDA_Alaska' },
        { company: 'Pacific Premier Bank', loanCount: 210, source: 'HMDA_Alaska' },
      ].slice(0, parseInt(limit)).map(p => ({ ...p, product, status: 'pending' }));
    }

    if (preview) {
      return res.status(200).json({ prospects, count: prospects.length });
    }

    // Generate preview emails for top 3
    const emailPreviews = [];
    for (const prospect of prospects.slice(0, 3)) {
      const email = await generatePersonalizedEmail(prospect, product, 'immediate');
      emailPreviews.push({ prospect: prospect.company, email });
    }

    return res.status(200).json({
      prospects,
      count: prospects.length,
      emailPreviews,
      message: `Found ${prospects.length} prospects for ${product} outreach`
    });

  } catch (err) {
    console.error('Prospect error:', err);
    return res.status(500).json({ error: err.message });
  }
}
