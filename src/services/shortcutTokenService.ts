/* eslint-disable prettier/prettier */
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export interface ShortcutToken {
  id: string;
  user_id: string;
  token: string;
  device_name: string | null;
  active: boolean;
  created_at: string;
  last_used: string | null;
}

export async function getShortcutToken() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  const { data, error } = await supabase
    .from("shortcut_tokens")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return data as ShortcutToken | null;
}

export async function createShortcutToken(deviceName?: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  const token = uuidv4();

  const { data, error } = await supabase
    .from("shortcut_tokens")
    .insert({
      user_id: user.id,
      token,
      device_name: deviceName ?? null,
      active: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ShortcutToken;
}

export async function getOrCreateShortcutToken(deviceName?: string) {
  const existingToken = await getShortcutToken();

  if (existingToken) {
    return existingToken;
  }

  return createShortcutToken(deviceName);
}

export async function regenerateShortcutToken(deviceName?: string) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  const { error: disableError } = await supabase
    .from("shortcut_tokens")
    .update({
      active: false,
    })
    .eq("user_id", user.id)
    .eq("active", true);

  if (disableError) {
    throw new Error(disableError.message);
  }

  return createShortcutToken(deviceName);
}

export async function disableShortcutToken() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  const { error } = await supabase
    .from("shortcut_tokens")
    .update({
      active: false,
    })
    .eq("user_id", user.id)
    .eq("active", true);

  if (error) {
    throw new Error(error.message);
  }
}
