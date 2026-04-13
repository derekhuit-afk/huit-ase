/**
 * HUIT.AI AUTONOMOUS SALES ENGINE — EMBEDDABLE WIDGET
 * Version 1.0 | Built From Alaska
 * 
 * Usage: <script src="https://huit-ase-huitai.vercel.app/widget.js" data-product="CRMEX"></script>
 * Alt:   <script src="https://ase.huit.ai/widget.js" data-product="CRMEX"></script>
 */
(function () {
  const SCRIPT = document.currentScript;
  const PRODUCT = SCRIPT?.getAttribute('data-product') || 'DEFAULT';
  // Auto-detect ASE backend URL from the script's own src
  const SCRIPT_SRC = SCRIPT?.getAttribute('src') || '';
  const ASE_URL = SCRIPT_SRC ? new URL(SCRIPT_SRC).origin : 'https://huit-ase-huitai.vercel.app';
  const BRAND_COLOR = '#0ea5e9';
  const DARK = '#0f172a';
  const SURFACE = '#1e293b';
  const TEXT = '#f1f5f9';
  const MUTED = '#94a3b8';

  // Inject global styles
  const style = document.createElement('style');
  style.textContent = `
    #huit-ase-root * { box-sizing: border-box; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    #huit-ase-btn {
      position: fixed; bottom: 28px; right: 28px; z-index: 99998;
      width: 60px; height: 60px; border-radius: 50%;
      background: ${BRAND_COLOR}; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 32px rgba(14,165,233,0.4);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    #huit-ase-btn:hover { transform: scale(1.1); box-shadow: 0 12px 40px rgba(14,165,233,0.6); }
    #huit-ase-btn svg { width: 26px; height: 26px; fill: white; }
    #huit-ase-btn .huit-notif {
      position: absolute; top: -4px; right: -4px;
      width: 18px; height: 18px; background: #ef4444; border-radius: 50%;
      border: 2px solid white; font-size: 10px; font-weight: 700; color: white;
      display: flex; align-items: center; justify-content: center;
    }
    #huit-ase-panel {
      position: fixed; bottom: 100px; right: 28px; z-index: 99999;
      width: 380px; max-width: calc(100vw - 40px);
      background: ${DARK}; border-radius: 16px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.6); overflow: hidden;
      display: none; flex-direction: column;
      border: 1px solid rgba(255,255,255,0.08);
      animation: huit-slideUp 0.25s ease;
      max-height: 580px;
    }
    @keyframes huit-slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    #huit-ase-panel.open { display: flex; }
    .huit-header {
      background: ${SURFACE}; padding: 16px 20px;
      display: flex; align-items: center; gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .huit-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, ${BRAND_COLOR}, #6366f1);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; position: relative;
    }
    .huit-avatar::after {
      content: ''; position: absolute; bottom: 1px; right: 1px;
      width: 10px; height: 10px; background: #22c55e; border-radius: 50%;
      border: 2px solid ${SURFACE};
    }
    .huit-avatar svg { width: 20px; height: 20px; fill: white; }
    .huit-header-info { flex: 1; }
    .huit-header-name { color: ${TEXT}; font-size: 14px; font-weight: 600; margin: 0; }
    .huit-header-sub { color: ${MUTED}; font-size: 11px; margin: 2px 0 0; }
    .huit-close {
      background: none; border: none; cursor: pointer;
      color: ${MUTED}; padding: 4px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      transition: color 0.2s;
    }
    .huit-close:hover { color: ${TEXT}; }
    .huit-messages {
      flex: 1; overflow-y: auto; padding: 20px 16px;
      display: flex; flex-direction: column; gap: 12px;
      scroll-behavior: smooth;
    }
    .huit-messages::-webkit-scrollbar { width: 4px; }
    .huit-messages::-webkit-scrollbar-track { background: transparent; }
    .huit-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
    .huit-msg {
      display: flex; gap: 8px; align-items: flex-end;
      animation: huit-msgIn 0.2s ease;
    }
    @keyframes huit-msgIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .huit-msg.user { flex-direction: row-reverse; }
    .huit-bubble {
      max-width: 280px; padding: 10px 14px; border-radius: 16px;
      font-size: 14px; line-height: 1.5; color: ${TEXT};
    }
    .huit-msg.ai .huit-bubble { background: ${SURFACE}; border-bottom-left-radius: 4px; }
    .huit-msg.user .huit-bubble { background: ${BRAND_COLOR}; border-bottom-right-radius: 4px; }
    .huit-typing {
      display: flex; gap: 4px; padding: 12px 14px;
      background: ${SURFACE}; border-radius: 16px; border-bottom-left-radius: 4px;
      width: fit-content;
    }
    .huit-typing span {
      width: 6px; height: 6px; background: ${MUTED}; border-radius: 50%;
      animation: huit-bounce 1.2s ease infinite;
    }
    .huit-typing span:nth-child(2) { animation-delay: 0.2s; }
    .huit-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes huit-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }
    .huit-cta-card {
      margin: 8px 0; padding: 16px; border-radius: 12px;
      background: linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.1));
      border: 1px solid rgba(14,165,233,0.3);
    }
    .huit-cta-card p { color: ${MUTED}; font-size: 12px; margin: 0 0 12px; }
    .huit-cta-card .huit-btn-primary {
      display: block; width: 100%; text-align: center;
      background: ${BRAND_COLOR}; color: white; border: none;
      padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 700;
      cursor: pointer; text-decoration: none; margin-bottom: 8px;
      transition: background 0.2s;
    }
    .huit-cta-card .huit-btn-primary:hover { background: #0284c7; }
    .huit-cta-card .huit-btn-secondary {
      display: block; width: 100%; text-align: center;
      background: transparent; color: ${MUTED}; border: 1px solid rgba(255,255,255,0.1);
      padding: 8px 16px; border-radius: 8px; font-size: 12px;
      cursor: pointer; text-decoration: none; transition: color 0.2s;
    }
    .huit-cta-card .huit-btn-secondary:hover { color: ${TEXT}; }
    .huit-input-area {
      padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.06);
      display: flex; gap: 8px; align-items: flex-end;
    }
    .huit-input {
      flex: 1; background: ${SURFACE}; border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px; padding: 10px 14px; color: ${TEXT}; font-size: 14px;
      resize: none; max-height: 100px; outline: none; line-height: 1.4;
      transition: border-color 0.2s;
    }
    .huit-input::placeholder { color: ${MUTED}; }
    .huit-input:focus { border-color: rgba(14,165,233,0.5); }
    .huit-send {
      width: 38px; height: 38px; background: ${BRAND_COLOR}; border: none;
      border-radius: 10px; cursor: pointer; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
      transition: background 0.2s, transform 0.1s;
    }
    .huit-send:hover { background: #0284c7; }
    .huit-send:active { transform: scale(0.95); }
    .huit-send svg { width: 16px; height: 16px; fill: white; }
    .huit-powered {
      text-align: center; padding: 8px 0 4px;
      font-size: 10px; color: rgba(148,163,184,0.4);
      letter-spacing: 0.5px;
    }
    .huit-form-row { margin-bottom: 10px; }
    .huit-form-row label { display: block; color: ${MUTED}; font-size: 11px; font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .huit-form-input {
      width: 100%; background: ${SURFACE}; border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px; padding: 9px 12px; color: ${TEXT}; font-size: 14px; outline: none;
      transition: border-color 0.2s;
    }
    .huit-form-input:focus { border-color: rgba(14,165,233,0.5); }
    @media (max-width: 480px) {
      #huit-ase-panel { right: 12px; left: 12px; width: auto; bottom: 90px; }
      #huit-ase-btn { bottom: 20px; right: 20px; }
    }
  `;
  document.head.appendChild(style);

  // State
  let isOpen = false;
  let messages = [];
  let qualificationData = {};
  let captureMode = false;
  let captureStep = 0;
  let leadInfo = {};

  // Create DOM
  const root = document.createElement('div');
  root.id = 'huit-ase-root';

  root.innerHTML = `
    <button id="huit-ase-btn" aria-label="Chat with sales">
      <div class="huit-notif">1</div>
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
    </button>
    <div id="huit-ase-panel">
      <div class="huit-header">
        <div class="huit-avatar">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
        </div>
        <div class="huit-header-info">
          <p class="huit-header-name">AXIS Sales AI</p>
          <p class="huit-header-sub">● Online · Typically replies in seconds</p>
        </div>
        <button class="huit-close" id="huit-ase-close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="huit-messages" id="huit-ase-messages"></div>
      <div class="huit-input-area">
        <textarea class="huit-input" id="huit-ase-input" placeholder="Type your message..." rows="1"></textarea>
        <button class="huit-send" id="huit-ase-send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <p class="huit-powered">Powered by Huit.AI · Built From Alaska</p>
    </div>
  `;

  document.body.appendChild(root);

  const btn = document.getElementById('huit-ase-btn');
  const panel = document.getElementById('huit-ase-panel');
  const closeBtn = document.getElementById('huit-ase-close');
  const messagesEl = document.getElementById('huit-ase-messages');
  const input = document.getElementById('huit-ase-input');
  const sendBtn = document.getElementById('huit-ase-send');

  function toggle() {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    const notif = btn.querySelector('.huit-notif');
    if (notif) notif.remove();
    if (isOpen && messages.length === 0) initConversation();
  }

  btn.addEventListener('click', toggle);
  closeBtn.addEventListener('click', toggle);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  });

  sendBtn.addEventListener('click', handleSend);

  function addMessage(role, content, isHTML = false) {
    messages.push({ role, content });
    const msgEl = document.createElement('div');
    msgEl.className = `huit-msg ${role === 'user' ? 'user' : 'ai'}`;
    const bubble = document.createElement('div');
    bubble.className = 'huit-bubble';
    if (isHTML) bubble.innerHTML = content;
    else bubble.textContent = content;
    msgEl.appendChild(bubble);
    messagesEl.appendChild(msgEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'huit-msg ai';
    el.id = 'huit-typing';
    el.innerHTML = `<div class="huit-typing"><span></span><span></span><span></span></div>`;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function removeTyping() {
    document.getElementById('huit-typing')?.remove();
  }

  const ZENOPAY_CHECKOUT = 'https://app.zenopay.ai/api/public/checkout';

  function showCTA(productConfig, qualification) {
    const card = document.createElement('div');
    card.className = 'huit-cta-card';
    const isHot = qualification?.score >= 70 || qualification?.readyForCheckout;
    const tier = qualification?.suggestedTier || 'STARTER';
    const btnId = 'huit-cta-' + Date.now();
    card.innerHTML = `
      <p>${isHot ? '🔥 You\'re a strong match. Ready to get started?' : 'Want to see it in action?'}</p>
      <button id="${btnId}" class="huit-btn-primary">
        ${isHot ? productConfig.ctaLabel + ' — ' + productConfig.pricing : 'Book a 20-Min Demo →'}
      </button>
      <a href="${productConfig.demoUrl || 'https://huit.ai/demo'}" target="_blank" class="huit-btn-secondary">
        ${isHot ? 'Schedule a demo instead' : 'Start at ' + productConfig.pricing}
      </a>
    `;
    const wrapper = document.createElement('div');
    wrapper.className = 'huit-msg ai';
    wrapper.appendChild(card);
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Wire the button to create a live Stripe checkout
    document.getElementById(btnId)?.addEventListener('click', async function() {
      const btn = this;
      btn.textContent = 'Creating checkout...';
      btn.disabled = true;
      try {
        const email = leadInfo.email || prompt('Enter your work email to continue:');
        if (!email) { btn.textContent = 'Enter email to proceed'; btn.disabled = false; return; }
        const res = await fetch(ZENOPAY_CHECKOUT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product: PRODUCT,
            tier: tier,
            email: email,
            name: leadInfo.firstName || '',
            successUrl: window.location.origin + '/billing?success=true&session_id={CHECKOUT_SESSION_ID}',
            cancelUrl: window.location.href + '?cancelled=true'
          })
        });
        const data = await res.json();
        if (data.url) {
          window.open(data.url, '_blank');
          btn.textContent = '✅ Checkout opened';
          addMessage('assistant', 'Checkout is open in a new tab. Complete your payment there and you\'ll be set up instantly.');
        } else {
          btn.textContent = productConfig.ctaLabel;
          btn.disabled = false;
          addMessage('assistant', 'Let me connect you directly — reach out to derek@huit.ai and we\'ll get you set up.');
        }
      } catch (err) {
        btn.textContent = productConfig.ctaLabel;
        btn.disabled = false;
        addMessage('assistant', 'Having trouble with checkout — email derek@huit.ai and we\'ll get you started right away.');
      }
    });
  }

  function showEmailCapture() {
    const card = document.createElement('div');
    card.className = 'huit-cta-card';
    card.innerHTML = `
      <p>Drop your email and I'll send you everything you need to know:</p>
      <div class="huit-form-row">
        <label>First Name</label>
        <input type="text" class="huit-form-input" id="huit-cap-fname" placeholder="Your first name">
      </div>
      <div class="huit-form-row">
        <label>Work Email</label>
        <input type="email" class="huit-form-input" id="huit-cap-email" placeholder="you@company.com">
      </div>
      <button onclick="window.huitCapture()" class="huit-btn-primary" style="margin-top:4px;">Send My Info →</button>
    `;
    const wrapper = document.createElement('div');
    wrapper.className = 'huit-msg ai';
    wrapper.appendChild(card);
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  window.huitCapture = async function () {
    const firstName = document.getElementById('huit-cap-fname')?.value || '';
    const email = document.getElementById('huit-cap-email')?.value || '';
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    await submitLead({
      firstName,
      email,
      ...leadInfo,
      ...qualificationData
    });

    addMessage('assistant', `Perfect, ${firstName || 'thanks'}! I've sent your info. Check your inbox — a full breakdown of ${PRODUCT} is heading your way. 🚀`);
    document.querySelector('.huit-cta-card')?.closest('.huit-msg')?.remove();
  };

  async function initConversation() {
    const typing = showTyping();
    await sleep(800);
    removeTyping();

    const openingMessages = {
      CRMEX: "Hey! 👋 What's your biggest pain point with your current mortgage pipeline? Lead follow-up, HMDA tracking, or just visibility into what your team is working?",
      APEX: "Hey! Quick question — are you actively looking to recruit loan officers right now, or more in planning mode for the next quarter?",
      FoundHerGrants: "Hey! Is your business majority women-owned? I want to make sure you see the grants you're actually eligible for. 🎯",
      ZenoPay: "Hey! How much are you currently paying in per-transaction fees every month? I want to show you exactly what zero looks like.",
      AXIS: "Hey! What market intelligence are you currently missing that would change how you're running your business?",
      DEFAULT: "Hey! What's the biggest bottleneck slowing your team down right now?"
    };

    const msg = openingMessages[PRODUCT] || openingMessages.DEFAULT;
    addMessage('assistant', msg);
  }

  async function handleSend() {
    const text = input.value.trim();
    if (!text) return;

    addMessage('user', text);
    input.value = '';
    input.style.height = 'auto';

    // Extract any info from user message
    extractLeadInfo(text);

    const typing = showTyping();

    try {
      const apiMessages = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }));
      // Remove last user message since we already added it
      const toSend = apiMessages.slice(0, -1);

      const res = await fetch(`${ASE_URL}/api/qualify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: toSend, product: PRODUCT })
      });

      const data = await res.json();
      removeTyping();

      if (data.message) {
        addMessage('assistant', data.message);
        qualificationData = { ...qualificationData, ...data.qualification };

        // Show CTA if qualified or after enough conversation
        if (data.qualification?.readyForCheckout || 
            (data.qualification?.score >= 60 && messages.length >= 6)) {
          await sleep(600);
          showCTA(data.productConfig, data.qualification);
        } else if (messages.length >= 8 && !qualificationData.email) {
          await sleep(600);
          addMessage('assistant', "Before I forget — what's the best email to send you more details?");
          showEmailCapture();
        }
      }

    } catch (err) {
      removeTyping();
      addMessage('assistant', "I hit a snag — let me connect you directly. You can reach us at derek@huit.ai or book a demo at huit.ai/demo.");
    }
  }

  function extractLeadInfo(text) {
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) leadInfo.email = emailMatch[0];

    const phoneMatch = text.match(/[\d\s\-\(\)\.]{10,}/);
    if (phoneMatch) leadInfo.phone = phoneMatch[0].trim();
  }

  async function submitLead(data) {
    try {
      const utmParams = new URLSearchParams(window.location.search);
      await fetch(`${ASE_URL}/api/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          product: PRODUCT,
          qualificationScore: qualificationData.score || 0,
          icpMatch: qualificationData.qualified || false,
          intent: qualificationData.intent || 'unknown',
          utmSource: utmParams.get('utm_source'),
          utmMedium: utmParams.get('utm_medium'),
          utmCampaign: utmParams.get('utm_campaign')
        })
      });
    } catch (err) {
      console.error('Lead capture error:', err);
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

})();
