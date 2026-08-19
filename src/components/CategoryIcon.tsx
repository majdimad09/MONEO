import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Car,
  ShoppingBag,
  Film,
  Receipt,
  Home,
  HeartPulse,
  Plane,
  GraduationCap,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Building,
  Gift,
  Coins,
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types/finance';

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
  const normCategory = category.toLowerCase().trim();

  // Find in defined categories
  const expenseCat = EXPENSE_CATEGORIES.find(
    (c) => c.name.toLowerCase() === normCategory
  );
  const incomeCat = INCOME_CATEGORIES.find(
    (c) => c.name.toLowerCase() === normCategory
  );

  const iconName = expenseCat?.iconName || incomeCat?.iconName;

  switch (iconName) {
    case 'Utensils':
      return <Utensils size={size} className={className} />;
    case 'ShoppingCart':
      return <ShoppingCart size={size} className={className} />;
    case 'Car':
      return <Car size={size} className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag size={size} className={className} />;
    case 'Film':
      return <Film size={size} className={className} />;
    case 'Receipt':
      return <Receipt size={size} className={className} />;
    case 'Home':
      return <Home size={size} className={className} />;
    case 'HeartPulse':
      return <HeartPulse size={size} className={className} />;
    case 'Plane':
      return <Plane size={size} className={className} />;
    case 'GraduationCap':
      return <GraduationCap size={size} className={className} />;
    case 'Briefcase':
      return <Briefcase size={size} className={className} />;
    case 'Laptop':
      return <Laptop size={size} className={className} />;
    case 'TrendingUp':
      return <TrendingUp size={size} className={className} />;
    case 'Building':
      return <Building size={size} className={className} />;
    case 'Gift':
      return <Gift size={size} className={className} />;
    case 'Coins':
      return <Coins size={size} className={className} />;
    default:
      if (type === 'income') {
        return <ArrowUpRight size={size} className={className} />;
      }
      if (normCategory.includes('food') || normCategory.includes('dinner') || normCategory.includes('lunch') || normCategory.includes('cafe')) {
        return <Utensils size={size} className={className} />;
      }
      if (normCategory.includes('shop') || normCategory.includes('clothes') || normCategory.includes('store')) {
        return <ShoppingBag size={size} className={className} />;
      }
      if (normCategory.includes('gas') || normCategory.includes('uber') || normCategory.includes('taxi') || normCategory.includes('bus') || normCategory.includes('train')) {
        return <Car size={size} className={className} />;
      }
      if (normCategory.includes('rent') || normCategory.includes('house') || normCategory.includes('apartment')) {
        return <Home size={size} className={className} />;
      }
      if (normCategory.includes('salary') || normCategory.includes('pay') || normCategory.includes('wage')) {
        return <Briefcase size={size} className={className} />;
      }
      return <MoreHorizontal size={size} className={className} />;
  }
};

export function getCategoryColor(category: string, type: 'income' | 'expense' = 'expense'): string {
  const normCategory = category.toLowerCase().trim();
  const expenseCat = EXPENSE_CATEGORIES.find((c) => c.name.toLowerCase() === normCategory);
  if (expenseCat) return expenseCat.color;

  const incomeCat = INCOME_CATEGORIES.find((c) => c.name.toLowerCase() === normCategory);
  if (incomeCat) return incomeCat.color;

  // Fallback palette based on category string hash
  const fallbackColors = [
    '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
    '#06b6d4', '#eab308', '#6366f1', '#14b8a6', '#f43f5e'
  ];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % fallbackColors.length;
  return fallbackColors[index];
}
