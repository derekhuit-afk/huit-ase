import { useState } from 'react';
import Head from 'next/head';

const BRAND = '#0ea5e9';
const GREEN = '#22c55e';
const PURPLE = '#8b5cf6';
const GOLD = '#f59e0b';

const STEPS = [
  { id: 'email_1', label: 'Email 1', sublabel: 'Cold Opener', day: 'Day 1', color: BRAND, icon: '📧' },
  { id: 'email_2', label: 'Email 2', sublabel: 'Value Deepener', day: 'Day 4', color: GREEN, icon: '📩' },
  { id: 'sms', label: 'SMS', sublabel: '2-Part Sequence', day: 'Day 7', color: PURPLE, icon: '💬' },
  { id: 'call_script', label: 'Call Script', sublabel: '60-Sec Voice', day: 'Day 10', color: GOLD, icon: '📞' },
];

const MARKETS = ['Alaska', 'Pacific Northwest', 'Mountain West', 'Southeast', 'Midwest', 'Northeast', 'Southwest', 'National'];
const PRODUCTS = ['Huit.AI Full Platform', 'CRMEX', 'APEX Intelligence', 'ContentLoop', 'HyperLoanAI', 'ZenoPay'];

export default function ChainPage() {
  const [form, setForm] = useState({
    prospectName: '', company: '', loanCount: '', market: 'Alaska',
    productLine: 'Huit.AI Full Platform', recruiterName: 'Derek Huit', goal: 'recruit to Cardinal Financial + Huit.AI platform'
  });
  const [sequence, setSequence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState('email_1');
  const [copied, setCopied] = useState('');
  const [progress, setProgress] = useState(0);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleGenerate = async () => {
    if (!form.prospectName || !form.company) return;
    setLoading(true); setSequence(null); setProgress(0);

    const interval = setInterval(() => setProgress(p => Math.min(p + 2, 92)), 400);

    try {
      const res = await fetch('/api/chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSequence(data.sequence);
        setActiveStep('email_1');
        setProgress(100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const copyStep = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const copyAll = () => {
    if (!sequence) return;
    const all = STEPS.map(s => `=== ${s.label} — ${s.sublabel} (${s.day}) ===\n\n${sequence[s.id]?.content || ''}`).join('\n\n\n');
    navigator.clipboard.writeText(all);
    setCopied('all');
    setTimeout(() => setCopied(''), 2000);
  };

  const inputStyle = { width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', color: '#f1f5f9', fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: "'Space Grotesk', sans-serif" };
  const labelStyle = { fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };

  return (
    <>
      <Head>
        <title>ASE Chain Builder — Huit.AI</title>
        <meta name="robots" content="noindex" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: '100vh', background: '#030712', color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif" }}>

        {/* Header */}
        <div style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/" style={{ color: '#64748b', fontSize: 12, textDecoration: 'none' }}>← Dashboard</a>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
            <div>
              <div style={{ color: BRAND, fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 }}>HUIT.AI · ASE</div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Chained Sequence Builder</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN, boxShadow: `0 0 8px ${GREEN}` }} />
            <span style={{ fontSize: 11, color: '#64748b' }}>AI Chain Engine</span>
          </div>
        </div>

        {/* Progress bar */}
        {loading && (
          <div style={{ height: 2, background: '#0f172a' }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg, ${BRAND}, ${GREEN})`, width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', minHeight: 'calc(100vh - 65px)' }}>

          {/* Left Panel — Config */}
          <div style={{ background: '#0a1628', borderRight: '1px solid rgba(255,255,255,0.06)', padding: 28, overflowY: 'auto' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Prospect Profile</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { key: 'prospectName', label: 'Full Name *', placeholder: 'e.g. Katie Sindorf' },
                  { key: 'company', label: 'Current Company *', placeholder: 'e.g. Amped Mortgage' },
                  { key: 'loanCount', label: 'Loan Volume', placeholder: 'e.g. 87 (last 12 months)' },
                  { key: 'recruiterName', label: 'Recruiter Name', placeholder: 'e.g. Derek Huit' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={labelStyle}>{f.label}</label>
                    <input value={form[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} style={inputStyle} />
                  </div>
                ))}

                <div>
                  <label style={labelStyle}>Market</label>
                  <select value={form.market} onChange={e => set('market', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {MARKETS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Product Line</label>
                  <select value={form.productLine} onChange={e => set('productLine', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Goal</label>
                  <textarea value={form.goal} onChange={e => set('goal', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
                </div>
              </div>
            </div>

            {/* Sequence map */}
            <div style={{ background: '#030712', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Sequence Map</div>
              <div style={{ position: 'relative' }}>
                {STEPS.map((s, i) => (
                  <div key={s.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.color + '20', border: `2px solid ${s.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: sequence ? s.color : '#f1f5f9' }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{s.sublabel} · {s.day}</div>
                      </div>
                      {sequence && sequence[s.id] && <div style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN }} />}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ marginLeft: 17, width: 2, height: 16, background: 'rgba(255,255,255,0.06)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!form.prospectName || !form.company || loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: form.prospectName && form.company && !loading ? `linear-gradient(135deg, ${BRAND} 0%, ${GREEN} 100%)` : '#1e293b',
                color: form.prospectName && form.company && !loading ? '#000' : '#475569',
                fontWeight: 800, fontSize: 14, cursor: form.prospectName && form.company && !loading ? 'pointer' : 'not-allowed',
                fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.02em',
              }}
            >
              {loading ? `⚡ Building Chain (${progress}%)...` : '⚡ Generate Full Sequence'}
            </button>
          </div>

          {/* Right Panel — Output */}
          <div style={{ padding: 28, overflowY: 'auto' }}>
            {!sequence && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16, opacity: 0.4 }}>
                <div style={{ fontSize: 48 }}>⛓️</div>
                <div style={{ fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 1.6 }}>
                  Fill in prospect info on the left<br />and hit Generate to build your<br />4-step chained sequence.
                </div>
              </div>
            )}

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 20 }}>
                <div style={{ position: 'relative', width: 64, height: 64 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', border: `3px solid ${BRAND}30`, borderTopColor: BRAND, animation: 'spin 0.9s linear infinite' }} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Building 4-step chain...</div>
                  <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center' }}>
                    Each step is contextually linked to the last.<br />Claude is writing a full sequence for {form.prospectName}.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {STEPS.map((s, i) => (
                    <div key={s.id} style={{ width: 8, height: 8, borderRadius: '50%', background: progress > i * 24 ? s.color : '#1e293b', transition: 'background 0.3s' }} />
                  ))}
                </div>
              </div>
            )}

            {sequence && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>Sequence for {form.prospectName}</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>4-Step Chained Outreach</div>
                  </div>
                  <button
                    onClick={copyAll}
                    style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${copied === 'all' ? GREEN + '50' : 'rgba(255,255,255,0.08)'}`, background: copied === 'all' ? GREEN + '15' : '#0f172a', color: copied === 'all' ? GREEN : '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {copied === 'all' ? '✓ All Copied' : '⎘ Copy All'}
                  </button>
                </div>

                {/* Step tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                  {STEPS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setActiveStep(s.id)}
                      style={{
                        padding: '8px 16px', borderRadius: 10, border: `1px solid ${activeStep === s.id ? s.color + '60' : 'rgba(255,255,255,0.06)'}`,
                        background: activeStep === s.id ? s.color + '15' : '#0f172a',
                        color: activeStep === s.id ? s.color : '#64748b',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif",
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}
                    >
                      <span>{s.icon}</span>{s.label}
                      <span style={{ fontSize: 10, opacity: 0.7 }}>· {s.day}</span>
                    </button>
                  ))}
                </div>

                {/* Active step content */}
                {STEPS.filter(s => s.id === activeStep).map(s => (
                  <div key={s.id} style={{ background: '#0a1628', borderRadius: 16, border: `1px solid ${s.color}25`, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${s.color}15` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 20 }}>{s.icon}</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.label} — {s.sublabel}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>Send on {s.day} of sequence</div>
                        </div>
                      </div>
                      <button
                        onClick={() => copyStep(s.id, sequence[s.id]?.content || '')}
                        style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${copied === s.id ? s.color + '50' : 'rgba(255,255,255,0.08)'}`, background: copied === s.id ? s.color + '15' : '#030712', color: copied === s.id ? s.color : '#94a3b8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {copied === s.id ? '✓ Copied' : '⎘ Copy'}
                      </button>
                    </div>
                    <div style={{ padding: 20, fontSize: 13, lineHeight: 1.8, color: '#cbd5e1', whiteSpace: 'pre-wrap', maxHeight: 480, overflowY: 'auto' }}>
                      {sequence[s.id]?.content || 'No content generated.'}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; } select option { background: #0f172a; }`}</style>
    </>
  );
}
