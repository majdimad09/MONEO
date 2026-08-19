export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: number;
  note?: string;
}

export interface CategoryInfo {
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export const EXPENSE_CATEGORIES: CategoryInfo[] = [
  { name: 'Food', iconName: 'Utensils', color: '#f97316', bgColor: 'bg-orange-500/10', textColor: 'text-orange-400' },
  { name: 'Groceries', iconName: 'ShoppingCart', color: '#10b981', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400' },
  { name: 'Transport', iconName: 'Car', color: '#3b82f6', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' },
  { name: 'Shopping', iconName: 'ShoppingBag', color: '#ec4899', bgColor: 'bg-pink-500/10', textColor: 'text-pink-400' },
  { name: 'Entertainment', iconName: 'Film', color: '#8b5cf6', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400' },
  { name: 'Bills', iconName: 'Receipt', color: '#eab308', bgColor: 'bg-amber-500/10', textColor: 'text-amber-400' },
  { name: 'Rent', iconName: 'Home', color: '#6366f1', bgColor: 'bg-indigo-500/10', textColor: 'text-indigo-400' },
  { name: 'Health', iconName: 'HeartPulse', color: '#ef4444', bgColor: 'bg-rose-500/10', textColor: 'text-rose-400' },
  { name: 'Travel', iconName: 'Plane', color: '#06b6d4', bgColor: 'bg-cyan-500/10', textColor: 'text-cyan-400' },
  { name: 'Education', iconName: 'GraduationCap', color: '#14b8a6', bgColor: 'bg-teal-500/10', textColor: 'text-teal-400' },
  { name: 'Subscriptions', iconName: 'Repeat', color: '#a855f7', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400' },
  { name: 'Other', iconName: 'MoreHorizontal', color: '#64748b', bgColor: 'bg-slate-500/10', textColor: 'text-slate-400' },
];

export const INCOME_CATEGORIES: CategoryInfo[] = [
  { name: 'Salary', iconName: 'Briefcase', color: '#10b981', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400' },
  { name: 'Freelance', iconName: 'Laptop', color: '#06b6d4', bgColor: 'bg-cyan-500/10', textColor: 'text-cyan-400' },
  { name: 'Investments', iconName: 'TrendingUp', color: '#8b5cf6', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400' },
  { name: 'Business', iconName: 'Building', color: '#3b82f6', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' },
  { name: 'Gift', iconName: 'Gift', color: '#f59e0b', bgColor: 'bg-amber-500/10', textColor: 'text-amber-400' },
  { name: 'Other', iconName: 'Coins', color: '#64748b', bgColor: 'bg-slate-500/10', textColor: 'text-slate-400' },
];

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-IE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound', locale: 'ar-LB' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar', locale: 'ar-BH' },
  { code: 'DZD', symbol: 'DA', name: 'Algerian Dinar', locale: 'ar-DZ' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', locale: 'ar-EG' },
  { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar', locale: 'ar-IQ' },
  { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar', locale: 'ar-JO' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar', locale: 'ar-KW' },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham', locale: 'ar-MA' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial', locale: 'ar-OM' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', locale: 'ar-QA' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', locale: 'ar-SA' },
  { code: 'SYP', symbol: '£S', name: 'Syrian Pound', locale: 'ar-SY' },
  { code: 'TND', symbol: 'DT', name: 'Tunisian Dinar', locale: 'ar-TN' },
  { code: 'YER', symbol: '﷼', name: 'Yemeni Rial', locale: 'ar-YE' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', locale: 'bn-BD' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'en-HK' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', locale: 'si-LK' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
  { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee', locale: 'ne-NP' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', locale: 'ur-PK' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH' },
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar', locale: 'zh-TW' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', locale: 'bg-BG' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'CHF', symbol: 'Fr.', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', locale: 'cs-CZ' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK' },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari', locale: 'ka-GE' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', locale: 'hu-HU' },
  { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel', locale: 'he-IL' },
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge', locale: 'kk-KZ' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', locale: 'ro-RO' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', locale: 'uk-UA' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso', locale: 'es-AR' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso', locale: 'es-CL' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso', locale: 'es-CO' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', locale: 'es-MX' },
  { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', locale: 'es-PE' },
  { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso', locale: 'es-UY' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', locale: 'en-GH' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
];

export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  count: number;
  color: string;
}

// --- New feature types ---

export interface CategoryLimit {
  category: string;
  limit: number;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM
  createdAt: number;
}

export type SubscriptionFrequency = 'weekly' | 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  frequency: SubscriptionFrequency;
  nextPaymentDate: string; // YYYY-MM-DD
  category: string;
  isActive: boolean;
  createdAt: number;
}

export type AppView = 'landing' | 'dashboard' | 'transactions' | 'budget' | 'goals' | 'subscriptions' | 'insights';
