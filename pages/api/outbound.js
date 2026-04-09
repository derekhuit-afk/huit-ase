const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  'https://vvkdnzqgtajeouxlliuk.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function buildOutboundHTML(subject, body, product, ctaUrl, ctaLabel) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f8fafc;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
        
        <tr><td style="padding-bottom:24px;">
          <span style="color:#0ea5e9;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">HUIT.AI</span>
          <span style="color:#cbd5e1;font-size:11px;margin-left:8px;">Built From Alaska</span>
        </td></tr>

        <tr><td style="background:#ffffff;border-radius:12px;padding:40px;border:1px solid #e2e8f0;">
          <div style="font-size:15px;color:#1e293b;line-height:1.8;white-space:pre-wrap;">${body}</div>
          
          <table cellpadding="0" cellspacing="0" style="margin:32px 0 0;">
            <tr><td style="background:#0ea5e9;border-radius:8px;padding:14px 28px;">
              <a href="${ctaUrl}" style="color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">${ctaLabel} →</a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:20px 0;font-size:12px;color:#94a3b8;line-height:1.6;">
          Derek Huit · Founder & CEO, Huit.AI · Anchorage, Alaska<br>
          <a href="https://huit.ai" style="color:#0ea5e9;text-decoration:none;">huit.ai</a> · 
          <a href="https://huit.ai/unsubscribe" style="color:#94a3b8;">Unsubscribe</a>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const PRODUCT_CTA = {
  CRMEX: { url: 'https://crmex.huit.ai/demo', label: 'See CRMEX In Action', price: '$625/mo' },
  APEX: { url: 'https://apex.huit.ai/demo', label: 'Run A Sample APEX Report', price: '$625/mo' },
  ZenoPay: { url: 'https://zenopay.ai/demo', label: 'Calculate Your Savings', price: '$2,500/mo' },
  LeadQualifier: { url: 'https://huit.ai/demo', label: 'See Lead Qualification Live', price: '$625/mo' },
  ContentLoop: { url: 'https://content.huit.ai/demo', label: 'See Your Content Calendar', price: '$625/mo' },
  AskAlaskaMortgage: { url: 'https://askalaskamortgage.ai', label: 'Get Your Mortgage Answer', price: 'Free' },
  DEFAULT: { url: 'https://huit.ai/demo', label: 'Book A 20-Minute Demo', price: '$625/mo' }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ase-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = req.headers['x-ase-key'];
  if (apiKey !== process.env.ASE_ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { to, toName, company, product, emailBody, subject, loanCount } = req.body;
  if (!to || !subject || !emailBody) {
    return res.status(400).json({ error: 'to, subject, emailBody required' });
  }

  const cta = PRODUCT_CTA[product] || PRODUCT_CTA.DEFAULT;
  const html = buildOutboundHTML(subject, emailBody, product, cta.url, cta.label);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Derek Huit <derek@huit.ai>',
      to,
      subject,
      html,
      tags: [
        { name: 'type', value: 'outbound' },
        { name: 'product', value: product || 'DEFAULT' },
        { name: 'source', value: 'hmda_prospect' }
      ]
    });

    if (error) return res.status(400).json({ success: false, error });

    // Log to CRMEX
    await supabase.from('ase_leads').insert([{
      email: to,
      first_name: toName?.split(' ')[0] || '',
      last_name: toName?.split(' ').slice(1).join(' ') || '',
      company: company || '',
      product: product || 'DEFAULT',
      source: 'outbound_hmda',
      qualification_score: loanCount ? Math.min(Math.floor(loanCount / 10), 100) : 30,
      intent: 'cold',
      icp_match: true,
      status: 'outbound_sent',
      created_at: new Date().toISOString()
    }]);

    return res.status(200).json({ success: true, emailId: data?.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
