import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!url || !key) {
  // eslint-disable-next-line no-console
  console.warn("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY env vars");
}

export const supabase = createClient(url ?? "", key ?? "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  country: string | null;
  gender: string | null;
  profession: string | null;
  blood_type: string | null;
  allergies: string | null;
  health_conditions: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  profile_photo_url: string | null;
  updated_at?: string;
};
