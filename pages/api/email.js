const { sendSequenceEmail } = require('../../lib/resend');
const { ICP_MAP, EMAIL_SEQUENCES } = require('../../lib/icp-map');
const { updateLeadStatus } = require('../../lib/crmex');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { leadId, email, firstName, company, product, step } = req.body;
    if (!email || !step) return res.status(400).json({ error: 'email and step required' });

    const productConfig = ICP_MAP[product] || ICP_MAP['DEFAULT'];
    const sequenceConfig = EMAIL_SEQUENCES[productConfig.emailSequence] || EMAIL_SEQUENCES['general'];

    const lead = { first_name: firstName, email, company };
    const result = await sendSequenceEmail(step, lead, productConfig, sequenceConfig);

    if (leadId) {
      await updateLeadStatus(leadId, 'emailed', `Sequence step: ${step}`);
    }

    return res.status(200).json({ success: result.success, step });

  } catch (err) {
    console.error('Email sequence error:', err);
    return res.status(500).json({ error: err.message });
  }
}
