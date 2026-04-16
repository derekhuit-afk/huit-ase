// ASE: pages/api/send-touchpoints.js
// Daily cron — sends all outbound_touchpoints where status='scheduled' and scheduled_at <= now
// This fires Email 2, 3, 4, 5 for every prospect already in the sequence
// Called by Vercel Cron daily at 9AM Alaska time

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vvkdnzqgtajeouxlliuk.supabase.co';
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_KEY = process.env.ASE_ADMIN_KEY;
const FROM_EMAIL = 'Derek Huit <derek@huit.ai>';

async function sb(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1${path}`, {
    ...opts,
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json',
      Prefer: opts.prefer || 'return=minimal',
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: text }; }
}

// Sequence step copy by step number and persona
const STEP_COPY = {
  mortgage_lo: [
    null, // step 0 handled by run-sequences
    { subject: 'What 142,000 Alaska loans revealed about top LO performance',
      body: `Hi {firstName},\n\nFollowing up on my last note.\n\nI've spent the past year analyzing 7 years of HMDA data covering 142,000 Alaska mortgage transactions. The LOs in the top 10% of production all share one behavior pattern: they close loans 12 days faster on average by having a pipeline system that flags pre-qual stalls before they become dead leads.\n\nCRMEX was built around that insight. It's not just a CRM — it's a production intelligence layer.\n\nWorth 20 minutes to see it?\n\nBest,\nDerek` },
    { subject: 'Quick question about your pipeline',
      body: `Hi {firstName},\n\nQuick one — what's the biggest bottleneck in your production right now?\n\na) Pre-qual volume is inconsistent\nb) Referral partners aren't sending enough\nc) Admin work is eating my origination time\nd) Pipeline falls through between pre-qual and application\n\nJust reply with a letter and I'll send you the specific way CRMEX addresses it.\n\nDerek` },
    { subject: 'Real numbers from CRMEX customers',
      body: `Hi {firstName},\n\nOur customers tell us three things:\n\n1. They spend 40% less time on compliance documentation\n2. Their referral partner relationships are measurably stronger because CRMEX auto-flags when a partner goes quiet\n3. They catch pre-qual stalls 2 weeks earlier than before\n\nOne LO told us last month: "I closed 4 loans in January that I would have lost without CRMEX flagging the pipeline." At average Alaska loan sizes, that's a significant production difference.\n\nWould a 20-minute demo make sense this week?\n\nDerek` },
    { subject: 'Last note from Derek',
      body: `Hi {firstName},\n\nI've reached out a few times and don't want to keep interrupting your day. This will be my last note.\n\nIf CRMEX ever becomes relevant — whether you're looking for a better production system, feeling buried in admin work, or just want to see what 7 years of Alaska HMDA data looks like — I'd love to show you.\n\nBook a 20-minute call anytime: https://crmex.huit.ai/demo\n\nWishing you a great production year.\n\nDerek Huit\nFounder, Huit.AI\n18 years · $1B funded` },
  ],
  branch_manager: [
    null,
    { subject: 'The hidden cost of LO turnover in Alaska',
      body: `Hi {firstName},\n\nFollowing up on my earlier note about APEX.\n\nThe cost of losing a producing LO isn't just the gap in volume. It's the 3–6 months before a replacement ramps to production, the pipeline that walks out the door, and the morale impact on the remaining team.\n\nOur model shows most branches lose one LO per year they could have retained with early intervention. At $80K–$150K per departure, APEX pays for itself before the end of the first month.\n\nDerek` },
    { subject: 'APEX found something in your market this week',
      body: `Hi {firstName},\n\nRunning APEX across the Alaska market right now and a few branch managers have asked me to flag what we're seeing: several LOs at mid-tier lenders in Anchorage scored above 70 on our TLS (Transition Likelihood Score) this week.\n\nThat means they're statistically likely to move in the next 60–90 days.\n\nIf you're looking to add production talent, these are the prospects worth pursuing first.\n\nWant the full list? It's included in the APEX Scout tier.\n\nDerek` },
    { subject: '5 minutes — your branch risk profile',
      body: `Hi {firstName},\n\nNo sales call needed. Drop the names of your top 5 producing LOs in reply and I'll run their TLS scores manually. Free, no commitment.\n\nYou'll see exactly which of your top producers is showing mobility signals — and which ones are locked in.\n\nDerek` },
    { subject: 'Closing this thread',
      body: `Hi {firstName},\n\nLast note — I appreciate your time.\n\nIf LO retention, recruitment intelligence, or branch analytics ever becomes a priority, APEX is at https://apex.huit.ai.\n\nWishing you a strong production year.\n\nDerek` },
  ],
  women_founder: [
    null,
    { subject: 'The grants most Alaska women founders miss',
      body: `Hi {firstName},\n\nFollowing up on my note about FoundHer Grants.\n\nThe three most underapplied funding sources for Alaska women founders:\n\n1. **AIDEA (Alaska Industrial Development Authority)** — gap financing and business development grants most founders don't know exist\n2. **SBDC Women's Business Center grants** — often under $25K but fast and uncomplicated\n3. **Tribal Economic Development grants** — available to all Alaska businesses, not just tribal members\n\nFoundHer has 3,255 grants in total, filtered by business type and state. Run a free match scan at foundhergrants.com.\n\nBest,\nFoundHer Team` },
    { subject: 'No application required — see your matches in 2 minutes',
      body: `Hi {firstName},\n\nWanted to make this as easy as possible.\n\nGo to foundhergrants.com, enter your business type, and you'll see your top 10 grant matches in under 2 minutes. No application, no credit card, no commitment.\n\nMost women founders who run the scan find 3–7 grants they weren't aware of.\n\nDerek & the FoundHer team` },
    { subject: 'Grant deadline coming up — wanted to flag this',
      body: `Hi {firstName},\n\nQuick heads up — there are several grant cycles closing in the next 30 days that are strong matches for women-owned businesses in Alaska.\n\nIf you run a match scan at foundhergrants.com this week, you'll see which ones apply to your business type with enough runway to apply before the deadline.\n\nJust didn't want you to miss it.\n\nDerek` },
    { subject: 'Last note from the FoundHer team',
      body: `Hi {firstName},\n\nThis is our last note. We don't want to keep filling your inbox.\n\nIf you ever want help finding non-dilutive funding for your business, foundhergrants.com has 3,255 grants and a free match tool.\n\nWishing you and your business the best.\n\nThe FoundHer Grants Team` },
  ],
};

function buildFollowUpEmail(prospect, stepContent, stepIndex) {
  const firstName = prospect.first_name || prospect.full_name?.split(' ')[0] || 'there';
  const body = (stepContent.body || '').replace(/{firstName}/g, firstName);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;background:#f8fafc;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
        <tr><td style="padding-bottom:20px;">
          <span style="color:#0ea5e9;font-size:11px;font-weight:700;letter-spacing:3px;">HUIT.AI</span>
          <span style="color:#94a3b8;font-size:11px;margin-left:8px;">Built From Alaska</span>
        </td></tr>
        <tr><td style="background:#fff;border-radius:12px;padding:40px;border:1px solid #e2e8f0;">
          <div style="font-size:15px;color:#1e293b;line-height:1.9;white-space:pre-wrap;">${body}</div>
        </td></tr>
        <tr><td style="padding:20px 0;font-size:12px;color:#94a3b8;">
          Huit.AI · Anchorage, Alaska ·
          <a href="https://huit.ai/unsubscribe?email=${encodeURIComponent(prospect.email || '')}" style="color:#94a3b8;">Unsubscribe</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = req.headers['x-ase-key'] || req.query.key;
  const isCron = req.headers['authorization'] === `Bearer ${process.env.CRON_SECRET}`;
  if (key !== ADMIN_KEY && !isCron) return res.status(401).json({ error: 'Unauthorized' });

  const now = new Date().toISOString();
  const startTime = Date.now();

  // Get all scheduled touchpoints that are due
  const tpRes = await sb(
    `/outbound_touchpoints?status=eq.scheduled&scheduled_at=lte.${encodeURIComponent(now)}&select=*,outbound_prospects(*)&limit=50`
  );
  const touchpoints = Array.isArray(tpRes.data) ? tpRes.data : [];

  if (touchpoints.length === 0) {
    return res.status(200).json({ success: true, sent: 0, message: 'No scheduled touchpoints due', duration_ms: Date.now() - startTime });
  }

  let sent = 0, errors = 0;
  const results = [];

  for (const tp of touchpoints) {
    const prospect = tp.outbound_prospects || {};
    if (!prospect.email || prospect.opted_out) {
      errors++;
      continue;
    }

    try {
      const persona = prospect.persona || 'mortgage_lo';
      // Determine step index from existing touchpoints
      const stepRes = await sb(
        `/outbound_touchpoints?prospect_id=eq.${prospect.id}&status=eq.sent&order=sent_at.asc`
      );
      const sentCount = Array.isArray(stepRes.data) ? stepRes.data.length : 0;
      const stepIndex = sentCount; // 0-indexed: sentCount = number already sent

      const steps = STEP_COPY[persona] || STEP_COPY.mortgage_lo;
      const stepContent = steps[stepIndex] || steps[steps.length - 1];
      if (!stepContent) { errors++; continue; }

      const html = buildFollowUpEmail(prospect, stepContent, stepIndex);

      const sendResult = await resend.emails.send({
        from: FROM_EMAIL,
        to: prospect.email,
        subject: stepContent.subject,
        html,
        reply_to: 'derek@huit.ai',
        tags: [
          { name: 'persona', value: persona },
          { name: 'step', value: `email_${stepIndex + 1}` },
          { name: 'prospect_id', value: prospect.id },
        ],
      });

      if (sendResult.error) throw new Error(sendResult.error.message);

      // Update touchpoint to sent
      await sb(`/outbound_touchpoints?id=eq.${tp.id}`, {
        method: 'PATCH',
        prefer: 'return=minimal',
        body: JSON.stringify({
          status: 'sent',
          sent_at: new Date().toISOString(),
          provider_message_id: sendResult.data?.id,
        }),
      });

      sent++;
      results.push({ name: prospect.full_name, email: prospect.email, subject: stepContent.subject, step: stepIndex + 1 });
      await new Promise(r => setTimeout(r, 1000));

    } catch (err) {
      errors++;
      await sb(`/outbound_touchpoints?id=eq.${tp.id}`, {
        method: 'PATCH',
        prefer: 'return=minimal',
        body: JSON.stringify({ status: 'error', error_message: err.message }),
      });
    }
  }

  return res.status(200).json({
    success: true,
    sent,
    errors,
    results,
    duration_ms: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  });
}
