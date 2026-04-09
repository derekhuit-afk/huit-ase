import { useState, useEffect } from 'react';
import Head from 'next/head';

const BRAND = '#0ea5e9';
const DARK = '#0f172a';
const SURFACE = '#1e293b';
const TEXT = '#f1f5f9';
const MUTED = '#64748b';

const PRODUCTS = ['CRMEX','APEX','ZenoPay','LeadQualifier','ContentLoop','AskAlaskaMortgage','DEFAULT'];

export default function Outbound() {
  const [tab, setTab] = useState('prospects');
  const [product, setProduct] = useState('CRMEX');
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [scripts, setScripts] = useState({});
  const [scriptType, setScriptType] = useState('linkedin');
  const [sent, setSent] = useState([]);
  const [limit, setLimit] = useState(20);
  const KEY = 'huit-ase-admin-2026';

  async function loadProspects() {
    setLoading(true);
    try {
      const r = await fetch(`/api/prospect?product=${product}&limit=${limit}&preview=true`, {
        headers: { 'x-ase-key': KEY }
      });
      const d = await r.json();
      setProspects(d.prospects || []);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  async function generateScript(company, loanCount) {
    setGenerating(true);
    try {
      const r = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-ase-key': KEY },
        body: JSON.stringify({ type: scriptType, company, loanCount, product })
      });
      const d = await r.json();
      setScripts(prev => ({ ...prev, [company]: d.content }));
    } catch(e) { console.error(e); }
    setGenerating(false);
  }

  async function sendOutbound(prospect) {
    const email = prompt(`Enter email for ${prospect.company}:`);
    if (!email || !email.includes('@')) return;

    // Generate personalized email first
    const r = await fetch(`/api/prospect?product=${product}&limit=1`, {
      headers: { 'x-ase-key': KEY }
    });
    const d = await r.json();
    const preview = d.emailPreviews?.[0];

    if (!preview) { alert('Could not generate email. Try again.'); return; }

    const lines = preview.email.split('\n');
    const subject = lines[0].replace('SUBJECT:', '').trim();
    const body = lines.slice(2).join('\n').trim();

    const sendR = await fetch('/api/outbound', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-ase-key': KEY },
      body: JSON.stringify({
        to: email, company: prospect.company,
        product, subject, emailBody: body,
        loanCount: prospect.loanCount
      })
    });
    const sendD = await sendR.json();
    if (sendD.success) {
      setSent(prev => [...prev, prospect.company]);
      alert(`✅ Sent to ${email}`);
    }
  }

  return (
    <>
      <Head>
        <title>Outbound Engine — Huit.AI ASE</title>
        <meta name="robots" content="noindex" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#030712', color: TEXT, fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* Header */}
        <div style={{ background: DARK, borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: BRAND, fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>HUIT.AI ASE</div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Outbound Prospecting Engine</h1>
            <p style={{ margin: '4px 0 0', color: MUTED, fontSize: 13 }}>HMDA-powered cold outreach · Phase 3</p>
          </div>
          <a href="/" style={{ color: MUTED, fontSize: 13, textDecoration: 'none' }}>← Back to Dashboard</a>
        </div>

        <div style={{ padding: '32px 40px' }}>

          {/* Controls */}
          <div style={{ background: DARK, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Target Product</label>
              <select value={product} onChange={e => setProduct(e.target.value)}
                style={{ background: SURFACE, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: TEXT, padding: '10px 14px', fontSize: 14, outline: 'none' }}>
                {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Prospects</label>
              <select value={limit} onChange={e => setLimit(e.target.value)}
                style={{ background: SURFACE, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: TEXT, padding: '10px 14px', fontSize: 14, outline: 'none' }}>
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} prospects</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Script Type</label>
              <select value={scriptType} onChange={e => setScriptType(e.target.value)}
                style={{ background: SURFACE, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: TEXT, padding: '10px 14px', fontSize: 14, outline: 'none' }}>
                <option value="linkedin">LinkedIn</option>
                <option value="voice">Voice Script</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <button onClick={loadProspects} disabled={loading}
              style={{ background: BRAND, border: 'none', borderRadius: 8, color: 'white', padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Loading...' : '🎯 Find Prospects'}
            </button>
          </div>

          {/* Stats bar */}
          {prospects.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Prospects Found', value: prospects.length, color: BRAND },
                { label: 'Emails Sent', value: sent.length, color: '#22c55e' },
                { label: 'Data Source', value: 'HMDA 2024', color: '#a78bfa' }
              ].map(s => (
                <div key={s.label} style={{ background: DARK, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Prospect table */}
          {prospects.length > 0 && (
            <div style={{ background: DARK, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
                  {product} Prospects <span style={{ color: MUTED, fontWeight: 400 }}>— HMDA-sourced · Alaska Market</span>
                </h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Company', 'Loan Volume', 'Source', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: MUTED, fontWeight: 600, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {prospects.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: sent.includes(p.company) ? 'rgba(34,197,94,0.05)' : 'transparent' }}>
                        <td style={{ padding: '14px 16px', color: TEXT, fontWeight: 500 }}>
                          {sent.includes(p.company) && <span style={{ color: '#22c55e', marginRight: 6 }}>✓</span>}
                          {p.company}
                        </td>
                        <td style={{ padding: '14px 16px', color: BRAND, fontFamily: 'monospace', fontWeight: 700 }}>
                          {p.loanCount ? `${p.loanCount.toLocaleString()} loans` : '—'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600 }}>{p.source}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => generateScript(p.company, p.loanCount)} disabled={generating}
                              style={{ background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)', color: BRAND, borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                              {generating ? '...' : `Generate ${scriptType}`}
                            </button>
                            <button onClick={() => sendOutbound(p)} disabled={sent.includes(p.company)}
                              style={{ background: sent.includes(p.company) ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${sent.includes(p.company) ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.3)'}`, color: '#22c55e', borderRadius: 6, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: sent.includes(p.company) ? 'not-allowed' : 'pointer', opacity: sent.includes(p.company) ? 0.5 : 1 }}>
                              {sent.includes(p.company) ? 'Sent ✓' : 'Send Email'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Generated scripts */}
          {Object.keys(scripts).length > 0 && (
            <div style={{ marginTop: 24, background: DARK, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600 }}>Generated Scripts</h3>
              {Object.entries(scripts).map(([company, content]) => (
                <div key={company} style={{ marginBottom: 20, background: SURFACE, borderRadius: 10, padding: 20 }}>
                  <div style={{ color: BRAND, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>{company}</div>
                  <pre style={{ margin: 0, color: '#cbd5e1', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{content}</pre>
                  <button onClick={() => navigator.clipboard?.writeText(content)}
                    style={{ marginTop: 12, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: MUTED, borderRadius: 6, padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>
                    Copy
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {prospects.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: MUTED }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📡</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>HMDA Prospector Ready</div>
              <div style={{ fontSize: 14 }}>Select a product and click Find Prospects to pull from your 142K HMDA record dataset.</div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
