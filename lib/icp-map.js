// HUIT.AI AUTONOMOUS SALES ENGINE — ICP MAP
// Auto-defined ICPs for all 50 products across the Huit.AI ecosystem

const ICP_MAP = {
  // ─── MORTGAGE INTELLIGENCE ───────────────────────────────────────
  'CRMEX': {
    displayName: 'CRMEX Intelligence Platform',
    category: 'mortgage',
    icp: 'Mortgage loan officers, branch managers, and regional directors at independent mortgage companies and regional banks',
    painPoints: ['Pipeline visibility', 'Lead follow-up automation', 'Compliance tracking', 'HMDA reporting', 'Realtor relationship management'],
    qualifyingQuestions: [
      'How many loan officers are on your team?',
      'What CRM are you currently using for pipeline management?',
      'How much time per week does your team spend on manual follow-up?',
      'Are you currently tracking HMDA data for your lending area?'
    ],
    pricing: '$625/mo',
    tier: 'starter',
    ctaLabel: 'Start Your Intelligence Engine',
    checkoutUrl: 'https://crmex.huit.ai/checkout',
    demoUrl: 'https://crmex.huit.ai/demo',
    emailSequence: 'mortgage_crm'
  },
  'APEX': {
    displayName: 'APEX Recruiting Intelligence',
    category: 'recruiting',
    icp: 'Mortgage branch managers, regional VP of production, and talent acquisition leaders at mortgage companies with 10+ LOs',
    painPoints: ['LO candidate scoring', 'Retention risk prediction', 'Market competitive intelligence', 'Recruiting pipeline tracking'],
    qualifyingQuestions: [
      'How many loan officers are you looking to recruit in the next 90 days?',
      'What markets are you targeting for expansion?',
      'How do you currently evaluate LO candidates before making an offer?',
      'What is your average time-to-hire for loan officers?'
    ],
    pricing: '$625/mo',
    tier: 'starter',
    ctaLabel: 'Run Your First APEX Report',
    checkoutUrl: 'https://apex.huit.ai/checkout',
    demoUrl: 'https://apex.huit.ai/demo',
    emailSequence: 'recruiting'
  },
  'REAPEX': {
    displayName: 'REAPEX Real Estate Intelligence',
    category: 'real_estate',
    icp: 'Real estate team leaders, brokers, and talent acquisition directors at real estate brokerages with 5+ agents',
    painPoints: ['Agent candidate scoring', 'Market performance benchmarking', 'Agent retention', 'Competitive market intelligence'],
    qualifyingQuestions: [
      'How many agents does your brokerage have?',
      'How many agents are you looking to recruit this year?',
      'What markets are you actively recruiting in?',
      'How do you currently evaluate agent candidates?'
    ],
    pricing: '$625/mo',
    tier: 'starter',
    ctaLabel: 'Run Your First REAPEX Report',
    checkoutUrl: 'https://reapex.huit.ai/checkout',
    demoUrl: 'https://reapex.huit.ai/demo',
    emailSequence: 'real_estate_recruiting'
  },
  'HyperLoanAI': {
    displayName: 'HyperLoanAI Mortgage CRM',
    category: 'mortgage',
    icp: 'Independent mortgage brokers, small mortgage companies (1-20 LOs), and loan officers building their own brand',
    painPoints: ['Affordable CRM with AI', 'Lead-to-close automation', 'Document collection', 'Rate alerts and refi triggers'],
    qualifyingQuestions: [
      'Are you an independent LO or do you run a small team?',
      'How many active leads are you managing right now?',
      'What is your current monthly loan volume?',
      'Are you looking for a CRM you can white-label for your brand?'
    ],
    pricing: '$625/mo',
    tier: 'starter',
    ctaLabel: 'Launch Your Loan Engine',
    checkoutUrl: 'https://hyperloanai.huit.ai/checkout',
    demoUrl: 'https://hyperloanai.huit.ai/demo',
    emailSequence: 'mortgage_crm'
  },
  'PredictiveRefiEngine': {
    displayName: 'Predictive Refi Engine',
    category: 'mortgage',
    icp: 'Mortgage servicers, correspondent lenders, and high-volume loan officers wanting to identify refi-ready borrowers',
    painPoints: ['Identifying refi opportunities in existing portfolio', 'Rate trigger alerts', 'Borrower equity analysis', 'Timing refinance outreach'],
    qualifyingQuestions: [
      'How large is your current loan servicing portfolio?',
      'How are you currently identifying refi-ready borrowers?',
      'What is your process for reaching out when rates drop?',
      'How many refinances did you close in the last 12 months?'
    ],
    pricing: '$625/mo',
    tier: 'starter',
    ctaLabel: 'Activate Refi Intelligence',
    checkoutUrl: 'https://predictiverefi.huit.ai/checkout',
    demoUrl: 'https://predictiverefi.huit.ai/demo',
    emailSequence: 'mortgage_tech'
  },

  // ─── AI AGENTS & AUTOMATION ───────────────────────────────────────
  'VoiceAgent': {
    displayName: 'Huit Voice Agent',
    category: 'ai_agents',
    icp: 'Mortgage companies, real estate brokerages, and financial service firms wanting to automate inbound/outbound calls with AI',
    painPoints: ['High call volume with limited staff', 'After-hours lead response', 'Appointment booking automation', 'Lead qualification at scale'],
    qualifyingQuestions: [
      'How many inbound calls does your team handle per day?',
      'Do you have leads that go unanswered after hours?',
      'What percentage of your calls are qualifying conversations?',
      'Are you looking to automate outbound follow-up calls?'
    ],
    pricing: '$625/mo',
    tier: 'starter',
    ctaLabel: 'Deploy Your Voice Agent',
    checkoutUrl: 'https://voice.huit.ai/checkout',
    demoUrl: 'https://voice.huit.ai/demo',
    emailSequence: 'ai_agents'
  },
  'AgenticDist': {
    displayName: 'Agentic Distribution Engine',
    category: 'ai_agents',
    icp: 'Mortgage and real estate companies wanting to distribute leads, content, and intelligence across their network autonomously',
    painPoints: ['Manual lead routing', 'Content distribution at scale', 'Multi-channel outreach coordination', 'Network communication automation'],
    qualifyingQuestions: [
      'How do you currently distribute leads across your team?',
      'How many channels does your outreach strategy include?',
      'What percentage of your distribution is automated today?',
      'How large is your network you need to communicate with?'
    ],
    pricing: '$625/mo',
    tier: 'starter',
    ctaLabel: 'Activate Agentic Distribution',
    checkoutUrl: 'https://agenticdist.huit.ai/checkout',
    demoUrl: 'https://agenticdist.huit.ai/demo',
    emailSequence: 'ai_agents'
  },
  'LeadQualifier': {
    displayName: 'Huit Lead Qualifier',
    category: 'ai_agents',
    icp: 'Mortgage companies, real estate teams, and financial services firms receiving high volumes of inbound leads needing instant AI qualification',
    painPoints: ['Speed to lead gap', 'Unqualified leads wasting sales time', 'Lead scoring accuracy', '24/7 qualification coverage'],
    qualifyingQuestions: [
      'How many leads do you receive per month?',
      'What is your current speed-to-lead response time?',
      'How do you currently score and prioritize your leads?',
      'What percentage of your leads convert to conversations?'
    ],
    pricing: '$625/mo',
    tier: 'starter',
    ctaLabel: 'Qualify Leads Automatically',
    checkoutUrl: 'https://leadqualifier.huit.ai/checkout',
    demoUrl: 'https://leadqualifier.huit.ai/demo',
    emailSequence: 'ai_agents'
  },
  'AgenticOS': {
    displayName: 'AgenticOS',
    category: 'ai_agents',
    icp: 'Tech-forward mortgage and real estate companies wanting to run autonomous AI workflows across their entire operation',
    painPoints: ['Fragmented AI tools', 'Manual workflow coordination', 'Lack of AI orchestration layer', 'Scaling operations without headcount'],
    qualifyingQuestions: [
      'How many AI tools is your team currently using?',
      'What workflows are you looking to automate first?',
      'Do you have a dedicated operations or systems role?',
      'How much time does your team spend on repetitive tasks weekly?'
    ],
    pricing: '$1,250/mo',
    tier: 'scout',
    ctaLabel: 'Deploy AgenticOS',
    checkoutUrl: 'https://agenticdist.huit.ai/checkout',
    demoUrl: 'https://agenticdist.huit.ai/demo',
    emailSequence: 'ai_agents'
  },
  'MultilingualDist': {
    displayName: 'Multilingual Distribution',
    category: 'ai_agents',
    icp: 'Mortgage and real estate companies operating in diverse markets with Spanish, Tagalog, Mandarin, or other language-speaking borrower populations',
    painPoints: ['Serving non-English speaking clients', 'Translation bottlenecks', 'Multilingual content creation', 'Compliance in multiple languages'],
    qualifyingQuestions: [
      'What languages does your borrower base speak?',
      'Do you currently have multilingual staff or content?',
      'What percentage of your market is non-English speaking?',
      'Are you looking to expand into multilingual markets?'
    ],
    pricing: '$625/mo',
    tier: 'starter',
    ctaLabel: 'Break Language Barriers',
    checkoutUrl: 'https://multilingual.huit.ai/checkout',
    demoUrl: 'https://multilingual.huit.ai/demo',
    emailSequence: 'ai_agents'
  },

  // ─── CONTENT & MARKETING ──────────────────────────────────────────
  'ContentLoop': {
    displayName: 'ContentLoop AI',
    category: 'content',
    icp: 'Mortgage loan officers, real estate agents, and financial advisors who need consistent social media and blog content without hiring a marketing team',
    painPoints: ['Consistent content creation', 'Social media presence', 'SEO content strategy', 'Personal brand building'],
    qualifyingQuestions: [
      'How often are you currently posting content on social media?',
      'Do you have a dedicated marketing resource on your team?',
      'What platforms are most important for your business?',
      'How much time per week do you spend creating content?'
    ],
    pricing: '$625/mo',
    tier: 'starter',
    ctaLabel: 'Automate Your Content Engine',
    checkoutUrl: 'https://content.huit.ai/checkout',
    demoUrl: 'https://content.huit.ai/demo',
    emailSequence: 'content_marketing'
  },
  'AEOEngine': {
    displayName: 'AEO Engine',
    category: 'content',
    icp: 'Mortgage companies, real estate brokerages, and financial service brands wanting to dominate AI search (ChatGPT, Perplexity, Gemini) and local SEO',
    painPoints: ['Invisible in AI search results', 'Declining Google organic traffic', 'Competitor dominance in search', 'Answer engine optimization'],
    qualifyingQuestions: [
      'Does your company currently show up when someone asks an AI about mortgage options in your market?',
      'How much of your business comes from organic search?',
      'Do you have a dedicated SEO strategy?',
      'Are you aware of how AI search engines are replacing traditional Google?'
    ],
    pricing: '$625/mo',
    tier: 'starter',
    ctaLabel: 'Own AI Search In Your Market',
    checkoutUrl: 'https://aeo.huit.ai/checkout',
    demoUrl: 'https://aeo.huit.ai/demo',
    emailSequence: 'content_marketing'
  },

  // ─── INTELLIGENCE & DATA ──────────────────────────────────────────
  'AXIS': {
    displayName: 'AXIS Intelligence Hub',
    category: 'intelligence',
    icp: 'C-suite mortgage and real estate executives wanting a unified command center for market intelligence, competitive analysis, and performance data',
    painPoints: ['Fragmented data sources', 'Lack of market intelligence', 'Competitive blind spots', 'Executive reporting overhead'],
    qualifyingQuestions: [
      'How do you currently track market share and competitive positioning?',
      'How many data sources does your leadership team pull from weekly?',
      'Do you have a real-time view of your production vs. market trends?',
      'What intelligence do you wish you had that you currently do not?'
    ],
    pricing: '$2,350/mo',
    tier: 'command',
    ctaLabel: 'Access The Intelligence Hub',
    checkoutUrl: 'https://axis.huit.ai/checkout',
    demoUrl: 'https://axis.huit.ai/demo',
    emailSequence: 'enterprise_intelligence'
  },
  'DocIntelligence': {
    displayName: 'Doc Intelligence',
    category: 'intelligence',
    icp: 'Mortgage processors, underwriters, and operations teams at mid-to-large mortgage companies needing AI-powered document extraction and analysis',
    painPoints: ['Manual document review', 'Data extraction errors', 'Processing bottlenecks', 'Compliance documentation'],
    qualifyingQuestions: [
      'How many loan files does your team process per month?',
      'How long does your average document review take per file?',
      'What document types are causing the biggest processing delays?',
      'Do you have automated extraction for income and asset documents?'
    ],
    pricing: '$1,250/mo',
    tier: 'scout',
    ctaLabel: 'Automate Document Processing',
    checkoutUrl: 'https://docint.huit.ai/checkout',
    demoUrl: 'https://docint.huit.ai/demo',
    emailSequence: 'mortgage_ops'
  },

  // ─── GRANTS & SMALL BUSINESS ──────────────────────────────────────
  'FoundHerGrants': {
    displayName: 'FoundHer Grants',
    category: 'grants',
    icp: 'Women-owned small businesses, female entrepreneurs, and business coaches serving women founders seeking grant funding',
    painPoints: ['Finding relevant grants', 'Grant application complexity', 'Missing deadlines', 'Knowing which grants to apply for'],
    qualifyingQuestions: [
      'Is your business majority women-owned?',
      'Have you applied for grants before?',
      'What stage is your business — startup, growth, or established?',
      'What industries or sectors does your business operate in?'
    ],
    pricing: '$199/mo',
    tier: 'database',
    ctaLabel: 'Find Your Grants Now',
    checkoutUrl: 'https://foundher.huit.ai/checkout',
    demoUrl: 'https://foundher.huit.ai/demo',
    emailSequence: 'grants'
  },

  // ─── PAYMENTS & FINTECH ───────────────────────────────────────────
  'ZenoPay': {
    displayName: 'ZenoPay.ai',
    category: 'fintech',
    icp: 'SaaS companies, fintech startups, and platform businesses needing enterprise-grade payment infrastructure with zero per-transaction fees',
    painPoints: ['High payment processing fees', 'Complex payment integration', 'Multi-tenant billing', 'Payment compliance and security'],
    qualifyingQuestions: [
      'What is your current monthly payment processing volume?',
      'What payment processor are you using today?',
      'How much are you paying in per-transaction fees monthly?',
      'Are you building a multi-tenant platform that needs embedded payments?'
    ],
    pricing: '$2,500/mo',
    tier: 'growth',
    ctaLabel: 'Eliminate Per-Transaction Fees',
    checkoutUrl: 'https://zenopay.ai/checkout',
    demoUrl: 'https://zenopay.ai/demo',
    emailSequence: 'fintech'
  },

  // ─── MORTGAGE BRAND / GEO ─────────────────────────────────────────
  'AskAlaskaMortgage': {
    displayName: 'Ask Alaska Mortgage',
    category: 'mortgage_brand',
    icp: 'Alaska homebuyers, first-time buyers, and real estate investors looking for mortgage guidance in the Alaska market',
    painPoints: ['Alaska-specific mortgage questions', 'VA loan eligibility', 'Rural housing programs', 'Alaska Housing Finance rates'],
    qualifyingQuestions: [
      'Are you looking to buy a home in Alaska?',
      'Are you a first-time homebuyer or experienced buyer?',
      'Are you a veteran or active military?',
      'What is your target purchase price range?'
    ],
    pricing: 'Free consultation',
    tier: 'lead_gen',
    ctaLabel: 'Get Your Alaska Mortgage Answer',
    checkoutUrl: 'https://askalazkamortgage.ai/apply',
    demoUrl: 'https://askalaskamortgage.ai',
    emailSequence: 'mortgage_consumer'
  },
  'GEOPlaybook': {
    displayName: 'GEO Playbook',
    category: 'content',
    icp: 'Mortgage companies and real estate brands wanting to dominate geographic search in their target markets with AI-generated content and brand presence',
    painPoints: ['Local market visibility', 'Geographic expansion', 'Hyper-local content strategy', 'Market-specific landing pages'],
    qualifyingQuestions: [
      'How many geographic markets are you targeting?',
      'Do you have market-specific landing pages today?',
      'How do competitors rank in your key markets?',
      'Are you expanding into new geographic territories?'
    ],
    pricing: '$625/mo',
    tier: 'starter',
    ctaLabel: 'Own Your Markets',
    checkoutUrl: 'https://geo.huit.ai/checkout',
    demoUrl: 'https://geo.huit.ai/demo',
    emailSequence: 'content_marketing'
  },

  // ─── SIGNATURES & COMPLIANCE ──────────────────────────────────────
  'HuitSign': {
    displayName: 'HuitSign',
    category: 'compliance',
    icp: 'Mortgage loan officers, real estate agents, and financial service professionals needing fast, compliant e-signature workflows',
    painPoints: ['Document turnaround time', 'E-signature compliance', 'Integration with mortgage workflow', 'Client signing experience'],
    qualifyingQuestions: [
      'How many documents per month do you need signed?',
      'What e-signature solution are you using today?',
      'How long does your average document signing cycle take?',
      'Do you need signatures integrated into your loan origination workflow?'
    ],
    pricing: '$625/mo',
    tier: 'starter',
    ctaLabel: 'Sign Faster, Close Faster',
    checkoutUrl: 'https://sign.huit.ai/checkout',
    demoUrl: 'https://sign.huit.ai/demo',
    emailSequence: 'mortgage_ops'
  },

  // ─── BEHAVIORAL ANALYTICS ─────────────────────────────────────────
  'BehavioralPrediction': {
    displayName: 'Behavioral Prediction Engine',
    category: 'intelligence',
    icp: 'Mortgage and real estate sales leaders wanting to predict borrower and agent behavior to optimize timing of outreach and offers',
    painPoints: ['Unpredictable sales cycles', 'Wrong timing on outreach', 'Churn prediction', 'Engagement scoring'],
    qualifyingQuestions: [
      'How do you currently decide when to reach out to a prospect?',
      'Do you have any behavioral data on how clients engage with your content?',
      'What would knowing the perfect time to call a lead be worth to your business?',
      'Are you currently losing deals to competitors because of timing?'
    ],
    pricing: '$1,250/mo',
    tier: 'scout',
    ctaLabel: 'Predict The Perfect Moment',
    checkoutUrl: 'https://behavioral.huit.ai/checkout',
    demoUrl: 'https://behavioral.huit.ai/demo',
    emailSequence: 'enterprise_intelligence'
  },

  // ─── DEFAULT FALLBACK ─────────────────────────────────────────────
  'DEFAULT': {
    displayName: 'Huit.AI',
    category: 'general',
    icp: 'Mortgage companies, real estate brokerages, and financial services firms looking to automate and scale with AI',
    painPoints: ['Manual processes slowing growth', 'Lack of AI strategy', 'Competitive pressure from tech-forward competitors', 'Scaling without increasing headcount'],
    qualifyingQuestions: [
      'What is the biggest bottleneck in your current operation?',
      'How many people are on your team?',
      'What is your primary goal for the next 90 days?',
      'Have you explored AI solutions before?'
    ],
    pricing: '$625/mo',
    tier: 'starter',
    ctaLabel: 'Start With Huit.AI',
    checkoutUrl: 'https://huit.ai/checkout',
    demoUrl: 'https://huit.ai/demo',
    emailSequence: 'general'
  }
};

// EMAIL SEQUENCES MAP
const EMAIL_SEQUENCES = {
  mortgage_crm: {
    immediate: {
      subject: 'Your {{productName}} access is almost ready',
      preview: 'Here\'s what intelligent mortgage operations looks like...'
    },
    day1: {
      subject: 'How top LOs are using {{productName}} to close 40% more',
      preview: 'A quick look at what\'s possible in your first 30 days...'
    },
    day3: {
      subject: '{{firstName}}, your pipeline is waiting',
      preview: 'You have 0 leads tracked right now. Let\'s change that...'
    },
    day7: {
      subject: 'Last chance: Your {{productName}} setup offer expires soon',
      preview: 'Let\'s get your mortgage intelligence engine running...'
    }
  },
  recruiting: {
    immediate: {
      subject: 'Your APEX recruiting intelligence is ready',
      preview: 'Run your first candidate report in under 5 minutes...'
    },
    day1: {
      subject: 'The LO you almost missed hiring — APEX would have caught them',
      preview: 'See how APEX scoring surfaces hidden talent...'
    },
    day3: {
      subject: '{{firstName}}, recruiting season is now',
      preview: 'Q2 is the best time to recruit LOs. Here\'s your playbook...'
    },
    day7: {
      subject: 'Your competitors are using AI to recruit. Are you?',
      preview: 'APEX is the only recruiting platform built for mortgage...'
    }
  },
  fintech: {
    immediate: {
      subject: 'ZenoPay: Zero fees, enterprise power — your access details',
      preview: 'You\'re one step from eliminating per-transaction fees forever...'
    },
    day1: {
      subject: 'How much are you paying in transaction fees right now?',
      preview: 'The average ZenoPay customer saves $4,200/mo...'
    },
    day3: {
      subject: '{{firstName}}, your payment infrastructure is costing you',
      preview: 'Every transaction fee is margin you\'re giving away...'
    },
    day7: {
      subject: 'Final note: ZenoPay Founding Member pricing closes soon',
      preview: 'Lock in $3,500/mo for 24 months before this expires...'
    }
  },
  grants: {
    immediate: {
      subject: 'You have {{grantCount}} grants available right now',
      preview: 'FoundHer has matched you to active grant opportunities...'
    },
    day1: {
      subject: 'These 3 grants close this month — act now',
      preview: 'Time-sensitive opportunities matched to your profile...'
    },
    day3: {
      subject: '{{firstName}}, your grant matches are still waiting',
      preview: 'Other women founders have already applied. Don\'t miss out...'
    },
    day7: {
      subject: 'Your FoundHer grant profile is incomplete',
      preview: 'Complete your profile to unlock 40+ additional matches...'
    }
  },
  ai_agents: {
    immediate: {
      subject: 'Your AI agent is almost live — final step inside',
      preview: 'Deploy your first autonomous workflow in under 10 minutes...'
    },
    day1: {
      subject: 'What if your business ran while you slept?',
      preview: 'Here\'s what autonomous AI operations looks like for your team...'
    },
    day3: {
      subject: '{{firstName}}, your competitors have already deployed AI agents',
      preview: 'The gap between AI-first and everyone else is widening...'
    },
    day7: {
      subject: 'One-time offer: White-glove AI agent setup — this week only',
      preview: 'We\'ll configure your first agent workflow at no extra cost...'
    }
  },
  content_marketing: {
    immediate: {
      subject: 'Your content engine is warming up',
      preview: 'Your first week of content is being generated now...'
    },
    day1: {
      subject: '7 posts scheduled. 0 hours of your time spent.',
      preview: 'Here\'s a preview of your automated content calendar...'
    },
    day3: {
      subject: '{{firstName}}, your audience is growing',
      preview: 'Content consistency is the #1 driver of inbound mortgage leads...'
    },
    day7: {
      subject: 'Your 30-day content performance report',
      preview: 'Here\'s what consistent AI-powered content can do for your brand...'
    }
  },
  enterprise_intelligence: {
    immediate: {
      subject: 'Your intelligence hub is ready',
      preview: 'Executive-level market intelligence, now at your fingertips...'
    },
    day1: {
      subject: 'What does your market look like right now?',
      preview: 'Here\'s a sample intelligence brief from your target market...'
    },
    day3: {
      subject: '{{firstName}}, your competitors are making moves',
      preview: 'Market intelligence briefing: what\'s shifted in the last 72 hours...'
    },
    day7: {
      subject: 'Command-level visibility. Are you ready?',
      preview: 'Schedule a 20-minute intelligence walkthrough with our team...'
    }
  },
  mortgage_ops: {
    immediate: {
      subject: 'Your mortgage operations just got smarter',
      preview: 'See how {{productName}} integrates with your current workflow...'
    },
    day1: {
      subject: 'The bottleneck in your operation we\'ve already solved',
      preview: 'Most mortgage teams lose 6+ hours/week to this one process...'
    },
    day3: {
      subject: '{{firstName}}, let\'s show you 15 minutes of time savings',
      preview: 'A quick demo of your most impactful automation opportunity...'
    },
    day7: {
      subject: 'Your team deserves better tools',
      preview: 'Start with {{productName}} this week — setup takes under an hour...'
    }
  },
  mortgage_consumer: {
    immediate: {
      subject: 'Your Alaska mortgage question — answered',
      preview: 'Here\'s what you need to know about getting a mortgage in Alaska...'
    },
    day1: {
      subject: 'Alaska mortgage rates update: What this means for you',
      preview: 'Current rates and what buyers in your price range should know...'
    },
    day3: {
      subject: '{{firstName}}, are you ready to take the next step?',
      preview: 'A pre-approval takes less than 10 minutes. Let\'s get started...'
    },
    day7: {
      subject: 'Your Alaska homebuying roadmap — free resource inside',
      preview: 'Step-by-step guide for buying in today\'s Alaska market...'
    }
  },
  mortgage_tech: {
    immediate: {
      subject: 'Your refi intelligence engine is active',
      preview: 'Here\'s how to find the refinance opportunities hiding in your portfolio...'
    },
    day1: {
      subject: 'Your portfolio has more refi opportunity than you think',
      preview: 'Our analysis shows most LOs are missing 15-30% of refi triggers...'
    },
    day3: {
      subject: '{{firstName}}, rate movement detected in your market',
      preview: 'Borrowers who should be refinancing right now — here\'s the data...'
    },
    day7: {
      subject: 'The refi cycle is here. Is your pipeline ready?',
      preview: 'Activate your predictive refi triggers this week...'
    }
  },
  general: {
    immediate: {
      subject: 'Welcome to Huit.AI — Built From Alaska',
      preview: 'Your AI-powered business intelligence platform is ready...'
    },
    day1: {
      subject: 'What Huit.AI can do for your business in 30 days',
      preview: 'Here\'s a breakdown of the platform built for your industry...'
    },
    day3: {
      subject: '{{firstName}}, let\'s find your highest-impact starting point',
      preview: 'A 20-minute discovery call can change your entire operation...'
    },
    day7: {
      subject: 'Your Huit.AI access is still waiting',
      preview: 'Don\'t let your competitors get there first...'
    }
  }
};

module.exports = { ICP_MAP, EMAIL_SEQUENCES };
