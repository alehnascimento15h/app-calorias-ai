// Tipos do BR AI Calorias

export interface UserProfile {
  // Informações pessoais
  name: string;
  email: string;
  password: string;
  birthDate: string;
  gender?: 'male' | 'female' | 'other';
  
  // Informações de fitness
  weeklyWorkouts: '2' | '3-5' | '6+';
  goal: 'lose' | 'gain' | 'maintain';
  currentWeight: number;
  targetWeight: number;
  obstacles: string[];
  achievements: string[];
  
  // Configurações
  language: string;
  isPremium: boolean;
  dailyCalorieGoal: number;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  imageUrl?: string;
  foods: FoodItem[];
  totalCalories: number;
  timestamp: Date;
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
}

export interface DailyProgress {
  date: string;
  caloriesConsumed: number;
  caloriesGoal: number;
  caloriesBurned: number;
  meals: Meal[];
  workouts: Workout[];
}

export interface Workout {
  id: string;
  type: 'run' | 'walk' | 'gym' | 'other';
  duration: number; // minutos
  distance?: number; // km
  caloriesBurned: number;
  avgSpeed?: number;
  timestamp: Date;
}

export interface Subscription {
  plan: 'free' | 'monthly' | 'yearly';
  price: number;
  features: string[];
  isActive: boolean;
  expiresAt?: Date;
}

export const LANGUAGES = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export const OBSTACLES = [
  'Falta de consistência',
  'Hábitos alimentares ruins',
  'Falta de apoio',
  'Agenda lotada',
  'Falta de inspiração para refeições',
];

export const ACHIEVEMENTS = [
  'Comer e viver de forma mais saudável',
  'Aumentar energia e melhorar humor',
  'Manter-se motivado e consistente',
  'Sentir-se melhor com o corpo',
];
