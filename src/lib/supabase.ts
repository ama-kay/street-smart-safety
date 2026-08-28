/* eslint-disable prettier/prettier */
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
   import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

supabase
  .channel("sos-alerts")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "sos_alerts" },
    (payload) => {
      console.log("New SOS:", payload);
    }
  )
  .subscribe();