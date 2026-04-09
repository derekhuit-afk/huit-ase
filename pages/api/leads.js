const { getLeads } = require('../../lib/crmex');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Simple API key check
  const apiKey = req.headers['x-ase-key'];
  if (apiKey !== process.env.ASE_ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { product, status, limit } = req.query;
    const { data, error } = await getLeads({
      product: product || null,
      status: status || null,
      limit: parseInt(limit) || 100
    });

    if (error) return res.status(500).json({ error: error.message });

    // Aggregate stats
    const stats = {
      total: data?.length || 0,
      byProduct: {},
      byStatus: {},
      byIntent: {},
      recent24h: 0
    };

    const now = Date.now();
    data?.forEach(lead => {
      stats.byProduct[lead.product] = (stats.byProduct[lead.product] || 0) + 1;
      stats.byStatus[lead.status] = (stats.byStatus[lead.status] || 0) + 1;
      stats.byIntent[lead.intent] = (stats.byIntent[lead.intent] || 0) + 1;
      if (now - new Date(lead.created_at).getTime() < 86400000) stats.recent24h++;
    });

    return res.status(200).json({ stats, leads: data });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
