/* eslint-disable prettier/prettier */
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  other_names: string;
  email: string;
  phone: string;
  DOB: string | null;
  country: string | null;
  gender: string | null;
  profession: string | null;
  blood_type: string | null;
  allergies: string | null;
  health_conditions: string | null;
  address: string | null;
  avatar_url: string | null;
}

/*
 * Get the currently logged-in user's profile.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
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
    .maybeSingle();

  if (error) {
    console.error("Error loading profile:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return data as UserProfile;
}

/*
 * Update the currently logged-in user's profile.
 */
export async function updateUserProfile(
  profile: Partial<UserProfile>,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not logged in.");
  }

  const { data, error } = await supabase
    .from("user_profile")
    .update(profile)
    .eq("user_id", user.id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error("No profile row was updated.");
  }

  return true;
}

/*
 * Upload a profile photo.
 *
 * A new photo is uploaded first.
 * Once the profile has been updated successfully,
 * the previous photo is removed from Storage.
 */
export async function uploadProfilePhoto(file: File) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not logged in.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file.");
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error("Profile photo must be smaller than 5 MB.");
  }

  /*
   * Get the user's existing profile photo.
   */
  const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select("avatar_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const oldAvatarUrl = profile?.avatar_url ?? null;

  /*
   * Create a unique file path inside the user's folder.
   */
  const fileExtension =
    file.name.split(".").pop()?.toLowerCase() || "jpg";

  const filePath = `${user.id}/profile-${Date.now()}.${fileExtension}`;

  /*
   * Upload the new image first.
   */
  const { error: uploadError } = await supabase.storage
    .from("profile-photos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  /*
   * Get the public URL for the new image.
   */
  const { data: publicUrlData } = supabase.storage
    .from("profile-photos")
    .getPublicUrl(filePath);

  const avatarUrl = publicUrlData.publicUrl;

  /*
   * Save the new URL in the user's profile.
   */
  const { error: updateError } = await supabase
    .from("user_profile")
    .update({
      avatar_url: avatarUrl,
    })
    .eq("user_id", user.id);

  if (updateError) {
    /*
     * If the database update fails, remove the newly
     * uploaded image so it doesn't remain unused.
     */
    await supabase.storage
      .from("profile-photos")
      .remove([filePath]);

    throw new Error(updateError.message);
  }

  /*
   * Remove the previous profile photo.
   *
   * Failure here does not invalidate the new photo.
   */
  if (oldAvatarUrl) {
    const oldPath = getStoragePathFromPublicUrl(oldAvatarUrl);

    if (oldPath) {
      const { error: deleteError } = await supabase.storage
        .from("profile-photos")
        .remove([oldPath]);

      if (deleteError) {
        console.error(
          "Failed to delete old profile photo:",
          deleteError.message,
        );
      }
    }
  }

  return avatarUrl;
}

/*
 * Delete the currently logged-in user's profile photo.
 */
export async function deleteProfilePhoto() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  /*
   * Get the current profile photo URL.
   */
  const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select("avatar_url")
    .eq("user_id", user.id)
    .single();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile?.avatar_url) {
    throw new Error("No profile picture to delete.");
  }

  /*
   * Convert the public URL into the Storage path.
   */
  const storagePath = getStoragePathFromPublicUrl(profile.avatar_url);

  /*
   * Make sure the Storage path was successfully extracted
   * before using it.
   */
  if (!storagePath) {
    throw new Error(
      "Could not determine the profile picture storage path.",
    );
  }

  /*
   * Delete the actual file from Storage.
   */
  const { data: deletedFiles, error: deleteError } =
    await supabase.storage
      .from("profile-photos")
      .remove([storagePath]);

  if (deleteError) {
    throw new Error(
      `Failed to delete profile photo: ${deleteError.message}`,
    );
  }

  /*
   * An empty array means no Storage object was deleted.
   * Do not clear the database URL in that situation.
   */
  if (!deletedFiles || deletedFiles.length === 0) {
    throw new Error(
      "The profile photo could not be deleted from storage.",
    );
  }

  /*
   * Only remove the URL from the profile after
   * Storage deletion succeeds.
   */
  const { error: updateError } = await supabase
    .from("user_profile")
    .update({
      avatar_url: null,
    })
    .eq("user_id", user.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return true;
}

/*
 * Convert a public Supabase Storage URL back into
 * the file path used by Storage.remove().
 *
 * Example:
 *
 * https://.../storage/v1/object/public/profile-photos/
 * user-id/profile-123456.jpg
 *
 * becomes:
 *
 * user-id/profile-123456.jpg
 */
function getStoragePathFromPublicUrl(
  publicUrl: string,
): string | null {
  const marker = "/storage/v1/object/public/profile-photos/";

  const index = publicUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(
    publicUrl.substring(index + marker.length),
  );
}