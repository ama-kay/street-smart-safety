/* eslint-disable prettier/prettier */

import { supabase } from "@/lib/supabase";

/* =========================================================
   SIGN UP
========================================================= */

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  otherNames: string;
  phone: string;
}

export async function signupUser({
  email,
  password,
  firstName,
  lastName,
  otherNames,
  phone,
}: SignupData) {
  const { data, error: signupError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signupError) {
    return {
      user: null,
      error: signupError.message,
    };
  }

  if (!data.user) {
    return {
      user: null,
      error: "Unable to create account",
    };
  }

  /*
   * New users have not completed the Street Smart setup yet.
   */
  const { error: profileError } = await supabase
    .from("user_profile")
    .insert({
      user_id: data.user.id,
      first_name: firstName,
      last_name: lastName,
      other_names: otherNames,
      email,
      phone,
      setup_completed: false,
    });

  if (profileError) {
    return {
      user: null,
      error: profileError.message,
    };
  }

  return {
    user: data.user,
    error: null,
  };
}

/* =========================================================
   LOGIN
========================================================= */

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      user: null,
      session: null,
      setupCompleted: false,
      error: error.message,
    };
  }

  /*
   * Get the user's setup status immediately after login.
   */
  const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select("setup_completed")
    .eq("user_id", data.user.id)
    .single();

  if (profileError) {
    return {
      user: data.user,
      session: data.session,
      setupCompleted: false,
      error: profileError.message,
    };
  }

  return {
    user: data.user,
    session: data.session,
    setupCompleted: profile.setup_completed,
    error: null,
  };
}

/* =========================================================
   CHECK SETUP STATUS
========================================================= */

export async function getSetupStatus() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authenticated: false,
      setupCompleted: false,
      error: null,
    };
  }

  const { data: profile, error } = await supabase
    .from("user_profile")
    .select("setup_completed")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return {
      authenticated: true,
      setupCompleted: false,
      error: error.message,
    };
  }

  return {
    authenticated: true,
    setupCompleted: profile.setup_completed,
    error: null,
  };
}

/* =========================================================
   MARK SETUP AS COMPLETED
========================================================= */

export async function completeSetup() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in to complete setup.",
    };
  }

  const { error } = await supabase
    .from("user_profile")
    .update({
      setup_completed: true,
    })
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    error: null,
  };
}