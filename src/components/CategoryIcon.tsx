import React from 'react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types/finance';

// ─── Color lookup (unchanged API) ────────────────────────────────────────────

export function getCategoryColor(
  category: string,
  type: 'income' | 'expense' = 'expense',
): string {
  const norm = category.toLowerCase().trim();
  const expCat = EXPENSE_CATEGORIES.find(c => c.name.toLowerCase() === norm);
  if (expCat) return expCat.color;
  const incCat = INCOME_CATEGORIES.find(c => c.name.toLowerCase() === norm);
  if (incCat) return incCat.color;

  // hash-based fallback
  const palette = [
    '#10b981','#3b82f6','#8b5cf6','#ec4899','#f97316',
    '#06b6d4','#eab308','#6366f1','#14b8a6','#f43f5e',
  ];
  let h = 0;
  for (let i = 0; i < category.length; i++) h = category.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

// ─── Individual SVG icon shapes (24×24 viewBox, filled, currentColor) ────────

// Food: steaming bowl
const FoodIcon = () => (
  <>
    {/* Steam */}
    <path d="M9 7c0-1.1.8-1.1.8-2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5"/>
    <path d="M12 7c0-1.1.8-1.1.8-2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5"/>
    <path d="M15 7c0-1.1.8-1.1.8-2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.5"/>
    {/* Bowl body */}
    <path d="M3 10h18c0 5.25-4.03 9.5-9 9.5S3 15.25 3 10z" fill="currentColor"/>
    {/* Rim */}
    <ellipse cx="12" cy="10" rx="9" ry="1.6" fill="currentColor" opacity="0.35"/>
  </>
);

// Groceries: shopping cart
const GroceriesIcon = () => (
  <>
    {/* Cart basket */}
    <path d="M6 5H4.5L3 2H1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    <path d="M4.5 5h14.5l-2 9H6.5z" fill="currentColor"/>
    {/* Item in cart */}
    <path d="M8 9h8" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
    {/* Wheels */}
    <circle cx="8.5" cy="19.5" r="2" fill="currentColor"/>
    <circle cx="17.5" cy="19.5" r="2" fill="currentColor"/>
    {/* Wheel highlight */}
    <circle cx="8.5" cy="19.5" r="1" fill="currentColor" opacity="0.3"/>
    <circle cx="17.5" cy="19.5" r="1" fill="currentColor" opacity="0.3"/>
  </>
);

// Transport: car side view
const TransportIcon = () => (
  <>
    {/* Car body */}
    <rect x="1" y="11" width="22" height="8" rx="2.5" fill="currentColor"/>
    {/* Roof cabin */}
    <path d="M6 11l3-5h6l3 5z" fill="currentColor" opacity="0.75"/>
    {/* Windows */}
    <path d="M7.5 10.5l2-3.5h5l2 3.5z" fill="white" opacity="0.35"/>
    {/* Wheels */}
    <circle cx="6.5" cy="19.5" r="2.5" fill="currentColor" opacity="0.85"/>
    <circle cx="17.5" cy="19.5" r="2.5" fill="currentColor" opacity="0.85"/>
    <circle cx="6.5" cy="19.5" r="1.1" fill="white" opacity="0.4"/>
    <circle cx="17.5" cy="19.5" r="1.1" fill="white" opacity="0.4"/>
  </>
);

// Shopping: bag with handles
const ShoppingIcon = () => (
  <>
    {/* Handles */}
    <path d="M9 7V5a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    {/* Bag body */}
    <rect x="4" y="7" width="16" height="14" rx="2.5" fill="currentColor"/>
    {/* Shine stripe */}
    <rect x="4" y="7" width="16" height="4" rx="2.5" fill="currentColor" opacity="0.4"/>
    {/* Handle cutout */}
    <path d="M9.5 11V9a2.5 2.5 0 0 1 5 0v2" stroke="white" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.45"/>
  </>
);

// Entertainment: popcorn bucket
const EntertainmentIcon = () => (
  <>
    {/* Bucket body */}
    <path d="M5 9h14l-2 12H7z" fill="currentColor"/>
    {/* Stripe */}
    <path d="M9 9l-1 12M15 9l1 12" stroke="white" strokeWidth="2" opacity="0.25"/>
    {/* Top stripe */}
    <rect x="4" y="7" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.7"/>
    {/* Popcorn puffs */}
    <circle cx="9" cy="5.5" r="2.5" fill="currentColor"/>
    <circle cx="12" cy="4.5" r="2.5" fill="currentColor" opacity="0.85"/>
    <circle cx="15" cy="5.5" r="2.5" fill="currentColor" opacity="0.7"/>
    <circle cx="7.5" cy="6.5" r="1.8" fill="currentColor" opacity="0.6"/>
    <circle cx="16.5" cy="6.5" r="1.8" fill="currentColor" opacity="0.6"/>
  </>
);

// Bills: lightning bolt
const BillsIcon = () => (
  <>
    <polygon points="13,2 6,13 12,13 11,22 18,11 12,11" fill="currentColor"/>
    <polygon points="13,2 6,13 12,13 11,22 18,11 12,11" fill="white" opacity="0.15"
      style={{ transform: 'translate(0.5px, 0.5px)' }}/>
  </>
);

// Rent/Housing: house with door
const RentIcon = () => (
  <>
    {/* Roof */}
    <path d="M2 11L12 3l10 8" fill="currentColor" opacity="0.75"/>
    {/* Walls */}
    <rect x="4" y="11" width="16" height="11" rx="1" fill="currentColor"/>
    {/* Door */}
    <rect x="9.5" y="16" width="5" height="6" rx="1" fill="white" opacity="0.4"/>
    {/* Window */}
    <rect x="5.5" y="13" width="4" height="3.5" rx="0.8" fill="white" opacity="0.35"/>
    <rect x="14.5" y="13" width="4" height="3.5" rx="0.8" fill="white" opacity="0.35"/>
    {/* Chimney */}
    <rect x="15" y="5" width="2.5" height="4" rx="0.5" fill="currentColor" opacity="0.6"/>
  </>
);

// Health: heart with pulse
const HealthIcon = () => (
  <>
    {/* Heart */}
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="currentColor"/>
    {/* Pulse line */}
    <path d="M7 11h2l1.5-3 2 6 1.5-3H17" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55"/>
  </>
);

// Travel: airplane
const TravelIcon = () => (
  <>
    {/* Fuselage */}
    <path d="M21 16l-9-5V4a2 2 0 0 0-4 0v7L3 16v2l9-2.5V18l-2 1.5V21l3-1 3 1v-1.5L14 18v-2.5L21 18v-2z"
      fill="currentColor"/>
  </>
);

// Education: graduation cap
const EducationIcon = () => (
  <>
    {/* Board (flat part) */}
    <path d="M12 3L2 8l10 5 10-5z" fill="currentColor"/>
    {/* Cap top square */}
    <rect x="7" y="3" width="10" height="2" rx="0.5" fill="currentColor" opacity="0.5"/>
    {/* Gown/shoulders */}
    <path d="M6 10v5c0 2.76 2.69 5 6 5s6-2.24 6-5v-5L12 13 6 10z" fill="currentColor" opacity="0.8"/>
    {/* Tassel */}
    <circle cx="20" cy="8" r="1.2" fill="currentColor" opacity="0.65"/>
    <line x1="20" y1="9.2" x2="20" y2="14" stroke="currentColor" strokeWidth="1.2" opacity="0.65"/>
  </>
);

// Subscriptions: play circle
const SubscriptionsIcon = () => (
  <>
    {/* Circle */}
    <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.85"/>
    {/* Play triangle */}
    <path d="M10 8.5l6 3.5-6 3.5z" fill="white" opacity="0.9"/>
    {/* Outer ring detail */}
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
  </>
);

// Other: three dots
const OtherIcon = () => (
  <>
    <circle cx="5" cy="12" r="2.5" fill="currentColor"/>
    <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.75"/>
    <circle cx="19" cy="12" r="2.5" fill="currentColor" opacity="0.5"/>
  </>
);

// Salary: briefcase with dollar
const SalaryIcon = () => (
  <>
    {/* Briefcase body */}
    <rect x="2" y="8" width="20" height="13" rx="2.5" fill="currentColor"/>
    {/* Handle */}
    <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6"/>
    {/* Center clasp */}
    <rect x="9" y="14" width="6" height="2" rx="1" fill="white" opacity="0.4"/>
    {/* Dollar lines */}
    <line x1="12" y1="11" x2="12" y2="18" stroke="white" strokeWidth="1.3" opacity="0.5" strokeLinecap="round"/>
    <path d="M10.5 12.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3" stroke="white" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round"/>
  </>
);

// Freelance: laptop
const FreelanceIcon = () => (
  <>
    {/* Screen */}
    <rect x="3" y="4" width="18" height="13" rx="2" fill="currentColor" opacity="0.8"/>
    {/* Screen content lines */}
    <rect x="5" y="6.5" width="10" height="1.2" rx="0.6" fill="white" opacity="0.4"/>
    <rect x="5" y="9" width="7" height="1.2" rx="0.6" fill="white" opacity="0.3"/>
    <rect x="5" y="11.5" width="8" height="1.2" rx="0.6" fill="white" opacity="0.25"/>
    {/* Keyboard base */}
    <path d="M2 17h20l-1 3H3z" fill="currentColor"/>
    {/* Trackpad */}
    <rect x="9" y="18.5" width="6" height="1.5" rx="0.75" fill="white" opacity="0.35"/>
  </>
);

// Investments: chart line up
const InvestmentsIcon = () => (
  <>
    {/* Background area fill */}
    <path d="M3 18L8 11l4 3 5-8 4 5v7z" fill="currentColor" opacity="0.25"/>
    {/* Chart line */}
    <path d="M3 18L8 11l4 3 5-8 4 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Arrow up */}
    <path d="M18 6l3 3M21 6l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    {/* Dots on chart */}
    <circle cx="8" cy="11" r="1.3" fill="currentColor"/>
    <circle cx="12" cy="14" r="1.3" fill="currentColor" opacity="0.7"/>
    <circle cx="17" cy="6" r="1.3" fill="currentColor"/>
  </>
);

// Business: building with windows
const BusinessIcon = () => (
  <>
    {/* Main building */}
    <rect x="4" y="4" width="10" height="18" rx="1" fill="currentColor"/>
    {/* Side building */}
    <rect x="13" y="9" width="7" height="13" rx="1" fill="currentColor" opacity="0.65"/>
    {/* Windows main */}
    <rect x="6" y="6.5" width="2.5" height="2" rx="0.4" fill="white" opacity="0.45"/>
    <rect x="9.5" y="6.5" width="2.5" height="2" rx="0.4" fill="white" opacity="0.45"/>
    <rect x="6" y="10.5" width="2.5" height="2" rx="0.4" fill="white" opacity="0.35"/>
    <rect x="9.5" y="10.5" width="2.5" height="2" rx="0.4" fill="white" opacity="0.35"/>
    <rect x="6" y="14.5" width="2.5" height="2" rx="0.4" fill="white" opacity="0.3"/>
    <rect x="9.5" y="14.5" width="2.5" height="2" rx="0.4" fill="white" opacity="0.3"/>
    {/* Windows side */}
    <rect x="15" y="11.5" width="2" height="2" rx="0.4" fill="white" opacity="0.35"/>
    <rect x="15" y="15" width="2" height="2" rx="0.4" fill="white" opacity="0.3"/>
    {/* Door */}
    <rect x="7.5" y="18.5" width="3" height="3.5" rx="0.5" fill="white" opacity="0.4"/>
  </>
);

// Gift: wrapped box with bow
const GiftIcon = () => (
  <>
    {/* Box */}
    <rect x="3" y="11" width="18" height="11" rx="1.5" fill="currentColor"/>
    {/* Lid */}
    <rect x="2" y="8" width="20" height="4" rx="1.5" fill="currentColor" opacity="0.75"/>
    {/* Vertical ribbon */}
    <rect x="11" y="8" width="2" height="14" rx="0.5" fill="white" opacity="0.4"/>
    {/* Horizontal ribbon on lid */}
    <rect x="2" y="10" width="20" height="2" rx="0" fill="white" opacity="0.3"/>
    {/* Bow loops */}
    <path d="M12 8c0 0-4-1-4-4s4-1 4 4z" fill="currentColor" opacity="0.85"/>
    <path d="M12 8c0 0 4-1 4-4s-4-1-4 4z" fill="currentColor" opacity="0.85"/>
    {/* Bow knot */}
    <circle cx="12" cy="8" r="1.5" fill="currentColor" opacity="0.9"/>
  </>
);

// Income Other: coin stack
const CoinsIcon = () => (
  <>
    {/* Back coins */}
    <ellipse cx="12" cy="17" rx="8" ry="2.5" fill="currentColor" opacity="0.30"/>
    <rect x="4" y="14.5" width="16" height="2.5" fill="currentColor" opacity="0.30"/>
    {/* Middle coin */}
    <ellipse cx="12" cy="13" rx="8" ry="2.5" fill="currentColor" opacity="0.55"/>
    <rect x="4" y="10.5" width="16" height="2.5" fill="currentColor" opacity="0.55"/>
    {/* Front coin top */}
    <ellipse cx="12" cy="10.5" rx="8" ry="2.5" fill="currentColor"/>
    <rect x="4" y="8" width="16" height="2.5" fill="currentColor"/>
    {/* Coin face */}
    <ellipse cx="12" cy="8" rx="8" ry="2.5" fill="currentColor" opacity="0.9"/>
    {/* Shine arc */}
    <path d="M7 7c1.2-0.8 3-1.2 5-1.2" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.45"/>
    {/* Center line */}
    <line x1="12" y1="6.5" x2="12" y2="9.5" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.35"/>
    <line x1="10.2" y1="7.3" x2="13.8" y2="7.3" stroke="white" strokeWidth="0.9" strokeLinecap="round" opacity="0.3"/>
    <line x1="10.2" y1="8.7" x2="13.8" y2="8.7" stroke="white" strokeWidth="0.9" strokeLinecap="round" opacity="0.3"/>
  </>
);

// ─── Category → icon component map ───────────────────────────────────────────

type IconComponent = React.FC;

const CATEGORY_ICON_MAP: Record<string, IconComponent> = {
  // Expense
  'food':          FoodIcon,
  'groceries':     GroceriesIcon,
  'transport':     TransportIcon,
  'shopping':      ShoppingIcon,
  'entertainment': EntertainmentIcon,
  'bills':         BillsIcon,
  'rent':          RentIcon,
  'health':        HealthIcon,
  'travel':        TravelIcon,
  'education':     EducationIcon,
  'subscriptions': SubscriptionsIcon,
  'other':         OtherIcon,
  // Income
  'salary':        SalaryIcon,
  'freelance':     FreelanceIcon,
  'investments':   InvestmentsIcon,
  'business':      BusinessIcon,
  'gift':          GiftIcon,
};

// ─── Fuzzy match for user-entered descriptions ────────────────────────────────

function resolveIcon(category: string, type: 'income' | 'expense'): IconComponent {
  const norm = category.toLowerCase().trim();

  // Exact match first
  if (CATEGORY_ICON_MAP[norm]) return CATEGORY_ICON_MAP[norm];

  // Income fallbacks
  if (type === 'income') {
    if (norm.includes('salary') || norm.includes('wage') || norm.includes('pay')) return SalaryIcon;
    if (norm.includes('freelan') || norm.includes('contract') || norm.includes('client')) return FreelanceIcon;
    if (norm.includes('invest') || norm.includes('dividend') || norm.includes('stock')) return InvestmentsIcon;
    if (norm.includes('business') || norm.includes('company') || norm.includes('revenue')) return BusinessIcon;
    if (norm.includes('gift') || norm.includes('bonus') || norm.includes('reward')) return GiftIcon;
    return CoinsIcon;
  }

  // Expense fallbacks
  if (norm.includes('food') || norm.includes('restaurant') || norm.includes('cafe') || norm.includes('coffee') || norm.includes('dining') || norm.includes('meal')) return FoodIcon;
  if (norm.includes('grocer') || norm.includes('supermarket') || norm.includes('market')) return GroceriesIcon;
  if (norm.includes('transport') || norm.includes('car') || norm.includes('gas') || norm.includes('uber') || norm.includes('taxi') || norm.includes('bus') || norm.includes('train') || norm.includes('fuel')) return TransportIcon;
  if (norm.includes('shop') || norm.includes('clothes') || norm.includes('fashion') || norm.includes('retail')) return ShoppingIcon;
  if (norm.includes('entertain') || norm.includes('game') || norm.includes('movie') || norm.includes('cinema') || norm.includes('netflix') || norm.includes('streaming')) return EntertainmentIcon;
  if (norm.includes('bill') || norm.includes('electric') || norm.includes('water') || norm.includes('utility') || norm.includes('internet') || norm.includes('phone')) return BillsIcon;
  if (norm.includes('rent') || norm.includes('house') || norm.includes('home') || norm.includes('apartment') || norm.includes('mortgage')) return RentIcon;
  if (norm.includes('health') || norm.includes('medical') || norm.includes('doctor') || norm.includes('pharma') || norm.includes('gym') || norm.includes('fitness')) return HealthIcon;
  if (norm.includes('travel') || norm.includes('flight') || norm.includes('hotel') || norm.includes('vacation') || norm.includes('trip')) return TravelIcon;
  if (norm.includes('educat') || norm.includes('school') || norm.includes('course') || norm.includes('book') || norm.includes('tuition')) return EducationIcon;
  if (norm.includes('subscri') || norm.includes('spotify') || norm.includes('youtube') || norm.includes('netflix') || norm.includes('stream') || norm.includes('music')) return SubscriptionsIcon;
  if (norm.includes('gift') || norm.includes('present')) return GiftIcon;

  return OtherIcon;
}

// ─── Public component (identical API to the original) ────────────────────────

interface CategoryIconProps {
  category: string;
  type?: 'income' | 'expense';
  size?: number;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  type = 'expense',
  size = 18,
  className = '',
}) => {
  const color = getCategoryColor(category, type);
  const IconShape = resolveIcon(category, type);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ color, overflow: 'visible', flexShrink: 0 }}
      aria-hidden="true"
    >
      <IconShape />
    </svg>
  );
};
