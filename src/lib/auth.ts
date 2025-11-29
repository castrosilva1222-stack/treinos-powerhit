import { supabase } from './supabase';

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
