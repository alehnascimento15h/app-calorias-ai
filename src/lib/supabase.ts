import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  activity_level: string;
  calories_goal: number;
  water_goal: number;
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  time: string;
  icon: string;
  meal_type: string;
  image_url?: string;
  description?: string;
  date: string;
  created_at: string;
}

export interface WaterIntake {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  type: string;
  distance: number;
  duration: number;
  calories_burned: number;
  route?: any;
  date: string;
  created_at: string;
}

// User Profile Functions
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as UserProfile;
}

export async function createUserProfile(profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('users')
    .insert([profile])
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

// Meals Functions
export async function getMealsByDate(userId: string, date: string) {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('time', { ascending: true });

  if (error) throw error;
  return data as Meal[];
}

export async function createMeal(meal: Omit<Meal, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('meals')
    .insert([meal])
    .select()
    .single();

  if (error) throw error;
  return data as Meal;
}

export async function deleteMeal(mealId: string) {
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('id', mealId);

  if (error) throw error;
}

// Water Intake Functions
export async function getWaterIntakeByDate(userId: string, date: string) {
  const { data, error } = await supabase
    .from('water_intake')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);

  if (error) throw error;
  return data as WaterIntake[];
}

export async function addWaterIntake(intake: Omit<WaterIntake, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('water_intake')
    .insert([intake])
    .select()
    .single();

  if (error) throw error;
  return data as WaterIntake;
}

// Activities Functions
export async function getActivitiesByDate(userId: string, date: string) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Activity[];
}

export async function createActivity(activity: Omit<Activity, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('activities')
    .insert([activity])
    .select()
    .single();

  if (error) throw error;
  return data as Activity;
}

// Helper function to get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
