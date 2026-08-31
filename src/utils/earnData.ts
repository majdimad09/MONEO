export interface EarnOpportunity {
  id: string;
  term: 'short' | 'long';
  category: string;
  title: string;
  description: string;
  timeRequired: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  earningRange: string;
  startingPoint: string;
  steps: string[];
  skills: string[];
  accentLight: string;
  accentDark: string;
  icon: string;
  suitableFor: ('student' | 'employed' | 'any')[];
  minAge?: number;
}

export const EARN_OPPORTUNITIES: EarnOpportunity[] = [
  // ── Short Term ──────────────────────────────────────────────────────────────
  {
    id: 'tutoring',
    term: 'short',
    category: 'Teaching',
    title: 'Online Tutoring',
    description: 'Help students with subjects you know well. Platforms like Superprof, Preply, and Tutor.com connect you with learners of all ages worldwide.',
    timeRequired: '5–15 hrs/week',
    difficulty: 'Beginner',
    earningRange: '$20–$60/hr',
    startingPoint: 'Choose a subject you excel in, then create a profile on a tutoring platform.',
    steps: [
      'Pick 1–2 subjects you know well',
      'Create a profile on Preply or Superprof',
      'Set your hourly rate (start low, raise as reviews grow)',
      'Complete your first 5 sessions to build credibility',
    ],
    skills: ['Subject knowledge', 'Patience', 'Communication'],
    accentLight: '#f59e0b',
    accentDark: '#fbbf24',
    icon: 'GraduationCap',
    suitableFor: ['student', 'employed', 'any'],
  },
  {
    id: 'freelance-writing',
    term: 'short',
    category: 'Writing',
    title: 'Freelance Writing',
    description: 'Write articles, blog posts, copywriting, and product descriptions for businesses and publications. Strong demand across every industry.',
    timeRequired: '5–20 hrs/week',
    difficulty: 'Beginner',
    earningRange: '$15–$80/hr',
    startingPoint: 'Create 3 sample pieces in a niche you enjoy, then pitch to clients on Upwork or Fiverr.',
    steps: [
      'Choose a niche (tech, health, finance, lifestyle)',
      'Write 3 sample articles to show clients',
      'Create profiles on Upwork and Fiverr',
      'Land your first paid project at a competitive rate',
      'Raise your rate after 10 positive reviews',
    ],
    skills: ['Writing', 'Research', 'Editing'],
    accentLight: '#f59e0b',
    accentDark: '#fbbf24',
    icon: 'PenLine',
    suitableFor: ['student', 'employed', 'any'],
  },
  {
    id: 'sell-items',
    term: 'short',
    category: 'Declutter',
    title: 'Sell Unused Items',
    description: 'Turn things you no longer use into cash. Electronics, clothes, furniture, and collectibles sell well on eBay, Facebook Marketplace, and Vinted.',
    timeRequired: '2–5 hrs/week',
    difficulty: 'Beginner',
    earningRange: 'Variable',
    startingPoint: 'Walk through your home and identify 10 items you haven\'t used in 6+ months.',
    steps: [
      'Identify items to sell (electronics sell best)',
      'Take clear, well-lit photos',
      'Research similar listings to price competitively',
      'List on eBay, Vinted, or Facebook Marketplace',
      'Pack and ship promptly for good reviews',
    ],
    skills: ['Photography', 'Negotiation'],
    accentLight: '#f59e0b',
    accentDark: '#fbbf24',
    icon: 'ShoppingBag',
    suitableFor: ['student', 'employed', 'any'],
  },
  {
    id: 'social-media',
    term: 'short',
    category: 'Digital',
    title: 'Social Media Management',
    description: 'Help small businesses manage their Instagram, TikTok, and Facebook. Most owners know their product but not social media — that\'s where you come in.',
    timeRequired: '5–15 hrs/week',
    difficulty: 'Beginner',
    earningRange: '$15–$45/hr',
    startingPoint: 'Offer to manage one local business\'s social media for free for a month to build your portfolio.',
    steps: [
      'Learn the basics of Instagram and TikTok content',
      'Create a simple "social media package" offer',
      'Approach 3–5 local small businesses',
      'Do your first client for a testimonial',
      'Use that testimonial to charge full rates',
    ],
    skills: ['Content creation', 'Scheduling', 'Copywriting'],
    accentLight: '#f59e0b',
    accentDark: '#fbbf24',
    icon: 'Share2',
    suitableFor: ['student', 'employed', 'any'],
  },
  {
    id: 'virtual-assistant',
    term: 'short',
    category: 'Admin',
    title: 'Virtual Assistant',
    description: 'Support busy entrepreneurs and executives with admin tasks: email management, scheduling, research, data entry, and more — all from your laptop.',
    timeRequired: '10–25 hrs/week',
    difficulty: 'Beginner',
    earningRange: '$12–$30/hr',
    startingPoint: 'List the admin skills you already have (Excel, scheduling, emails) and search for VA roles on Indeed or Upwork.',
    steps: [
      'List your admin and computer skills',
      'Create a simple one-page CV or profile',
      'Apply to VA jobs on Upwork, Indeed, or Belay',
      'Start part-time alongside your current commitments',
    ],
    skills: ['Organisation', 'Communication', 'Microsoft Office'],
    accentLight: '#f59e0b',
    accentDark: '#fbbf24',
    icon: 'LayoutList',
    suitableFor: ['student', 'employed', 'any'],
  },
  {
    id: 'graphic-design',
    term: 'short',
    category: 'Creative',
    title: 'Freelance Graphic Design',
    description: 'Design logos, social media graphics, branding materials, and presentations for businesses. High demand and well-paid for those with the right skills.',
    timeRequired: '5–20 hrs/week',
    difficulty: 'Intermediate',
    earningRange: '$25–$80/hr',
    startingPoint: 'Build a portfolio of 5–10 sample designs, then list your services on Fiverr or 99designs.',
    steps: [
      'Learn Canva (free) or Adobe Illustrator',
      'Create 5 strong portfolio pieces',
      'Open a Fiverr gig or 99designs profile',
      'Offer a fast-turnaround at a competitive rate',
      'Collect reviews to raise your pricing',
    ],
    skills: ['Design tools', 'Creativity', 'Attention to detail'],
    accentLight: '#f59e0b',
    accentDark: '#fbbf24',
    icon: 'Palette',
    suitableFor: ['student', 'employed', 'any'],
  },
  {
    id: 'pet-sitting',
    term: 'short',
    category: 'Local Services',
    title: 'Pet Sitting & Dog Walking',
    description: 'Care for pets while owners are at work or on holiday. Rover and Wag! let you set your own hours and rates with minimal setup.',
    timeRequired: '2–15 hrs/week',
    difficulty: 'Beginner',
    earningRange: '$15–$30/hr',
    startingPoint: 'Sign up on Rover.com, set your availability, and offer a free meet-and-greet to your first client.',
    steps: [
      'Create a profile on Rover or Wag!',
      'Set competitive starting rates',
      'Offer a free first meet-and-greet',
      'Build reviews by going above and beyond',
      'Expand your client base through referrals',
    ],
    skills: ['Animal care', 'Reliability', 'Physical fitness'],
    accentLight: '#f59e0b',
    accentDark: '#fbbf24',
    icon: 'Heart',
    suitableFor: ['student', 'employed', 'any'],
    minAge: 16,
  },
  {
    id: 'photography',
    term: 'short',
    category: 'Creative',
    title: 'Event Photography',
    description: 'Photograph birthdays, graduations, corporate events, or portrait sessions. Even a mid-range camera and editing skills can earn good money on weekends.',
    timeRequired: '4–12 hrs/event',
    difficulty: 'Intermediate',
    earningRange: '$100–$500/event',
    startingPoint: 'Offer to photograph a friend\'s event for free or low cost to build your first portfolio gallery.',
    steps: [
      'Practice photography fundamentals (lighting, composition)',
      'Learn basic editing in Lightroom or Snapseed',
      'Shoot a free event to build your portfolio',
      'Create an Instagram page showcasing your work',
      'Set your first paid rate and take bookings',
    ],
    skills: ['Photography', 'Photo editing', 'People skills'],
    accentLight: '#f59e0b',
    accentDark: '#fbbf24',
    icon: 'Camera',
    suitableFor: ['student', 'employed', 'any'],
  },

  // ── Long Term ────────────────────────────────────────────────────────────────
  {
    id: 'web-dev',
    term: 'long',
    category: 'Tech',
    title: 'Learn Web Development',
    description: 'Web developers are among the highest-paid tech workers. Building websites and apps with HTML, CSS, JavaScript, and React opens doors to freelance work and full-time roles.',
    timeRequired: '10–20 hrs/week',
    difficulty: 'Intermediate',
    earningRange: '$60k–$120k+/yr',
    startingPoint: 'Start with The Odin Project (free) or freeCodeCamp. Commit to 30 minutes daily.',
    steps: [
      'Complete a free HTML/CSS course (freeCodeCamp)',
      'Learn JavaScript fundamentals (3–4 months)',
      'Build 3 portfolio projects',
      'Learn React or a modern framework',
      'Apply for junior developer roles or freelance projects',
    ],
    skills: ['Logical thinking', 'Problem solving', 'Patience'],
    accentLight: '#8b5cf6',
    accentDark: '#a78bfa',
    icon: 'Code2',
    suitableFor: ['student', 'employed', 'any'],
  },
  {
    id: 'digital-marketing',
    term: 'long',
    category: 'Marketing',
    title: 'Digital Marketing',
    description: 'SEO, paid ads, email marketing, and analytics are skills every business needs. A digital marketing certification can significantly boost your income.',
    timeRequired: '5–15 hrs/week to learn',
    difficulty: 'Intermediate',
    earningRange: '+$15k–$40k income potential',
    startingPoint: 'Take Google\'s free Digital Marketing certification course — it\'s industry-recognised.',
    steps: [
      'Complete Google Digital Marketing & E-Commerce certificate (free)',
      'Learn Google Analytics and Google Ads',
      'Run a small ad campaign with a minimal budget to practice',
      'Build a case study showing your results',
      'Apply for marketing roles or offer services freelance',
    ],
    skills: ['Analytics', 'Copywriting', 'Creative thinking'],
    accentLight: '#8b5cf6',
    accentDark: '#a78bfa',
    icon: 'TrendingUp',
    suitableFor: ['student', 'employed', 'any'],
  },
  {
    id: 'online-courses',
    term: 'long',
    category: 'Content',
    title: 'Create & Sell Online Courses',
    description: 'Package your knowledge into a course and sell it on Udemy, Teachable, or Gumroad. Once created, courses can generate passive income for years.',
    timeRequired: '10–30 hrs upfront, 1–3 hrs/week ongoing',
    difficulty: 'Intermediate',
    earningRange: '$500–$10k+/mo (passive)',
    startingPoint: 'Identify one topic you know better than most people and outline a 10-lesson course.',
    steps: [
      'Choose a topic with proven demand (search Udemy)',
      'Outline 8–15 lessons',
      'Record with your phone or a webcam — quality matters less than content',
      'Upload to Udemy or Gumroad',
      'Promote through social media or your email list',
    ],
    skills: ['Teaching', 'Video production', 'Subject expertise'],
    accentLight: '#8b5cf6',
    accentDark: '#a78bfa',
    icon: 'BookOpen',
    suitableFor: ['student', 'employed', 'any'],
  },
  {
    id: 'certifications',
    term: 'long',
    category: 'Career',
    title: 'Professional Certifications',
    description: 'Certifications in cloud (AWS, Azure), project management (PMP), finance (CFA, ACCA), or data (Google, Meta) can unlock significant salary increases.',
    timeRequired: '5–15 hrs/week for 3–12 months',
    difficulty: 'Intermediate',
    earningRange: '+$20k–$50k salary potential',
    startingPoint: 'Research which certification is most valued in your industry or target industry.',
    steps: [
      'Research the top 3 certifications in your field',
      'Check the return on investment (salary uplift vs. course cost)',
      'Enroll in a structured study programme',
      'Set a realistic exam date 3–6 months out',
      'Pass the exam and update your CV/LinkedIn',
    ],
    skills: ['Discipline', 'Self-study', 'Existing work knowledge'],
    accentLight: '#8b5cf6',
    accentDark: '#a78bfa',
    icon: 'Award',
    suitableFor: ['employed', 'any'],
  },
  {
    id: 'data-science',
    term: 'long',
    category: 'Tech',
    title: 'Data Science & AI',
    description: 'One of the fastest-growing and highest-paying fields. Data scientists and AI engineers help businesses make smarter decisions using data.',
    timeRequired: '15–25 hrs/week for 12–24 months',
    difficulty: 'Advanced',
    earningRange: '$70k–$150k+/yr',
    startingPoint: 'Start with Python basics on Codecademy or Kaggle — both are free.',
    steps: [
      'Learn Python fundamentals (2–3 months)',
      'Study statistics and data analysis with pandas',
      'Complete Kaggle\'s free machine learning course',
      'Build 3 data projects and publish on GitHub',
      'Apply to data analyst or junior data scientist roles',
    ],
    skills: ['Math/statistics', 'Python', 'Analytical thinking'],
    accentLight: '#8b5cf6',
    accentDark: '#a78bfa',
    icon: 'BarChart3',
    suitableFor: ['student', 'employed', 'any'],
  },
  {
    id: 'content-creator',
    term: 'long',
    category: 'Content',
    title: 'Content Creator',
    description: 'Build an audience on YouTube, TikTok, or a podcast around a topic you\'re passionate about. Monetise through ads, sponsorships, and products over time.',
    timeRequired: '10–20 hrs/week',
    difficulty: 'Intermediate',
    earningRange: '$500–$10k+/mo (grows over time)',
    startingPoint: 'Choose a specific niche, then commit to publishing 2 pieces of content per week for 6 months.',
    steps: [
      'Choose a niche with a clear target audience',
      'Study successful creators in that space',
      'Commit to a publishing schedule (consistency is everything)',
      'Engage with every comment in the early months',
      'Monetise once you reach platform thresholds',
    ],
    skills: ['Consistency', 'Creativity', 'Video/audio editing'],
    accentLight: '#8b5cf6',
    accentDark: '#a78bfa',
    icon: 'Video',
    suitableFor: ['student', 'employed', 'any'],
  },
  {
    id: 'service-business',
    term: 'long',
    category: 'Business',
    title: 'Start a Service Business',
    description: 'Turn a skill into a proper business — agency, consultancy, or specialist service. Higher earning potential than freelancing, with the option to hire and scale.',
    timeRequired: '20–40 hrs/week',
    difficulty: 'Advanced',
    earningRange: '$30k–$200k+/yr',
    startingPoint: 'Identify a service you can deliver reliably, then get your first paying client before worrying about anything else.',
    steps: [
      'Define your service and ideal client',
      'Get your first paying client through your network',
      'Deliver an exceptional result and ask for a referral',
      'Create simple systems (invoicing, contracts)',
      'Reinvest revenue to hire or market',
    ],
    skills: ['Sales', 'Delivery', 'Organisation', 'Persistence'],
    accentLight: '#8b5cf6',
    accentDark: '#a78bfa',
    icon: 'Briefcase',
    suitableFor: ['employed', 'any'],
    minAge: 18,
  },
  {
    id: 'investing',
    term: 'long',
    category: 'Finance',
    title: 'Build an Investment Portfolio',
    description: 'Investing consistently in index funds and ETFs over time is one of the most reliable ways to build long-term wealth. Time in the market beats timing the market.',
    timeRequired: '1–3 hrs/month',
    difficulty: 'Beginner',
    earningRange: '7–10% avg. annual return (long-term)',
    startingPoint: 'Open an investment account (ISA, 401k, or brokerage) and start with a low-cost global index fund.',
    steps: [
      'Learn the difference between stocks, ETFs, and index funds',
      'Open an account with a low-fee broker',
      'Start with a small, consistent monthly amount',
      'Invest in a broad global index fund (e.g. VWCE, S&P 500)',
      'Reinvest dividends and increase contributions over time',
    ],
    skills: ['Patience', 'Financial literacy', 'Discipline'],
    accentLight: '#8b5cf6',
    accentDark: '#a78bfa',
    icon: 'PiggyBank',
    suitableFor: ['student', 'employed', 'any'],
    minAge: 18,
  },
];

export function getPersonalisedOpportunities(
  userAge: number | null,
  userStatus: string,
  filter: 'all' | 'short' | 'long',
): EarnOpportunity[] {
  return EARN_OPPORTUNITIES.filter(opp => {
    if (filter !== 'all' && opp.term !== filter) return false;
    if (opp.minAge && userAge && userAge < opp.minAge) return false;
    return true;
  });
}

export function getRecommended(userAge: number | null, userStatus: string): EarnOpportunity[] {
  const isStudent = userStatus?.toLowerCase().includes('student');
  const isYoung = userAge !== null && userAge < 21;

  const recommendations: EarnOpportunity[] = [];

  if (isStudent || isYoung) {
    const ids = ['tutoring', 'freelance-writing', 'web-dev'];
    ids.forEach(id => {
      const opp = EARN_OPPORTUNITIES.find(o => o.id === id);
      if (opp) recommendations.push(opp);
    });
  } else if (userStatus?.toLowerCase().includes('employ')) {
    const ids = ['certifications', 'digital-marketing', 'investing'];
    ids.forEach(id => {
      const opp = EARN_OPPORTUNITIES.find(o => o.id === id);
      if (opp) recommendations.push(opp);
    });
  } else {
    const ids = ['social-media', 'online-courses', 'investing'];
    ids.forEach(id => {
      const opp = EARN_OPPORTUNITIES.find(o => o.id === id);
      if (opp) recommendations.push(opp);
    });
  }

  return recommendations.slice(0, 3);
}
