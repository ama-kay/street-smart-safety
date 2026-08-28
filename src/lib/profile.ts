/* eslint-disable prettier/prettier */
import { supabase } from "./supabase";

export async function getUserProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_profile")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}
