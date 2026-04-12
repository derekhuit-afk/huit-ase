const { ICP_MAP } = require('../../lib/icp-map');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, product, sessionId } = req.body;

    const productConfig = ICP_MAP[product] || ICP_MAP['DEFAULT'];

    // ── HUIT.AI KNOWLEDGE BASE ────────────────────────────────────────────
    const KB_ASE = [
      'SALES INTELLIGENCE STANDARDS:',
      'HALLUCINATION GUARD: Never fabricate specific product features, pricing outside the stated tiers, or customer testimonials. If asked about a feature not in your product config, say "I can check on that" rather than guessing.',
      'RESPONSIBLE AI: Sales qualification must never factor in demographic signals. Qualify on business need, role, and intent only. Geography is never a disqualifier.',
      'MARKETING FUNNEL: Identify stage before routing — Awareness (educate), Consideration (differentiate), Decision (convert). Route to checkout only when intent is confirmed hot (score 80+).',
      'SMART QUALIFICATION: Ask ONE question at a time. Stop asking after you have: role, company size, primary pain point. Maximum 3 qualifying questions before recommending a next step.',
      'DATA ETHICS: Never share or repeat any personal information the visitor has shared back to them in a way that feels surveillance-like. Treat all data as confidential.',
    ].join(' ')

    const systemPrompt = `${KB_ASE}\n\nYou are an elite AI sales representative for ${productConfig.displayName}, part of the Huit.AI platform — Built From Alaska.

YOUR MISSION: Qualify this visitor and guide them to either book a demo or go directly to checkout. Every conversation should move toward a conversion.

PRODUCT: ${productConfig.displayName}
PRICE: ${productConfig.pricing}
ICP: ${productConfig.icp}
PAIN POINTS YOU SOLVE: ${productConfig.painPoints.join(', ')}
CHECKOUT URL: ${productConfig.checkoutUrl}
DEMO URL: ${productConfig.demoUrl}

CONVERSATION APPROACH:
1. Open with a warm, direct question about their current situation
2. Listen for pain points matching: ${productConfig.painPoints.join(', ')}
3. After 2-3 exchanges, assess qualification
4. If QUALIFIED (matches ICP, has pain, has budget signal): Drive to checkout or demo
5. If UNQUALIFIED: Capture email for nurture sequence, exit gracefully
6. If PRICE OBJECTION: Emphasize ROI — one deal/client pays for months of the tool

QUALIFICATION SIGNALS (HIGH INTENT):
- Mentions team size, company, current tool pain
- Asks about specific features or integrations
- Mentions timeline ("looking to start soon", "evaluating options")
- Shares their role (matches ICP)

TONE: Confident. Direct. Professional but human. Never robotic. Never pushy — create value first.
LENGTH: Keep responses under 3 sentences unless explaining a key feature. Ask one question at a time.

EXTRACT & RETURN (in your response after |||):
Format: |||{"qualified":true/false,"score":0-100,"intent":"hot/warm/cold","firstName":"","email":"","company":"","role":"","readyForCheckout":true/false}|||

If you don't have a data point yet, omit it from the JSON. Only include what the user has explicitly shared.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: systemPrompt,
        messages: messages || []
      })
    });

    const data = await response.json();
    const fullText = data.content?.[0]?.text || '';

    // Extract qualification data
    let qualificationData = {};
    const match = fullText.match(/\|\|\|({.*?})\|\|\|/s);
    if (match) {
      try { qualificationData = JSON.parse(match[1]); } catch {}
    }

    // Clean response text (remove the JSON block)
    const cleanText = fullText.replace(/\|\|\|.*?\|\|\|/s, '').trim();

    return res.status(200).json({
      message: cleanText,
      qualification: qualificationData,
      productConfig: {
        displayName: productConfig.displayName,
        checkoutUrl: productConfig.checkoutUrl,
        demoUrl: productConfig.demoUrl,
        ctaLabel: productConfig.ctaLabel,
        pricing: productConfig.pricing
      }
    });

  } catch (err) {
    console.error('Qualify error:', err);
    return res.status(500).json({ error: 'Qualification failed', details: err.message });
  }
}
