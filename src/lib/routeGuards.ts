/* eslint-disable prettier/prettier */

import { redirect } from "@tanstack/react-router";
import { getSetupStatus } from "@/services/authServices";

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