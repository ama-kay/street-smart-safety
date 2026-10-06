import { supabase } from "@/lib/supabase";

/*
 * =========================================================
 * Types
 * =========================================================
 */

export interface AdminDashboardStats {
  totalUsers: number;
  activeEmergencies: number;
  alertsToday: number;
  cancelledAlerts: number;
}

export interface RecentAlert {
  id: string;
  user: string;
  time: string;
  location: string;
  status: string;
  createdAt: string;
}

export interface LiveEmergency {
  id: string;
  user: string;
  phone: string;
  location: string;
  status: string;
  createdAt: string;
}

export interface AdminUser {
  userId: string;
  name: string;
  phone: string;
  email: string;
  registered: string;
  alerts: number;
  setupCompleted: boolean;
  accountDisabled: boolean;
}

interface AdminDashboardResponse {
  stats: AdminDashboardStats;

  recentAlerts: Array<{
    id: string;
    created_at: string;
    location: string | null;
    status: string | null;
    user_id: string | null;
    user_profile:
      | {
          first_name: string | null;
          last_name: string | null;
        }
      | Array<{
          first_name: string | null;
          last_name: string | null;
        }>
      | null;
  }>;
}

export interface AdminUserDetails extends AdminUser {
  firstName: string;
  lastName: string;
  otherNames: string | null;
  dateOfBirth: string | null;
  country: string | null;
  gender: string | null;
  profession: string | null;
  bloodType: string | null;
  allergies: string | null;
  healthConditions: string | null;
  address: string | null;
  avatarUrl: string | null;
}

export interface AdminEmergencyLog {
  id: string;
  userId: string | null;
  user: string;
  timestamp: string;
  location: string;
  status: string;
  contactsNotified: number;
}

export interface AdminUserAlert {
  id: string;
  createdAt: string;
  location: string;
  status: string;
  message: string | null;
  triggerSource: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface AdminEmergencyDetails {
  id: string;
  createdAt: string;
  location: string;
  status: string;
  message: string | null;
  triggerSource: string | null;
  latitude: number | null;
  longitude: number | null;

  user: {
    userId: string;
    name: string;
    phone: string;
    email: string;
    bloodType: string | null;
    allergies: string | null;
    healthConditions: string | null;
    address: string | null;
  };
}

/*
 * =========================================================
 * Get dashboard data
 * =========================================================
 */

export async function getAdminDashboardData(): Promise<{
  stats: AdminDashboardStats;
  recentAlerts: RecentAlert[];
}> {
  /*
   * Get the current admin's access token.
   */

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(`Failed to get authentication session: ${sessionError.message}`);
  }

  if (!session) {
    throw new Error("You are not authenticated.");
  }

  /*
   * Call the admin dashboard Edge Function.
   */

  const { data, error } = await supabase.functions.invoke("admin-dashboard", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    throw new Error(`Failed to load admin dashboard: ${error.message}`);
  }

  const response = data as AdminDashboardResponse;

  /*
   * Format recent alerts for the UI.
   */

  const recentAlerts: RecentAlert[] = (response.recentAlerts ?? []).map((alert) => {
    const profile = Array.isArray(alert.user_profile) ? alert.user_profile[0] : alert.user_profile;

    const firstName = profile?.first_name ?? "";
    const lastName = profile?.last_name ?? "";

    const fullName = `${firstName} ${lastName}`.trim() || "Unknown User";

    return {
      id: alert.id,
      user: fullName,
      time: formatRelativeTime(alert.created_at),
      location: formatLocation(alert.location),
      status: formatStatus(alert.status),
      createdAt: alert.created_at,
    };
  });

  return {
    stats: response.stats,
    recentAlerts,
  };
}

/*
 * =========================================================
 * Live emergencies
 * =========================================================
 */

export async function getLiveEmergencies(): Promise<LiveEmergency[]> {
  const { data, error } = await supabase
    .from("sos_alerts")
    .select(
      `
      id,
      created_at,
      location,
      status,
      user_id,
      user_profile!sos_alerts_user_id_fkey (
        first_name,
        last_name,
        phone
      )
    `,
    )
    .eq("status", "active")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(`Failed to fetch live emergencies: ${error.message}`);
  }

  return (data ?? []).map((alert) => {
    const profile = Array.isArray(alert.user_profile) ? alert.user_profile[0] : alert.user_profile;

    const firstName = profile?.first_name ?? "";
    const lastName = profile?.last_name ?? "";

    const fullName = `${firstName} ${lastName}`.trim() || "Unknown User";

    return {
      id: alert.id,
      user: fullName,
      phone: profile?.phone ?? "Unknown",
      createdAt: alert.created_at,
      location: formatLocation(alert.location),
      status: formatStatus(alert.status),
    };
  });
}

/*
 * =========================================================
 * Get all admin users
 * =========================================================
 */

export async function getAdminUsers(): Promise<AdminUser[]> {
  /*
   * Get all user profiles.
   */

  const { data: profiles, error: profilesError } = await supabase
    .from("user_profile")
    .select(
      `
      user_id,
      first_name,
      last_name,
      phone,
      email,
      created_at,
      setup_completed,
      account_disabled
    `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (profilesError) {
    throw new Error(`Failed to fetch users: ${profilesError.message}`);
  }

  /*
   * Get all SOS alerts so we can count alerts
   * belonging to each user.
   */

  const { data: alerts, error: alertsError } = await supabase.from("sos_alerts").select("user_id");

  if (alertsError) {
    throw new Error(`Failed to fetch user alerts: ${alertsError.message}`);
  }

  /*
   * Count alerts by user_id.
   */

  const alertCounts = new Map<string, number>();

  for (const alert of alerts ?? []) {
    if (!alert.user_id) {
      continue;
    }

    alertCounts.set(alert.user_id, (alertCounts.get(alert.user_id) ?? 0) + 1);
  }

  /*
   * Combine the profile information with the alert counts.
   */

  return (profiles ?? []).map((profile) => {
    const fullName =
      `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Unknown User";

    return {
      userId: profile.user_id,
      name: fullName,
      phone: profile.phone,
      email: profile.email,
      registered: new Date(profile.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      alerts: alertCounts.get(profile.user_id) ?? 0,
      setupCompleted: profile.setup_completed,
      accountDisabled: profile.account_disabled,
    };
  });
}

/*
 * =========================================================
 * Get admin user details
 * =========================================================
 */

export interface AdminUserDetailsResponse {
  user: AdminUserDetails;
  alerts: AdminUserAlert[];
}

export async function getAdminUserDetails(userId: string): Promise<AdminUserDetailsResponse> {
  /*
   * -------------------------------------------------------
   * Get user profile
   * -------------------------------------------------------
   */

  const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select(
      `
      user_id,
      first_name,
      last_name,
      other_names,
      DOB,
      country,
      gender,
      profession,
      blood_type,
      allergies,
      health_conditions,
      phone,
      email,
      address,
      created_at,
      setup_completed,
      avatar_url,
      account_disabled
    `,
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Failed to fetch user profile: ${profileError.message}`);
  }

  if (!profile) {
    throw new Error("User not found.");
  }

  /*
   * -------------------------------------------------------
   * Get this user's SOS alerts
   * -------------------------------------------------------
   */

  const { data: alerts, error: alertsError } = await supabase
    .from("sos_alerts")
    .select(
      `
      id,
      created_at,
      location,
      status,
      message,
      trigger_source,
      latitude,
      longitude
    `,
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (alertsError) {
    throw new Error(`Failed to fetch user alerts: ${alertsError.message}`);
  }

  /*
   * -------------------------------------------------------
   * Build user object
   * -------------------------------------------------------
   */

  const fullName =
    `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Unknown User";

  const user: AdminUserDetails = {
    userId: profile.user_id,
    name: fullName,
    firstName: profile.first_name ?? "",
    lastName: profile.last_name ?? "",
    phone: profile.phone,
    email: profile.email,

    registered: new Date(profile.created_at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),

    alerts: alerts?.length ?? 0,
    setupCompleted: profile.setup_completed,
    accountDisabled: profile.account_disabled,

    otherNames: profile.other_names,
    dateOfBirth: profile.DOB,
    country: profile.country,
    gender: profile.gender,
    profession: profile.profession,
    bloodType: profile.blood_type,
    allergies: profile.allergies,
    healthConditions: profile.health_conditions,
    address: profile.address,
    avatarUrl: profile.avatar_url,
  };

  /*
   * -------------------------------------------------------
   * Format alerts
   * -------------------------------------------------------
   */

  const formattedAlerts: AdminUserAlert[] = (alerts ?? []).map((alert) => ({
    id: alert.id,
    createdAt: alert.created_at,
    location: formatLocation(alert.location),
    status: formatStatus(alert.status),
    message: alert.message,
    triggerSource: alert.trigger_source,
    latitude: alert.latitude,
    longitude: alert.longitude,
  }));

  return {
    user,
    alerts: formattedAlerts,
  };
}

/*
 * =========================================================
 * Get emergency details
 * =========================================================
 */

export async function getAdminEmergencyDetails(alertId: string): Promise<AdminEmergencyDetails> {
  /*
   * -------------------------------------------------------
   * Get the emergency alert
   * -------------------------------------------------------
   */

  const { data: alert, error: alertError } = await supabase
    .from("sos_alerts")
    .select(
      `
      id,
      created_at,
      location,
      status,
      message,
      trigger_source,
      latitude,
      longitude,
      user_id
    `,
    )
    .eq("id", alertId)
    .maybeSingle();

  if (alertError) {
    throw new Error(`Failed to fetch emergency: ${alertError.message}`);
  }

  if (!alert) {
    throw new Error("Emergency alert not found.");
  }

  /*
   * -------------------------------------------------------
   * Get the user profile
   * -------------------------------------------------------
   */

  let profile = null;

  if (alert.user_id) {
    const { data, error: profileError } = await supabase
      .from("user_profile")
      .select(
        `
        user_id,
        first_name,
        last_name,
        phone,
        email,
        blood_type,
        allergies,
        health_conditions,
        address
      `,
      )
      .eq("user_id", alert.user_id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Failed to fetch emergency user: ${profileError.message}`);
    }

    profile = data;
  }

  /*
   * -------------------------------------------------------
   * Build user information
   * -------------------------------------------------------
   */

  const fullName =
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || "Unknown User";

  /*
   * -------------------------------------------------------
   * Return emergency details
   * -------------------------------------------------------
   */

  return {
    id: alert.id,
    createdAt: alert.created_at,
    location: formatLocation(alert.location),
    status: formatStatus(alert.status),
    message: alert.message,
    triggerSource: alert.trigger_source,
    latitude: alert.latitude,
    longitude: alert.longitude,

    user: {
      userId: profile?.user_id ?? alert.user_id ?? "",
      name: fullName,
      phone: profile?.phone ?? "Unknown",
      email: profile?.email ?? "Unknown",
      bloodType: profile?.blood_type ?? null,
      allergies: profile?.allergies ?? null,
      healthConditions: profile?.health_conditions ?? null,
      address: profile?.address ?? null,
    },
  };
}

/*
 * =========================================================
 * Get emergency logs
 * =========================================================
 */

export async function getAdminEmergencyLogs(): Promise<AdminEmergencyLog[]> {
  /*
   * -------------------------------------------------------
   * Get all SOS alerts
   * -------------------------------------------------------
   */

  const { data: alerts, error: alertsError } = await supabase
    .from("sos_alerts")
    .select(
      `
      id,
      user_id,
      created_at,
      location,
      status
    `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (alertsError) {
    throw new Error(`Failed to fetch emergency logs: ${alertsError.message}`);
  }

  if (!alerts || alerts.length === 0) {
    return [];
  }

  /*
   * -------------------------------------------------------
   * Get the user IDs associated with the alerts
   * -------------------------------------------------------
   */

  const userIds = [
    ...new Set(
      alerts.map((alert) => alert.user_id).filter((userId): userId is string => Boolean(userId)),
    ),
  ];

  /*
   * -------------------------------------------------------
   * Get user profiles
   * -------------------------------------------------------
   */

  const { data: profiles, error: profilesError } = await supabase
    .from("user_profile")
    .select(
      `
      user_id,
      first_name,
      last_name
    `,
    )
    .in("user_id", userIds);

  if (profilesError) {
    throw new Error(`Failed to fetch emergency users: ${profilesError.message}`);
  }

  /*
   * -------------------------------------------------------
   * Create a quick profile lookup
   * -------------------------------------------------------
   */

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [
      profile.user_id,
      `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Unknown User",
    ]),
  );

  /*
   * -------------------------------------------------------
   * Get delivery records
   *
   * We only count deliveries whose status is "sent".
   * -------------------------------------------------------
   */

  const alertIds = alerts.map((alert) => alert.id);

  const { data: deliveries, error: deliveriesError } = await supabase
    .from("alert_deliveries")
    .select(
      `
        alert_id,
        status
      `,
    )
    .in("alert_id", alertIds);

  if (deliveriesError) {
    throw new Error(`Failed to fetch alert deliveries: ${deliveriesError.message}`);
  }

  /*
   * -------------------------------------------------------
   * Count successfully sent contacts per alert
   * -------------------------------------------------------
   */

  const deliveryCounts = new Map<string, number>();

  for (const delivery of deliveries ?? []) {
    if (delivery.status?.toLowerCase() !== "sent") {
      continue;
    }

    deliveryCounts.set(delivery.alert_id, (deliveryCounts.get(delivery.alert_id) ?? 0) + 1);
  }

  /*
   * -------------------------------------------------------
   * Build emergency log records
   * -------------------------------------------------------
   */

  return alerts.map((alert) => ({
    id: alert.id,
    userId: alert.user_id,
    user: alert.user_id ? (profileMap.get(alert.user_id) ?? "Unknown User") : "Unknown User",
    timestamp: alert.created_at,
    location: formatLocation(alert.location),
    status: formatStatus(alert.status),
    contactsNotified: deliveryCounts.get(alert.id) ?? 0,
  }));
}

/*
 * =========================================================
 * Update admin user
 * =========================================================
 */

export async function updateAdminUser(
  userId: string,
  updates: {
    firstName: string;
    lastName: string;
    otherNames: string | null;
    country: string | null;
    gender: string | null;
    profession: string | null;
  },
) {
  const { data, error } = await supabase
    .from("user_profile")
    .update({
      first_name: updates.firstName,
      last_name: updates.lastName,
      other_names: updates.otherNames,
      country: updates.country,
      gender: updates.gender,
      profession: updates.profession,
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  return data;
}

/*
 * =========================================================
 * Disable / Enable admin user
 * =========================================================
 */

export async function setAdminUserDisabled(userId: string, disabled: boolean): Promise<void> {
  const { error } = await supabase
    .from("user_profile")
    .update({
      account_disabled: disabled,
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to ${disabled ? "disable" : "enable"} user: ${error.message}`);
  }
}

/*
 * =========================================================
 * Formatting helpers
 * =========================================================
 */

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const differenceInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (differenceInSeconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(differenceInSeconds / 60);

  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return date.toLocaleDateString();
}

function formatLocation(location: string | null): string {
  if (!location) {
    return "Unknown";
  }

  try {
    const parsed = JSON.parse(location);

    if (parsed.address) {
      return parsed.address;
    }

    if (
      parsed.latitude !== null &&
      parsed.latitude !== undefined &&
      parsed.longitude !== null &&
      parsed.longitude !== undefined
    ) {
      return `${parsed.latitude}, ${parsed.longitude}`;
    }
  } catch {
    // Location is plain text.
  }

  return location;
}

function formatStatus(status: string | null): string {
  if (!status) {
    return "Unknown";
  }

  switch (status.toLowerCase()) {
    case "pending":
      return "Pending";

    case "active":
      return "Active";

    case "sent":
      return "Sent";

    case "resolved":
      return "Resolved";

    case "cancelled":
      return "Cancelled";

    default:
      return status;
  }
}
