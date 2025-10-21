// src/env.ts
export const env = {
  supabaseUrl: (import.meta as any).env.VITE_SUPABASE_URL,
  supabaseAnonKey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY,
};
