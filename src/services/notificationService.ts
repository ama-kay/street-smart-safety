/* eslint-disable prettier/prettier */

import { supabase } from "@/lib/supabase";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

/*
 * Get notifications for the currently logged-in user.
 */
export async function getNotifications(): Promise<Notification[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in to view notifications.");
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Notification[];
}

/*
 * Get the number of unread notifications.
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in to view notifications.");
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

/*
 * Create a notification for the currently logged-in user.
 */
export async function createNotification({
  type,
  title,
  message,
}: {
  type: string;
  title: string;
  message: string;
}): Promise<Notification> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in to create a notification.");
  }

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: user.id,
      type,
      title,
      message,
      read: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }
  console.log("NOTIFICATIONS FROM SUPABASE:", data);

  return data as Notification;
}

/*
 * Mark one notification as read.
 */
export async function markNotificationAsRead(
  notificationId: string,
): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in to update notifications.");
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      read: true,
    })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

/*
 * Mark all notifications as read.
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in to update notifications.");
  }

  const { error } = await supabase
    .from("notifications")
    .update({
      read: true,
    })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    throw new Error(error.message);
  }
}