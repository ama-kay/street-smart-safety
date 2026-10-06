/* eslint-disable prettier/prettier */

import { redirect } from "@tanstack/react-router";
import { getSetupStatus } from "@/services/authServices";
import { supabase } from "@/lib/supabase";

/* =========================================================
   REQUIRE LOGIN
========================================================= */

export async function requireAuth() {
  const status = await getSetupStatus();

  if (!status.authenticated) {
    throw redirect({
      to: "/login",
    });
  }

  return status;
}

/* =========================================================
   REQUIRE COMPLETED SETUP
========================================================= */

export async function requireCompletedSetup() {
  const status = await getSetupStatus();

  if (!status.authenticated) {
    throw redirect({
      to: "/login",
    });
  }

  if (!status.setupCompleted) {
    throw redirect({
      to: "/shortcut-setup",
    });
  }

  return status;
}

/* =========================================================
   REQUIRE INCOMPLETE SETUP
========================================================= */

export async function requireIncompleteSetup() {
  const status = await getSetupStatus();

  if (!status.authenticated) {
    throw redirect({
      to: "/login",
    });
  }

  if (status.setupCompleted) {
    throw redirect({
      to: "/home",
    });
  }

  return status;
}

/* =========================================================
   REQUIRE ADMIN
========================================================= */

/* =========================================================
   REQUIRE ADMIN
========================================================= */

export async function requireAdmin() {
  const status = await getSetupStatus();

  if (!status.authenticated) {
    throw redirect({
      to: "/admin/login",
    });
  }

  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    throw redirect({
      to: "/admin/login",
    });
  }

  const { data: role, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (error || !role) {
    throw redirect({
      to: "/admin/login",
    });
  }

  return {
    ...status,
    isAdmin: true,
  };
}

