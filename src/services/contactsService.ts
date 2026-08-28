/* eslint-disable prettier/prettier */
import { supabase } from "@/lib/supabase";

export interface EmergencyContact {
  contact_id: string;
  user_id: string;
  name: string;
  phone: string;
  relationship: string;
  address: string;
  share_medical_info: boolean;
  share_personal_info: boolean;
}

export interface EmergencyContactInput {
  name: string;
  phone: string;
  relationship: string;
  address: string;
  share_medical_info: boolean;
  share_personal_info: boolean;
}

async function getAuthenticatedUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be logged in.");
  }

  return user;
}

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("emergency_contact")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as EmergencyContact[];
}

export async function addEmergencyContact(
  contact: EmergencyContactInput,
): Promise<EmergencyContact> {
  const user = await getAuthenticatedUser();

  const { count, error: countError } = await supabase
    .from("emergency_contact")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (countError) {
    throw new Error(countError.message);
  }

  if ((count ?? 0) >= 5) {
    throw new Error("You can add a maximum of 5 emergency contacts.");
  }

  const { data, error } = await supabase
    .from("emergency_contact")
    .insert({
      user_id: user.id,
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      relationship: contact.relationship,
      address: contact.address.trim(),
      share_medical_info: contact.share_medical_info,
      share_personal_info: contact.share_personal_info,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as EmergencyContact;
}

export async function updateEmergencyContact(
  contactId: string,
  contact: EmergencyContactInput,
): Promise<EmergencyContact> {
  const user = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("emergency_contact")
    .update({
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      relationship: contact.relationship,
      address: contact.address.trim(),
      share_medical_info: contact.share_medical_info,
      share_personal_info: contact.share_personal_info,
    })
    .eq("contact_id", contactId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as EmergencyContact;
}

export async function deleteEmergencyContact(
  contactId: string,
): Promise<void> {
  const user = await getAuthenticatedUser();

  const { error } = await supabase
    .from("emergency_contact")
    .delete()
    .eq("contact_id", contactId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}