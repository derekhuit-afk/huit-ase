const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

function renderTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
}

function buildEmailHTML(sequence, step, vars, productConfig) {
  const { subject } = sequence[step];
  const brandColor = '#0ea5e9';
  const darkBg = '#0f172a';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${renderTemplate(subject, vars)}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:${darkBg};padding:32px 40px;border-radius:12px 12px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="color:${brandColor};font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">HUIT.AI</span>
                    <br>
                    <span style="color:#94a3b8;font-size:11px;letter-spacing:1px;">BUILT FROM ALASKA</span>
                  </td>
                  <td align="right">
                    <span style="color:#334155;font-size:11px;">${productConfig.displayName}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:48px 40px;">
              <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;color:#0f172a;line-height:1.3;">
                ${getEmailBody(step, vars, productConfig).headline}
              </h1>
              <p style="margin:0 0 20px;font-size:16px;color:#475569;line-height:1.7;">
                ${getEmailBody(step, vars, productConfig).body}
              </p>
              
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="background:${brandColor};border-radius:8px;padding:16px 32px;">
                    <a href="${productConfig.checkoutUrl}?utm_source=email&utm_medium=sequence&utm_campaign=${step}" 
                       style="color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">
                      ${productConfig.ctaLabel} →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
                Or <a href="${productConfig.demoUrl}" style="color:${brandColor};text-decoration:none;">schedule a 20-minute demo</a> 
                to see ${productConfig.displayName} in action.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                You're receiving this because you expressed interest in ${productConfig.displayName}.<br>
                Huit.AI, Inc. · Anchorage, Alaska · 
                <a href="https://huit.ai/unsubscribe?email=${encodeURIComponent(vars.email || '')}" 
                   style="color:#94a3b8;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getEmailBody(step, vars, productConfig) {
  const name = vars.firstName || 'there';
  const product = productConfig.displayName;
  const price = productConfig.pricing;

  const bodies = {
    immediate: {
      headline: `${name}, you're one step from ${product}.`,
      body: `Thanks for your interest in ${product}. You're joining a growing group of professionals who are using Huit.AI to operate smarter, move faster, and win more business — without adding headcount.<br><br>
      Your access is ready. Click below to get started at ${price}.`
    },
    day1: {
      headline: `Here's what ${product} looks like in the first 30 days.`,
      body: `Most of our customers see measurable impact within their first week. The setup takes less than an hour, and the intelligence starts flowing immediately.<br><br>
      We built ${product} specifically for professionals in your space — people who don't have time for complex tools that require consultants and training programs.<br><br>
      <strong>What you get from day one:</strong><br>
      • ${productConfig.painPoints[0] || 'Immediate operational intelligence'}<br>
      • ${productConfig.painPoints[1] || 'Automated workflows running 24/7'}<br>
      • ${productConfig.painPoints[2] || 'Data-driven decision making'}`
    },
    day3: {
      headline: `${name}, your window to act is narrowing.`,
      body: `The professionals in your market who move on AI tools first will have a compounding advantage that gets harder to overcome every month.<br><br>
      ${product} at ${price} is designed to generate returns that dwarf the monthly cost — typically within the first 60 days.<br><br>
      What's holding you back? Reply to this email and I'll personally make sure your questions are answered.`
    },
    day7: {
      headline: `Last note from us, ${name}.`,
      body: `We don't want to fill your inbox. This is our last outreach before we remove you from this sequence.<br><br>
      If now isn't the right time, no problem. But if you're serious about what ${product} can do for your business, the time to act is before your competitors do.<br><br>
      <strong>Ready when you are.</strong>`
    }
  };

  return bodies[step] || bodies.immediate;
}

async function sendSequenceEmail(step, lead, productConfig, sequenceConfig) {
  const vars = {
    firstName: lead.first_name || 'there',
    lastName: lead.last_name || '',
    email: lead.email,
    company: lead.company || 'your company',
    productName: productConfig.displayName,
    grantCount: '47' // default for FoundHer
  };

  const sequence = sequenceConfig;
  if (!sequence || !sequence[step]) return { success: false, error: 'No sequence config' };

  const subject = renderTemplate(sequence[step].subject, vars);
  const html = buildEmailHTML(sequence, step, vars, productConfig);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Derek Huit <derek@huit.ai>',
      to: lead.email,
      subject,
      html
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    console.error('Resend error:', err);
    return { success: false, error: err.message };
  }
}

async function sendImmediateWelcome(lead, productConfig, sequenceConfig) {
  return sendSequenceEmail('immediate', lead, productConfig, sequenceConfig);
}

module.exports = { sendSequenceEmail, sendImmediateWelcome, renderTemplate };
