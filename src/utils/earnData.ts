export interface YouTubeResource {
  title: string;
  channel: string;
  searchQuery: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  accent: string;
}

export interface WeeklyMilestone {
  week: number;
  title: string;
  tasks: string[];
}

export interface InvestingLesson {
  id: string;
  title: string;
  summary: string;
  keyPoint: string;
  quiz?: { q: string; options: string[]; correct: number };
  videoQuery: string;
}

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
  isPremium?: boolean;
  isFeatured?: boolean;
  weeklyPlan?: WeeklyMilestone[];
  youtubeResources?: YouTubeResource[];
  investingLessons?: InvestingLesson[];
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
      'Ask happy students for reviews',
      'Raise your rate by 20% after 10 reviews',
    ],
    skills: ['Subject knowledge', 'Patience', 'Communication'],
    accentLight: '#f59e0b',
    accentDark: '#fbbf24',
    icon: 'GraduationCap',
    suitableFor: ['student', 'employed', 'any'],
    weeklyPlan: [
      { week: 1, title: 'Set up your profile', tasks: ['Choose subjects to teach', 'Sign up on Preply or Superprof', 'Write a compelling bio', 'Upload a profile photo'] },
      { week: 2, title: 'Land your first student', tasks: ['Set a competitive starter rate', 'Respond to any inquiries within 1 hour', 'Offer a free 15-minute intro session', 'Prepare sample lesson materials'] },
      { week: 3, title: 'Deliver great sessions', tasks: ['Complete 3–5 sessions', 'Ask for honest feedback', 'Refine your teaching style', 'Plan structured lessons'] },
      { week: 4, title: 'Grow and optimise', tasks: ['Request your first review', 'Expand to a second platform', 'Consider raising your rate slightly', 'Set a recurring schedule'] },
    ],
    youtubeResources: [
      { title: 'How to Start Online Tutoring', channel: 'freeCodeCamp', searchQuery: 'how to start online tutoring beginners guide', level: 'Beginner', accent: '#f59e0b' },
      { title: 'Make Money Tutoring Online', channel: 'Educational', searchQuery: 'make money online tutoring students 2024', level: 'Beginner', accent: '#fbbf24' },
      { title: 'Superprof & Preply Tutoring Tips', channel: 'Tutor Guide', searchQuery: 'superprof preply tutoring tips earn more', level: 'Intermediate', accent: '#f97316' },
    ],
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
      'Pitch to direct clients for higher rates',
    ],
    skills: ['Writing', 'Research', 'Editing'],
    accentLight: '#f59e0b',
    accentDark: '#fbbf24',
    icon: 'PenLine',
    suitableFor: ['student', 'employed', 'any'],
    weeklyPlan: [
      { week: 1, title: 'Build your portfolio', tasks: ['Choose your writing niche', 'Write 3 high-quality sample articles', 'Set up a simple Google Drive portfolio', 'Research top writers in your niche'] },
      { week: 2, title: 'Get on platforms', tasks: ['Create an Upwork profile', 'Create a Fiverr gig', 'Write a compelling bio and service description', 'Apply to 5 relevant jobs'] },
      { week: 3, title: 'Land your first client', tasks: ['Follow up on applications', 'Accept a lower-rate first project', 'Deliver early and exceed expectations', 'Ask for a review'] },
      { week: 4, title: 'Scale up', tasks: ['Raise rate slightly', 'Pitch 3 direct businesses', 'Create a second Fiverr gig', 'Build an email list of leads'] },
    ],
    youtubeResources: [
      { title: 'Freelance Writing for Beginners', channel: 'Gina Horkey', searchQuery: 'freelance writing for beginners how to start', level: 'Beginner', accent: '#f59e0b' },
      { title: 'How to Make Money Writing Online', channel: 'Income School', searchQuery: 'make money writing online 2024 guide', level: 'Beginner', accent: '#fbbf24' },
      { title: 'Upwork Profile for Writers', channel: 'Upwork Tips', searchQuery: 'upwork profile tips freelance writers', level: 'Intermediate', accent: '#f97316' },
    ],
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
    weeklyPlan: [
      { week: 1, title: 'Identify and photograph', tasks: ['Go room by room with a notepad', 'List 10–20 items to sell', 'Clean and photograph each item', 'Research prices on eBay'] },
      { week: 2, title: 'List everything', tasks: ['Create accounts on eBay and Vinted', 'List your first 10 items', 'Write detailed, honest descriptions', 'Set competitive prices'] },
      { week: 3, title: 'Ship and earn', tasks: ['Package sold items carefully', 'Ship within 24 hours', 'Respond to buyer questions quickly', 'Re-list anything unsold at lower price'] },
      { week: 4, title: 'Scale or donate', tasks: ['List remaining items', 'Donate what doesn\'t sell', 'Reinvest earnings', 'Consider sourcing items to resell'] },
    ],
    youtubeResources: [
      { title: 'How to Sell on eBay for Beginners', channel: 'eBay For Business', searchQuery: 'how to sell on ebay for beginners 2024', level: 'Beginner', accent: '#f59e0b' },
      { title: 'Vinted Selling Tips', channel: 'Vinted Guide', searchQuery: 'vinted selling tips make money clothes', level: 'Beginner', accent: '#fbbf24' },
    ],
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
    weeklyPlan: [
      { week: 1, title: 'Learn the fundamentals', tasks: ['Study 10 successful local business accounts', 'Learn Canva for graphics', 'Create a content calendar template', 'Build a sample portfolio post'] },
      { week: 2, title: 'Create your offer', tasks: ['Write a 1-page service description', 'Set your pricing (start at $200–300/month)', 'List 3 local businesses to approach', 'Prepare a sample content plan'] },
      { week: 3, title: 'Get your first client', tasks: ['Approach 3 businesses in person or by email', 'Offer the first month at a reduced rate', 'Create a content calendar for your client', 'Post 3× per week minimum'] },
      { week: 4, title: 'Deliver results', tasks: ['Track engagement stats weekly', 'Show growth to your client', 'Ask for a testimonial', 'Use results to pitch the next client'] },
    ],
    youtubeResources: [
      { title: 'Social Media Management for Beginners', channel: 'Latasha James', searchQuery: 'social media management business beginners guide', level: 'Beginner', accent: '#f59e0b' },
      { title: 'How to Get Your First Client', channel: 'Freelance Friday', searchQuery: 'get first social media management client freelance', level: 'Beginner', accent: '#fbbf24' },
    ],
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
    weeklyPlan: [
      { week: 1, title: 'Identify your skills', tasks: ['List all admin tools you know', 'Note your availability per week', 'Write a 1-page skills profile', 'Research VA job boards'] },
      { week: 2, title: 'Get on platforms', tasks: ['Create Upwork profile', 'Apply to 10 VA jobs', 'Join VA Facebook groups', 'Create a simple portfolio page'] },
      { week: 3, title: 'Land your first client', tasks: ['Accept first project even at lower rate', 'Communicate proactively and clearly', 'Deliver everything before deadline', 'Ask for ongoing work'] },
      { week: 4, title: 'Build steadily', tasks: ['Secure a second client', 'Learn one new tool (Asana, Notion, etc.)', 'Raise rate for new clients', 'Track your hours carefully'] },
    ],
    youtubeResources: [
      { title: 'How to Become a Virtual Assistant', channel: 'Abbey Ashley', searchQuery: 'how to become virtual assistant beginners 2024', level: 'Beginner', accent: '#f59e0b' },
      { title: 'Virtual Assistant Business Setup', channel: 'VA Tips', searchQuery: 'virtual assistant business setup guide freelance', level: 'Beginner', accent: '#fbbf24' },
    ],
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
    weeklyPlan: [
      { week: 1, title: 'Learn the tools', tasks: ['Complete a Canva beginner course', 'Study colour theory basics', 'Practice recreating 3 logos', 'Analyse brands you admire'] },
      { week: 2, title: 'Build a portfolio', tasks: ['Create 5 original designs', 'Design a logo, a poster, and a social template', 'Upload to Behance or a simple site', 'Ask for feedback from peers'] },
      { week: 3, title: 'Launch on Fiverr', tasks: ['Create a compelling Fiverr gig', 'Write a clear service description', 'Offer quick delivery to stand out', 'Apply to 99designs contests'] },
      { week: 4, title: 'Get your first paid work', tasks: ['Accept even a low-priced project', 'Deliver beyond expectations', 'Ask for a review', 'Refine your gig based on feedback'] },
    ],
    youtubeResources: [
      { title: 'Freelance Graphic Design for Beginners', channel: 'The Futur', searchQuery: 'freelance graphic design beginners guide 2024', level: 'Beginner', accent: '#f59e0b' },
      { title: 'Canva Tutorial: Full Beginner Course', channel: 'Canva Tutorials', searchQuery: 'canva tutorial full course beginners design', level: 'Beginner', accent: '#fbbf24' },
      { title: 'How to Price Your Design Services', channel: 'Satori Graphics', searchQuery: 'how to price graphic design services freelance', level: 'Intermediate', accent: '#f97316' },
    ],
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
    weeklyPlan: [
      { week: 1, title: 'Set up your profile', tasks: ['Sign up on Rover.com', 'Add professional photos', 'Write a warm, trustworthy bio', 'Get a background check done'] },
      { week: 2, title: 'Get your first booking', tasks: ['Set competitive rates (lower to start)', 'Reach out to neighbours and friends', 'Offer a free meet-and-greet', 'Reply within minutes to inquiries'] },
      { week: 3, title: 'Build your reputation', tasks: ['Send daily photo updates to owners', 'Be reliable and punctual', 'Ask for a review after each stay', 'Build a referral base'] },
      { week: 4, title: 'Grow your client base', tasks: ['Raise rates slightly', 'Expand to drop-in visits', 'Partner with a local vet or pet shop', 'Create a regular schedule'] },
    ],
    youtubeResources: [
      { title: 'Make Money Dog Walking and Pet Sitting', channel: 'Rover Tips', searchQuery: 'make money dog walking pet sitting rover wag guide', level: 'Beginner', accent: '#f59e0b' },
      { title: 'Rover Sitter Tips: Get More Bookings', channel: 'Rover Sitter', searchQuery: 'rover pet sitter tips get more bookings', level: 'Beginner', accent: '#fbbf24' },
    ],
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
    weeklyPlan: [
      { week: 1, title: 'Master the basics', tasks: ['Study the exposure triangle (ISO, aperture, shutter)', 'Practice shooting in different lighting', 'Learn Lightroom mobile basics', 'Study 5 portrait photographers\' work'] },
      { week: 2, title: 'Build a portfolio', tasks: ['Shoot a free session for a friend', 'Edit 15 final images', 'Upload to Instagram and create a highlights reel', 'Ask for a testimonial quote'] },
      { week: 3, title: 'Get bookings', tasks: ['Tell your network you\'re taking clients', 'Price your first event fairly', 'Join local Facebook groups for event listings', 'Create a simple booking process'] },
      { week: 4, title: 'Deliver and grow', tasks: ['Shoot your first paid event', 'Deliver a beautiful edited gallery', 'Ask for a referral', 'Build a simple website'] },
    ],
    youtubeResources: [
      { title: 'Photography for Beginners: Full Course', channel: 'Mark Wallace / Adorama', searchQuery: 'photography for beginners full course 2024', level: 'Beginner', accent: '#f59e0b' },
      { title: 'How to Start a Photography Business', channel: 'Photography Life', searchQuery: 'start photography business beginner guide earn', level: 'Intermediate', accent: '#fbbf24' },
    ],
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
      'Contribute to open source to build your reputation',
    ],
    skills: ['Logical thinking', 'Problem solving', 'Patience'],
    accentLight: '#8b5cf6',
    accentDark: '#a78bfa',
    icon: 'Code2',
    suitableFor: ['student', 'employed', 'any'],
    isFeatured: true,
    weeklyPlan: [
      { week: 1, title: 'HTML & CSS basics', tasks: ['Complete freeCodeCamp HTML/CSS section', 'Build a personal webpage', 'Learn about the box model and flexbox', 'Submit your first codepen'] },
      { week: 2, title: 'CSS layout & design', tasks: ['Learn CSS Grid', 'Build a responsive landing page', 'Study colour and typography basics', 'Inspect real websites with DevTools'] },
      { week: 3, title: 'JavaScript fundamentals', tasks: ['Start JavaScript on freeCodeCamp', 'Learn variables, functions, and arrays', 'Build a simple calculator', 'Complete 10 JS exercises'] },
      { week: 4, title: 'JavaScript deeper', tasks: ['Learn DOM manipulation', 'Build a to-do app', 'Understand events and async basics', 'Push your first project to GitHub'] },
    ],
    youtubeResources: [
      { title: 'HTML & CSS Full Course for Beginners', channel: 'freeCodeCamp', searchQuery: 'freeCodeCamp HTML CSS full course beginners', level: 'Beginner', accent: '#a78bfa' },
      { title: 'JavaScript Full Course for Beginners', channel: 'freeCodeCamp', searchQuery: 'javascript full course beginners 2024 freeCodeCamp', level: 'Beginner', accent: '#8b5cf6' },
      { title: 'React Tutorial for Beginners', channel: 'Traversy Media', searchQuery: 'react tutorial for beginners 2024 traversy media', level: 'Intermediate', accent: '#7c3aed' },
    ],
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
    weeklyPlan: [
      { week: 1, title: 'Understand digital marketing', tasks: ['Enroll in Google\'s free certification', 'Complete modules 1–3', 'Read 3 case studies from HubSpot blog', 'Follow 5 marketing professionals on LinkedIn'] },
      { week: 2, title: 'SEO & content basics', tasks: ['Complete SEO modules', 'Research keywords for a topic you know', 'Write 1 SEO-optimised blog post', 'Install Google Analytics on a test site'] },
      { week: 3, title: 'Paid ads & email', tasks: ['Complete Google Ads module', 'Set up a $10 test campaign', 'Learn Mailchimp basics', 'Build a small email opt-in landing page'] },
      { week: 4, title: 'Certify and apply', tasks: ['Pass the Google certification exam', 'Add it to your LinkedIn profile', 'Create a marketing case study', 'Apply to 5 marketing roles or freelance jobs'] },
    ],
    youtubeResources: [
      { title: 'Digital Marketing Full Course', channel: 'Simplilearn', searchQuery: 'digital marketing full course beginners 2024', level: 'Beginner', accent: '#a78bfa' },
      { title: 'SEO Tutorial for Beginners', channel: 'Ahrefs', searchQuery: 'SEO tutorial beginners ahrefs 2024', level: 'Beginner', accent: '#8b5cf6' },
      { title: 'Google Ads Complete Course', channel: 'Google', searchQuery: 'google ads complete course beginners tutorial', level: 'Intermediate', accent: '#7c3aed' },
    ],
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
    weeklyPlan: [
      { week: 1, title: 'Validate your idea', tasks: ['Research Udemy bestsellers in your topic', 'Check if people are buying similar courses', 'Define your target student', 'Outline your course structure'] },
      { week: 2, title: 'Create content', tasks: ['Write scripts for first 5 lessons', 'Set up your recording space', 'Record first 3 lessons', 'Edit with DaVinci Resolve (free)'] },
      { week: 3, title: 'Finish and publish', tasks: ['Record remaining lessons', 'Create intro and outro', 'Write course description and thumbnail', 'Upload to Udemy'] },
      { week: 4, title: 'Promote and earn', tasks: ['Share to social media', 'Email your network', 'Ask for the first reviews', 'Respond to every student question'] },
    ],
    youtubeResources: [
      { title: 'How to Create an Online Course', channel: 'Sunny Lenarduzzi', searchQuery: 'how to create online course and sell it 2024', level: 'Beginner', accent: '#a78bfa' },
      { title: 'Udemy Course Creation Guide', channel: 'Udemy', searchQuery: 'udemy course creation guide beginners earn money', level: 'Beginner', accent: '#8b5cf6' },
    ],
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
    weeklyPlan: [
      { week: 1, title: 'Choose your certification', tasks: ['Research top certs in your industry', 'Check salary data on Glassdoor', 'Join a certification study group online', 'Buy or access study materials'] },
      { week: 2, title: 'Create a study plan', tasks: ['Map all exam topics', 'Set weekly study targets', 'Schedule your exam date', 'Complete first 2 study modules'] },
      { week: 3, title: 'Deep study', tasks: ['Complete 4 more modules', 'Take practice tests', 'Join a Discord or forum for your cert', 'Review weak areas'] },
      { week: 4, title: 'Final prep', tasks: ['Take 2 full mock exams', 'Review wrong answers carefully', 'Book the real exam', 'Rest well before exam day'] },
    ],
    youtubeResources: [
      { title: 'AWS Cloud Practitioner Full Course', channel: 'freeCodeCamp', searchQuery: 'AWS cloud practitioner full course 2024 freeCodeCamp', level: 'Beginner', accent: '#a78bfa' },
      { title: 'Google Data Analytics Certification', channel: 'Google Career', searchQuery: 'google data analytics professional certificate 2024', level: 'Beginner', accent: '#8b5cf6' },
    ],
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
    weeklyPlan: [
      { week: 1, title: 'Python basics', tasks: ['Complete Python intro on Codecademy (free)', 'Write your first script', 'Learn lists, dicts, and functions', 'Install VS Code and Python'] },
      { week: 2, title: 'Data manipulation', tasks: ['Learn pandas library', 'Import and clean a CSV dataset', 'Create basic visualisations', 'Complete 5 Kaggle exercises'] },
      { week: 3, title: 'Statistics basics', tasks: ['Study mean, median, variance', 'Learn about distributions', 'Complete Kaggle Intro to ML', 'Build your first model'] },
      { week: 4, title: 'First project', tasks: ['Pick a public dataset (Kaggle)', 'Write a complete analysis notebook', 'Publish to GitHub', 'Write a short description of your findings'] },
    ],
    youtubeResources: [
      { title: 'Python for Beginners – Full Course', channel: 'freeCodeCamp', searchQuery: 'python for beginners full course 2024 freeCodeCamp', level: 'Beginner', accent: '#a78bfa' },
      { title: 'Data Science Full Course', channel: 'Simplilearn', searchQuery: 'data science full course beginners 2024', level: 'Intermediate', accent: '#8b5cf6' },
      { title: 'Machine Learning Crash Course', channel: 'Google', searchQuery: 'machine learning crash course beginners google', level: 'Intermediate', accent: '#7c3aed' },
    ],
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
    weeklyPlan: [
      { week: 1, title: 'Pick your niche', tasks: ['Research 5 content niches you enjoy', 'Identify a gap in existing content', 'Create your channel/account', 'Study top 5 creators in your niche'] },
      { week: 2, title: 'Create your first video', tasks: ['Write a script or outline', 'Film your first video', 'Learn basic editing in DaVinci Resolve or CapCut', 'Add captions and a thumbnail'] },
      { week: 3, title: 'Publish and analyse', tasks: ['Publish your first video', 'Share it in relevant communities', 'Reply to every comment', 'Analyse what worked and what didn\'t'] },
      { week: 4, title: 'Build a cadence', tasks: ['Publish a second video', 'Start a content calendar', 'Batch-record for efficiency', 'Set 3-month growth goals'] },
    ],
    youtubeResources: [
      { title: 'How to Start a YouTube Channel in 2024', channel: 'Think Media', searchQuery: 'how to start youtube channel beginners 2024 think media', level: 'Beginner', accent: '#a78bfa' },
      { title: 'Video Editing Basics – Free Course', channel: 'DaVinci Resolve', searchQuery: 'davinci resolve beginners tutorial free video editing', level: 'Beginner', accent: '#8b5cf6' },
    ],
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
    isPremium: true,
    weeklyPlan: [
      { week: 1, title: 'Define your business', tasks: ['Choose your service type', 'Define your ideal customer', 'Research pricing in your market', 'Write a 1-page business plan'] },
      { week: 2, title: 'Get your first client', tasks: ['Contact 10 people in your network', 'Offer a discounted intro project', 'Prepare a simple contract template', 'Set up an invoicing system (free: Wave)'] },
      { week: 3, title: 'Deliver and learn', tasks: ['Complete your first project exceptionally', 'Document your process', 'Ask for a referral', 'Reflect on what to improve'] },
      { week: 4, title: 'Build systems', tasks: ['Create a repeatable delivery process', 'Set up a simple CRM (Notion)', 'Build a minimal website', 'Plan for your second client'] },
    ],
    youtubeResources: [
      { title: 'How to Start a Service Business', channel: 'Alex Hormozi', searchQuery: 'how to start service business from scratch 2024', level: 'Intermediate', accent: '#a78bfa' },
      { title: 'Agency Business Model Explained', channel: 'Jason Swenk', searchQuery: 'agency business model beginners how to start', level: 'Advanced', accent: '#8b5cf6' },
    ],
  },

  // ── Investing (existing, enhanced) ──────────────────────────────────────────
  {
    id: 'investing',
    term: 'long',
    category: 'Finance',
    title: 'Build an Investment Portfolio',
    description: 'Investing consistently in index funds and ETFs over time is one of the most reliable ways to build long-term wealth. Time in the market beats timing the market.',
    timeRequired: '1–3 hrs/month',
    difficulty: 'Beginner',
    earningRange: '7–10% avg. annual return (historical average — not guaranteed)',
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
    weeklyPlan: [
      { week: 1, title: 'Learn the basics', tasks: ['Read about stocks vs ETFs vs index funds', 'Understand what a brokerage account is', 'Learn what "diversification" means', 'Watch the Investing Education path in Moneo'] },
      { week: 2, title: 'Open an account', tasks: ['Compare brokers (Vanguard, Fidelity, IBKR)', 'Open and verify your account', 'Understand your country\'s tax wrapper (ISA, 401k)', 'Fund your account with a small amount'] },
      { week: 3, title: 'Make your first investment', tasks: ['Choose a broad global index fund', 'Invest a small starter amount', 'Set up a monthly recurring investment', 'Check your investment once (don\'t obsess)'] },
      { week: 4, title: 'Build good habits', tasks: ['Review your investment policy statement', 'Avoid checking prices daily', 'Set a quarterly review reminder', 'Read one personal finance book'] },
    ],
    youtubeResources: [
      { title: 'Index Funds for Beginners', channel: 'The Plain Bagel', searchQuery: 'index funds beginners plain bagel explained', level: 'Beginner', accent: '#a78bfa' },
      { title: 'How to Invest in ETFs – Beginner Guide', channel: 'Nate O\'Brien', searchQuery: 'how to invest ETFs beginners complete guide 2024', level: 'Beginner', accent: '#8b5cf6' },
    ],
  },

  // ── Investing Education (major featured path) ────────────────────────────────
  {
    id: 'learn-investing',
    term: 'long',
    category: 'Financial Education',
    title: 'Learn Investing — Full Education',
    description: 'A structured, jargon-free investing education. Learn what investing actually means, how money grows over time, and how to build good long-term financial habits. Educational only — not personalised financial advice.',
    timeRequired: '1–2 hrs/week',
    difficulty: 'Beginner',
    earningRange: 'Educational — builds long-term wealth understanding',
    startingPoint: 'Start Module 1: What Is Investing? No prior knowledge needed.',
    steps: [
      'Module 1: What is investing and why it matters',
      'Module 2: Risk vs reward — understanding the trade-off',
      'Module 3: The power of compound growth',
      'Module 4: Diversification — don\'t put all eggs in one basket',
      'Module 5: Common investment types explained',
      'Module 6: Fees, costs, and how they affect you',
      'Module 7: How to evaluate an investment',
      'Module 8: Common investing mistakes to avoid',
      'Module 9: Time horizon and why it changes everything',
      'Module 10: Building a personal financial plan',
    ],
    skills: ['Financial literacy', 'Critical thinking', 'Patience'],
    accentLight: '#10b981',
    accentDark: '#34d399',
    icon: 'PiggyBank',
    suitableFor: ['student', 'employed', 'any'],
    isFeatured: true,
    investingLessons: [
      {
        id: 'what-is-investing',
        title: 'What Is Investing?',
        summary: 'Investing means putting money to work so it can grow over time. Instead of keeping money idle in a current account (where inflation slowly erodes its value), investing places it in assets — stocks, bonds, property, or funds — that have the potential to grow. The key word is "potential" — investing always involves risk. This module is educational and does not constitute financial advice.',
        keyPoint: 'Investing is about making your money work for you over time — but always involves risk.',
        quiz: { q: 'Which of these is the main reason people invest?', options: ['To spend money faster', 'To make money grow over time', 'To avoid taxes', 'To keep money safe from theft'], correct: 1 },
        videoQuery: 'what is investing for beginners explained simply',
      },
      {
        id: 'risk-reward',
        title: 'Risk vs Reward',
        summary: 'Every investment comes with a trade-off: higher potential returns usually mean higher risk of losing money. A government bond is relatively safe but offers low returns. A single stock in a small company could double or drop to zero. Understanding your own risk tolerance — how much you can afford to lose without panicking — is one of the most important first steps. Note: this is educational information, not advice about what you should invest in.',
        keyPoint: 'Higher potential return = higher risk. There is no free lunch in investing.',
        quiz: { q: 'Generally, what happens to risk as potential return increases?', options: ['Risk decreases', 'Risk stays the same', 'Risk increases', 'Risk disappears'], correct: 2 },
        videoQuery: 'investment risk vs reward explained beginners',
      },
      {
        id: 'compound-growth',
        title: 'The Power of Compound Growth',
        summary: 'Compound growth means earning returns on your returns. If you invest $1,000 and earn 7% in year one, you have $1,070. In year two, you earn 7% on $1,070 — not just on the original $1,000. Over decades, this effect is extraordinary. Someone who starts investing at 22 can end up with substantially more than someone who starts at 32, even investing the same total amount. This mathematical principle is the core reason long-term investing is so powerful. These figures are illustrative only.',
        keyPoint: 'Starting early matters enormously. Compound growth is exponential, not linear.',
        quiz: { q: 'What does "compound growth" mean?', options: ['Earning interest only on your original investment', 'Earning returns on your returns over time', 'Investing in multiple assets', 'A government savings scheme'], correct: 1 },
        videoQuery: 'compound interest explained beginners visual example',
      },
      {
        id: 'diversification',
        title: 'Diversification',
        summary: 'Diversification means spreading your investments across many different assets so that one bad investment doesn\'t wipe out your entire portfolio. If you own 1 stock and it drops 80%, your portfolio drops 80%. If you own 500 stocks (through an index fund) and one drops 80%, your portfolio barely moves. Index funds are a popular way to diversify automatically at low cost. This module is educational — not a recommendation to buy any specific fund.',
        keyPoint: 'Don\'t put all your eggs in one basket. Spread risk across many investments.',
        quiz: { q: 'What is the main benefit of diversification?', options: ['Guaranteeing returns', 'Reducing the impact of any single bad investment', 'Paying fewer taxes', 'Investing in more expensive assets'], correct: 1 },
        videoQuery: 'diversification explained investing beginners',
      },
      {
        id: 'investment-types',
        title: 'Common Investment Types',
        summary: 'The main investment types are: Stocks (ownership shares in a company — higher risk, higher potential return), Bonds (loans to governments or companies — lower risk, lower return), Index Funds (baskets of many stocks that track a market index — broad diversification), ETFs (similar to index funds but traded on stock exchanges), and Property (real estate — illiquid but historically reliable). Each has different risk profiles, time horizons, and costs. This is educational information only.',
        keyPoint: 'Each investment type has a different risk/return profile. Index funds offer broad diversification at low cost.',
        quiz: { q: 'What does an index fund typically invest in?', options: ['One single company', 'Government savings accounts', 'A basket of many stocks tracking a market index', 'Physical gold only'], correct: 2 },
        videoQuery: 'types of investments explained beginners stocks bonds ETFs',
      },
      {
        id: 'fees',
        title: 'Fees and Their Impact',
        summary: 'Investment fees are often hidden but have a massive long-term impact. An annual fee of 1% vs 0.1% might seem small, but over 30 years on a $10,000 investment, it can mean tens of thousands of dollars less in your portfolio. Look for funds with low "expense ratios" (the annual cost as a % of your investment). Index funds and ETFs tend to have much lower fees than actively managed funds. Always check costs before investing — this applies to any investment product.',
        keyPoint: 'Small percentage fees compound over decades into very large amounts. Keep costs low.',
        quiz: { q: 'Why do investment fees matter even when they seem small?', options: ['They don\'t matter at all', 'They compound over time and reduce long-term returns', 'They are required by law', 'They guarantee better returns'], correct: 1 },
        videoQuery: 'investment fees explained expense ratio impact long term',
      },
      {
        id: 'mistakes',
        title: 'Common Investing Mistakes',
        summary: 'The most common investing mistakes are: (1) Timing the market — trying to predict when to buy and sell almost never works. (2) Panic selling — selling during a market drop locks in losses. (3) Not starting early enough — time is your biggest advantage. (4) Ignoring fees — small ongoing fees compound over decades. (5) Overconcentration — putting too much into one company or sector. Understanding these mistakes helps you avoid them. This is educational information only.',
        keyPoint: 'The biggest enemy of investing is often the investor\'s own behaviour: panic, overconfidence, and impatience.',
        quiz: { q: 'What does "panic selling" usually lead to?', options: ['Locking in gains', 'Avoiding all risk', 'Locking in losses by selling at the wrong time', 'Better long-term returns'], correct: 2 },
        videoQuery: 'common investing mistakes beginners avoid personal finance',
      },
      {
        id: 'time-horizon',
        title: 'Time Horizon',
        summary: 'Your time horizon is how long you plan to keep money invested before needing it. A longer time horizon allows you to take more risk because you have more time to recover from short-term market drops. Money you might need in 1–2 years generally shouldn\'t be exposed to stock market risk. Money you won\'t need for 10+ years can tolerate more short-term volatility in exchange for potentially higher long-term growth. This concept should inform your investment decisions — but consult a qualified financial adviser for personalised guidance.',
        keyPoint: 'The longer your time horizon, the more risk you can afford to take. Short-term money shouldn\'t be in volatile investments.',
        quiz: { q: 'If you need money in 1 year, where is it generally safest?', options: ['In high-risk stocks', 'In a savings account or cash equivalent', 'In cryptocurrency', 'In a single company\'s shares'], correct: 1 },
        videoQuery: 'time horizon investing explained short term long term',
      },
    ],
    weeklyPlan: [
      { week: 1, title: 'Foundations', tasks: ['Complete Module 1: What Is Investing?', 'Complete Module 2: Risk vs Reward', 'Watch 1 educational video', 'Write down your financial goals'] },
      { week: 2, title: 'Growth concepts', tasks: ['Complete Module 3: Compound Growth', 'Complete Module 4: Diversification', 'Calculate what compound growth means for you', 'Read about index funds'] },
      { week: 3, title: 'Investment types', tasks: ['Complete Module 5: Investment Types', 'Complete Module 6: Fees', 'Compare 2 index funds\' expense ratios', 'Open a practice investment account (paper trading)'] },
      { week: 4, title: 'Smart habits', tasks: ['Complete Module 7: Common Mistakes', 'Complete Module 8: Time Horizon', 'Define your personal time horizon', 'Research account types available in your country'] },
    ],
    youtubeResources: [
      { title: 'Investing for Beginners – Full Guide', channel: 'The Plain Bagel', searchQuery: 'investing for beginners full guide plain bagel 2024', level: 'Beginner', accent: '#34d399' },
      { title: 'How Does the Stock Market Work?', channel: 'TED-Ed', searchQuery: 'how does stock market work ted ed animated', level: 'Beginner', accent: '#10b981' },
      { title: 'Index Funds vs ETFs vs Mutual Funds', channel: 'Ben Felix', searchQuery: 'index funds ETFs mutual funds comparison explained beginners', level: 'Intermediate', accent: '#059669' },
    ],
  },

  // ── Build Your Future (premium featured) ────────────────────────────────────
  {
    id: 'build-your-future',
    term: 'long',
    category: 'Life & Career',
    title: 'Build Your Future',
    description: 'A personalised long-term roadmap for developing the skills, income streams, and financial habits that will set you up for life. This premium path adapts to your profile, tracks your milestones over months, and keeps you moving forward — not just inspired for a day.',
    timeRequired: '3–5 hrs/week',
    difficulty: 'Intermediate',
    earningRange: 'Income potential grows with each milestone reached',
    startingPoint: 'Complete your Moneo profile, then start Week 1: Understanding where you are today.',
    steps: [
      'Assess your current skills and income sources honestly',
      'Define 1 short-term and 1 long-term earning goal',
      'Choose 1 skill to develop consistently over 3 months',
      'Build a simple financial safety net (3-month emergency fund)',
      'Start a learnable skill that compounds in value over time',
      'Connect your learning to your first real income',
      'Review and update your goals every 30 days',
      'Add a second income stream once the first is stable',
      'Build a portfolio or track record you can show others',
      'Reinvest a percentage of new income into learning',
      'Set 6-month and 12-month milestone targets',
      'Celebrate every meaningful step — progress is the goal',
    ],
    skills: ['Self-awareness', 'Goal-setting', 'Consistency', 'Financial literacy'],
    accentLight: '#6366f1',
    accentDark: '#818cf8',
    icon: 'TrendingUp',
    suitableFor: ['student', 'employed', 'any'],
    isFeatured: true,
    isPremium: true,
    weeklyPlan: [
      { week: 1, title: 'Know where you stand', tasks: ['Write your current monthly income (all sources)', 'Write your current monthly expenses', 'List 3 skills you already have', 'List 3 skills you want to develop'] },
      { week: 2, title: 'Set your direction', tasks: ['Choose 1 earning opportunity to pursue', 'Set a 90-day income goal', 'Identify the #1 skill that will get you there', 'Start 30 minutes of daily learning'] },
      { week: 3, title: 'Build your foundation', tasks: ['Create an emergency fund savings goal in Moneo', 'Start your chosen skill path', 'Complete 3 learning sessions this week', 'Track all income and expenses in Moneo'] },
      { week: 4, title: 'Take the first step', tasks: ['Apply what you\'ve learned to a real opportunity', 'Tell someone about your goal (accountability)', 'Review your week: what worked?', 'Set goals for next month'] },
    ],
    youtubeResources: [
      { title: 'How to Build Multiple Income Streams', channel: 'Ali Abdaal', searchQuery: 'build multiple income streams beginners ali abdaal', level: 'Beginner', accent: '#818cf8' },
      { title: 'Goal Setting That Actually Works', channel: 'Thomas Frank', searchQuery: 'goal setting that actually works productivity 2024', level: 'Beginner', accent: '#6366f1' },
      { title: 'How to Get Rich Without Getting Lucky', channel: 'Naval Ravikant', searchQuery: 'how to get rich without getting lucky naval ravikant', level: 'Intermediate', accent: '#7c3aed' },
    ],
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
    const ids = ['certifications', 'digital-marketing', 'learn-investing'];
    ids.forEach(id => {
      const opp = EARN_OPPORTUNITIES.find(o => o.id === id);
      if (opp) recommendations.push(opp);
    });
  } else {
    const ids = ['social-media', 'learn-investing', 'build-your-future'];
    ids.forEach(id => {
      const opp = EARN_OPPORTUNITIES.find(o => o.id === id);
      if (opp) recommendations.push(opp);
    });
  }

  return recommendations.slice(0, 3);
}
