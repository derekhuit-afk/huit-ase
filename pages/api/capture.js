const { writeLead } = require('../../lib/crmex');
const { sendImmediateWelcome } = require('../../lib/resend');
const { ICP_MAP, EMAIL_SEQUENCES } = require('../../lib/icp-map');

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      firstName, lastName, email, phone,
      company, role, product, qualificationScore,
      qualificationNotes, icpMatch, intent,
      utmSource, utmMedium, utmCampaign
    } = req.body;

    if (!email) return res.status(400).json({ error: 'Email required' });

    // Get product config
    const productConfig = ICP_MAP[product] || ICP_MAP['DEFAULT'];
    const sequenceConfig = EMAIL_SEQUENCES[productConfig.emailSequence] || EMAIL_SEQUENCES['general'];

    // Write to CRMEX
    const leadData = {
      firstName, lastName, email, phone,
      company, role, product: product || 'UNKNOWN',
      source: utmSource || 'widget',
      qualificationScore: qualificationScore || 0,
      qualificationNotes: qualificationNotes || '',
      icpMatch: icpMatch || false,
      intent: intent || 'unknown',
      utmSource, utmMedium, utmCampaign,
      ipAddress: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    const { success, lead, error: writeError } = await writeLead(leadData);

    // Send immediate welcome email regardless of DB write
    const emailResult = await sendImmediateWelcome(
      { first_name: firstName, last_name: lastName, email, company },
      productConfig,
      sequenceConfig
    );

    return res.status(200).json({
      success: true,
      leadId: lead?.id,
      emailSent: emailResult.success,
      checkoutUrl: productConfig.checkoutUrl,
      demoUrl: productConfig.demoUrl,
      message: `Lead captured for ${productConfig.displayName}`
    });

  } catch (err) {
    console.error('Capture error:', err);
    return res.status(500).json({ error: 'Internal error', details: err.message });
  }
}
