import { useState, useEffect } from 'react';
import Head from 'next/head';

const BRAND = '#0ea5e9';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLeads() {
    try {
      const res = await fetch('/api/leads', {
        headers: { 'x-ase-key': process.env.NEXT_PUBLIC_ASE_ADMIN_KEY || 'huit-ase-admin-2026' }
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = data?.leads?.filter(l => filter === 'all' || l.product === filter) || [];
  const products = [...new Set(data?.leads?.map(l => l.product) || [])];

  return (
    <>
      <Head>
        <title>ASE Command Center — Huit.AI</title>
        <meta name="robots" content="noindex" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#030712', color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif", padding: '0' }}>
        
        {/* Header */}
        <div style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: BRAND, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>HUIT.AI</div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>Autonomous Sales Engine</h1>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Real-time lead intelligence across all products</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>LIVE REFRESH</div>
            <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', marginLeft: 'auto', boxShadow: '0 0 8px #22c55e' }}></div>
          </div>
        </div>

        <div style={{ padding: '32px 40px' }}>

          {/* Stats */}
          {data?.stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Total Leads', value: data.stats.total, color: BRAND },
                { label: 'Last 24 Hours', value: data.stats.recent24h, color: '#22c55e' },
                { label: 'Hot Intent', value: data.stats.byIntent?.hot || 0, color: '#f59e0b' },
                { label: 'Products Active', value: Object.keys(data.stats.byProduct || {}).length, color: '#a78bfa' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Product breakdown */}
          {data?.stats?.byProduct && Object.keys(data.stats.byProduct).length > 0 && (
            <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 600, color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' }}>Leads by Product</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {Object.entries(data.stats.byProduct).sort((a, b) => b[1] - a[1]).map(([product, count]) => (
                  <div key={product} onClick={() => setFilter(filter === product ? 'all' : product)}
                    style={{ background: filter === product ? BRAND : 'rgba(255,255,255,0.04)', border: `1px solid ${filter === product ? BRAND : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, color: filter === product ? 'white' : '#cbd5e1', fontWeight: 600 }}>{product}</span>
                    <span style={{ fontSize: 11, background: 'rgba(0,0,0,0.3)', borderRadius: 4, padding: '2px 6px', color: filter === product ? 'white' : '#64748b', fontFamily: 'monospace' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lead table */}
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>
                {filter === 'all' ? 'All Leads' : filter} 
                <span style={{ color: '#64748b', fontWeight: 400, marginLeft: 8 }}>({filtered.length})</span>
              </h3>
              {filter !== 'all' && (
                <button onClick={() => setFilter('all')} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>
                  Clear filter
                </button>
              )}
            </div>

            {loading && (
              <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>Loading lead data...</div>
            )}

            {error && (
              <div style={{ padding: 48, textAlign: 'center', color: '#ef4444' }}>
                {error === 'Unauthorized' ? 'Set your ASE admin key to view leads.' : error}
              </div>
            )}

            {!loading && filtered.length === 0 && !error && (
              <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
                <div>No leads yet. The engine is live and listening.</div>
              </div>
            )}

            {filtered.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Name', 'Email', 'Product', 'Score', 'Intent', 'Status', 'Time'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((lead, i) => (
                      <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td style={{ padding: '14px 16px', color: '#f1f5f9', fontWeight: 500 }}>
                          {[lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#94a3b8', fontFamily: 'monospace', fontSize: 12 }}>{lead.email || '—'}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: 'rgba(14,165,233,0.1)', color: BRAND, borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>{lead.product}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ color: lead.qualification_score >= 70 ? '#22c55e' : lead.qualification_score >= 40 ? '#f59e0b' : '#ef4444', fontWeight: 700, fontFamily: 'monospace' }}>
                            {lead.qualification_score || 0}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: lead.intent === 'hot' ? 'rgba(239,68,68,0.1)' : lead.intent === 'warm' ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,139,0.1)', color: lead.intent === 'hot' ? '#ef4444' : lead.intent === 'warm' ? '#f59e0b' : '#64748b', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                            {lead.intent || 'cold'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ color: lead.status === 'new' ? '#22c55e' : '#64748b', fontSize: 12 }}>{lead.status || 'new'}</span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: 11, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          {new Date(lead.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
