export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ase-key');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, company, loanCount, product, contactName } = req.body;
  // type: 'linkedin' | 'voice' | 'sms'

  const prompts = {
    linkedin: `Write a LinkedIn connection request message (max 300 chars) and a follow-up message (max 500 chars) for outreach to a mortgage professional.

COMPANY: ${company}
LOAN VOLUME: ${loanCount ? `${loanCount} loans originated in Alaska` : 'active lender'}
PRODUCT: ${product} by Huit.AI (Built From Alaska)
CONTACT: ${contactName || 'the recipient'}
FROM: Derek Huit, Founder & CEO, Huit.AI

FORMAT YOUR RESPONSE EXACTLY AS:
CONNECTION REQUEST:
[connection request text]

FOLLOW-UP MESSAGE:
[follow-up message text]

Keep it peer-to-peer. Reference Alaska market data if possible. No corporate speak.`,

    voice: `Write a 60-second AI voice call script for outbound prospecting.

COMPANY: ${company}
LOAN VOLUME: ${loanCount ? `${loanCount} loans originated in Alaska last year` : 'active lender in Alaska'}
PRODUCT: ${product} by Huit.AI
CONTACT: ${contactName || 'the branch manager'}
CALLER: Derek Huit's AI Voice Agent, Huit.AI

SCRIPT REQUIREMENTS:
- Opens with a personalized hook using their loan data
- States value prop in one sentence
- Asks one qualifying question
- Has a clear next step (schedule demo or email follow-up)
- Handles "not interested" gracefully
- Total: 60-75 words spoken

FORMAT:
OPENING: [opening line]
VALUE PROP: [one sentence]
QUALIFYING QUESTION: [question]
CTA: [next step]
OBJECTION HANDLER: [if not interested response]`,

    sms: `Write a 2-part SMS sequence (160 chars each) for mortgage professional outreach.

COMPANY: ${company}
PRODUCT: ${product} by Huit.AI
FROM: Derek at Huit.AI

SMS 1 (initial): Reference their market, introduce value
SMS 2 (follow-up 48hrs later): Soft follow-up with direct link

FORMAT:
SMS 1: [text]
SMS 2: [text]`
  };

  const prompt = prompts[type] || prompts.linkedin;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    return res.status(200).json({ success: true, type, content, company, product });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
