export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ase-key');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    prospectName, company, loanCount, market, productLine, recruiterName, goal
  } = req.body;

  const ctx = `
PROSPECT: ${prospectName || 'the loan officer'}
COMPANY: ${company || 'their current company'}
LOAN VOLUME: ${loanCount ? `${loanCount} loans originated` : 'active production'}
MARKET: ${market || 'mortgage market'}
PRODUCT: ${productLine || 'Huit.AI platform'}
RECRUITER: ${recruiterName || 'Derek Huit, Founder & CEO, Huit.AI'}
GOAL: ${goal || 'recruit to Cardinal Financial / Huit.AI platform'}
`;

  const chainPrompts = [
    {
      step: 'email_1',
      label: 'Email 1 — Cold Opener (Day 1)',
      prompt: `You are writing a cold outreach email for a mortgage recruiter.
${ctx}
Write Email 1 — the initial cold outreach. Requirements:
- Subject line (compelling, under 8 words, no spam triggers)
- Opening: reference their specific loan production or market presence
- Value proposition: one sentence — what makes this opportunity different
- Social proof: one brief data point or result
- CTA: low-friction ask (10 min call or reply to learn more)
- Signature block
- Tone: peer-to-peer, direct, human — NOT corporate
- Length: 120-160 words max

FORMAT:
SUBJECT: [subject]
BODY:
[email body]`,
    },
    {
      step: 'email_2',
      label: 'Email 2 — Value Deepener (Day 4)',
      prompt: `You are writing a follow-up email sequence for mortgage recruiting.
${ctx}
Email 1 was sent 4 days ago with no response. Write Email 2 — the value deepener.
Requirements:
- Reference email 1 briefly (1 sentence, don't guilt-trip)
- Lead with a new angle: specific pain point of LOs at ${company || 'their company'}
- Share one concrete insight (market data, production lift, tech advantage)
- Include a specific ask with a deadline or urgency trigger
- Tone: confident but respectful — still peer-to-peer
- Length: 100-130 words

FORMAT:
SUBJECT: [subject — different from email 1]
BODY:
[email body]`,
    },
    {
      step: 'sms',
      label: 'SMS — Day 7 Touchpoint',
      prompt: `You are writing an SMS outreach for mortgage recruiting.
${ctx}
Emails 1 and 2 sent. No response. Write a 2-part SMS sequence — Day 7.
Requirements for SMS 1: personalized hook + one key benefit + soft CTA (160 chars max)
Requirements for SMS 2 (follow-up 48 hrs later): direct, brief, reply-bait (120 chars max)
Tone: casual, human, first-name basis. NO emoji overload. Max 1 emoji each.
Identify sender as ${recruiterName || 'Derek'} from Huit.AI.

FORMAT:
SMS 1: [text — max 160 chars]
SMS 2: [text — max 120 chars]`,
    },
    {
      step: 'call_script',
      label: 'Call Script — Day 10 Voice Outreach',
      prompt: `You are writing a 60-second AI voice call script for mortgage recruiting.
${ctx}
This is the final step in a chained sequence. Emails 1+2 sent, SMS sent, no response.
Write a voice call script that references the prior outreach tactfully.
Requirements:
- OPENING (5 sec): personalized, references their production data
- BRIDGE (10 sec): acknowledge prior outreach, respect their time
- VALUE PROP (15 sec): single strongest benefit — what they're missing
- QUALIFYING QUESTION (10 sec): one open question to get them talking
- CTA (10 sec): specific, easy next step
- OBJECTION HANDLER: one line for "not interested"
- Total spoken words: 80-100

FORMAT:
OPENING: [text]
BRIDGE: [text]
VALUE PROP: [text]
QUALIFYING QUESTION: [text]
CTA: [text]
OBJECTION HANDLER: [text]`,
    },
  ];

  try {
    const results = {};
    let previousOutputs = '';

    for (const step of chainPrompts) {
      const chainContext = previousOutputs
        ? `\n\nCONTEXT FROM PRIOR SEQUENCE STEPS:\n${previousOutputs}\n\nEnsure this step builds naturally on the prior steps — consistent voice, escalating urgency, no repetition of exact phrases used before.\n\n`
        : '';

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          system: `You are an elite mortgage recruiting copywriter and sales strategist. You write outbound sequences for top mortgage recruiters targeting active loan officers. Your sequences are human, data-driven, RESPA-compliant, and convert at above-industry rates. Never use generic templates. Every message references real prospect context.`,
          messages: [{ role: 'user', content: chainContext + step.prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map(b => b.type === 'text' ? b.text : '').join('') || '';
      results[step.step] = { label: step.label, content: text };
      previousOutputs += `\n--- ${step.label} ---\n${text}\n`;
    }

    return res.status(200).json({
      success: true,
      prospect: prospectName,
      company,
      sequence: results,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Chain generation failed', details: err.message });
  }
}
