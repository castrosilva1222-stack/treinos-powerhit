import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types para o banco de dados
export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  weekly_goal: number;
}

export interface WorkoutProgress {
  id: string;
  user_id: string;
  workout_date: string;
  completed: boolean;
  exercises_completed: number;
  total_exercises: number;
  duration_seconds: number;
  created_at: string;
}
