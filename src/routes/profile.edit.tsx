import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { requireCompletedSetup } from "@/lib/routeGuards";
import { useEffect, useState } from "react";
import {
  getUserProfile,
  updateUserProfile,
  type UserProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "@/services/profileService";
import { MobileShell } from "@/components/MobileShell";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";

export const Route = createFileRoute("/profile/edit")({
  beforeLoad: requireCompletedSetup,
  component: EditProfile,
});

const countries = ["Ghana", "Nigeria", "United States", "United Kingdom", "Canada", "Other"];

const currentYear = new Date().getFullYear();

const emptyProfile: UserProfile = {
  user_id: "",
  first_name: "",
  last_name: "",
  other_names: "",
  email: "",
  phone: "",
  DOB: null,
  country: null,
  gender: null,
  profession: null,
  blood_type: null,
  allergies: null,
  health_conditions: null,
  address: null,
  avatar_url: null,
};

function EditProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile>(emptyProfile);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  const [savedProfile, setSavedProfile] = useState<UserProfile>(emptyProfile);

  const [allergyInputs, setAllergyInputs] = useState<string[]>([""]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const hasUnsavedChanges = JSON.stringify(profile) !== JSON.stringify(savedProfile);

  const photoOperationInProgress = uploadingPhoto || removingPhoto;

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setShowPhotoMenu(false);
    setUploadingPhoto(true);
    setPhotoError("");
    setMessage("");
    setError("");

    try {
      const avatarUrl = await uploadProfilePhoto(file);

      setProfile((currentProfile) => ({
        ...currentProfile,
        avatar_url: avatarUrl,
      }));

      setSavedProfile((currentProfile) => ({
        ...currentProfile,
        avatar_url: avatarUrl,
      }));

      setMessage("Profile photo updated successfully.");
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Failed to upload profile photo.");
    } finally {
      setUploadingPhoto(false);

      // Allow the same photo to be selected again later.
      event.target.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    setShowPhotoMenu(false);
    setRemovingPhoto(true);
    setPhotoError("");
    setMessage("");
    setError("");

    try {
      await deleteProfilePhoto();

      setProfile((currentProfile) => ({
        ...currentProfile,
        avatar_url: null,
      }));

      setSavedProfile((currentProfile) => ({
        ...currentProfile,
        avatar_url: null,
      }));

      setMessage("Profile photo removed.");
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Failed to remove profile photo.");
    } finally {
      setRemovingPhoto(false);
    }
  };

  useEffect(() => {
    async function loadProfile() {
      const data = await getUserProfile();

      if (data) {
        setProfile(data);
        setSavedProfile(data);

        setAllergyInputs(
          data.allergies ? data.allergies.split(",").map((allergy) => allergy.trim()) : [""],
        );
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  const updateField = (field: keyof UserProfile, value: string) => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }));
  };

  const updateAllergy = (index: number, value: string) => {
    const updatedAllergies = [...allergyInputs];

    updatedAllergies[index] = value;

    setAllergyInputs(updatedAllergies);

    updateField(
      "allergies",
      updatedAllergies
        .map((allergy) => allergy.trim())
        .filter(Boolean)
        .join(", "),
    );
  };

  const addAllergy = () => {
    setAllergyInputs((currentAllergies) => [...currentAllergies, ""]);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedModal(true);
      return;
    }

    navigate({ to: "/home" });
  };

  const handleLeaveWithoutSaving = () => {
    setShowUnsavedModal(false);
    navigate({ to: "/home" });
  };

  const handleStayOnPage = () => {
    setShowUnsavedModal(false);
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await updateUserProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
        other_names: profile.other_names,
        email: profile.email,
        phone: profile.phone,
        DOB: profile.DOB,
        country: profile.country,
        gender: profile.gender,
        profession: profile.profession,
        blood_type: profile.blood_type,
        allergies: profile.allergies,
        health_conditions: profile.health_conditions,
        address: profile.address,
      });

      setSavedProfile(profile);
      setMessage("Changes saved successfully.");

      navigate({ to: "/settings" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setProfile(savedProfile);

    setAllergyInputs(
      savedProfile.allergies
        ? savedProfile.allergies.split(",").map((allergy) => allergy.trim())
        : [""],
    );

    setMessage("");
    setError("");
  };

  if (loading) {
    return (
      <MobileShell>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <ScreenHeader title="Edit Profile" onBack={handleBack} />

      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
        {/* PROFILE PHOTO */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-secondary text-2xl font-bold text-muted-foreground shadow-card">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.first_name?.charAt(0).toUpperCase()
              )}
            </div>

            {/* Edit button */}
            <button
              type="button"
              onClick={() => setShowPhotoMenu((current) => !current)}
              disabled={photoOperationInProgress}
              aria-label="Edit profile photo"
              className={`absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-emergency transition-transform ${
                photoOperationInProgress ? "cursor-not-allowed opacity-50" : "active:scale-95"
              }`}
            >
              <Pencil className={`h-4 w-4 ${photoOperationInProgress ? "animate-pulse" : ""}`} />
            </button>

            {/* Photo menu */}
            {showPhotoMenu && !photoOperationInProgress && (
              <div className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                {/* Change photo */}
                <label
                  htmlFor="profile-photo"
                  className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span>Change photo</span>
                </label>

                {/* Delete photo */}
                {profile.avatar_url && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete photo</span>
                  </button>
                )}
              </div>
            )}

            <input
              id="profile-photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={photoOperationInProgress}
              className="hidden"
            />
          </div>

          {/* Photo errors only */}
          {photoError && <p className="mt-2 text-center text-xs text-red-500">{photoError}</p>}

          {/* Operation status */}
          {uploadingPhoto && <p className="mt-2 text-xs text-muted-foreground">Uploading...</p>}

          {removingPhoto && <p className="mt-2 text-xs text-muted-foreground">Removing...</p>}
        </div>

        <Section title="Personal Details">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              placeholder="John"
              value={profile.first_name}
              onChange={(e) => updateField("first_name", e.target.value)}
            />

            <Input
              label="Last Name"
              placeholder="Doe"
              value={profile.last_name}
              onChange={(e) => updateField("last_name", e.target.value)}
            />
          </div>

          <Input
            label="Other Names"
            placeholder="Jane"
            value={profile.other_names ?? ""}
            onChange={(e) => updateField("other_names", e.target.value)}
          />

          <Input
            label="Date of Birth"
            type="date"
            min="1900-01-01"
            max={`${currentYear}-12-31`}
            value={profile.DOB ?? ""}
            onChange={(e) => updateField("DOB", e.target.value)}
          />

          <Select
            label="Country"
            options={countries}
            value={profile.country ?? ""}
            onChange={(e) => updateField("country", e.target.value)}
          />

          <Select
            label="Gender"
            options={["Male", "Female", "Non-binary", "Prefer not to say"]}
            value={profile.gender ?? ""}
            onChange={(e) => updateField("gender", e.target.value)}
          />

          <Input
            label="Profession"
            placeholder="Software Engineer"
            value={profile.profession ?? ""}
            onChange={(e) => updateField("profession", e.target.value)}
          />
        </Section>

        <Section title="Medical Details">
          <Select
            label="Blood Type"
            options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
            value={profile.blood_type ?? ""}
            onChange={(e) => updateField("blood_type", e.target.value)}
          />

          <div>
            <span className="text-xs font-medium text-muted-foreground">Allergies</span>

            <div className="mt-1 space-y-3">
              {allergyInputs.map((allergy, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder="e.g. Peanuts, Penicillin"
                  value={allergy}
                  onChange={(e) => updateAllergy(index, e.target.value)}
                  className="w-full rounded-xl border border-transparent bg-secondary px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={addAllergy}
              className="mt-2 flex items-center gap-1 text-sm font-medium text-primary"
            >
              <Plus className="h-4 w-4" />
              Add allergy
            </button>
          </div>

          <Input
            label="Health Conditions"
            placeholder="e.g. Asthma"
            value={profile.health_conditions ?? ""}
            onChange={(e) => updateField("health_conditions", e.target.value)}
          />
        </Section>

        <Section title="Contact Information">
          <Input
            label="Phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={profile.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />

          <Input
            label="Email"
            type="email"
            placeholder="john.doe@example.com"
            value={profile.email}
            onChange={(e) => updateField("email", e.target.value)}
          />

          <Input
            label="Address"
            placeholder="Street, City, ZIP"
            value={profile.address ?? ""}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </Section>

        {message && <p className="mt-6 text-center text-sm text-green-600">{message}</p>}

        {error && <p className="mt-6 text-center text-sm text-red-500">{error}</p>}

        <div className="mt-8 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving || !hasUnsavedChanges}
            className="rounded-2xl bg-secondary py-4 font-semibold text-foreground transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className="rounded-2xl bg-primary py-4 text-center font-semibold text-primary-foreground shadow-emergency transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {showUnsavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold">Unsaved Changes</h2>

            <p className="mt-2 text-sm text-muted-foreground">
              You have unsaved changes. Do you want to leave without saving?
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleStayOnPage}
                className="rounded-xl bg-secondary py-3 font-semibold text-foreground"
              >
                Stay
              </button>

              <button
                type="button"
                onClick={handleLeaveWithoutSaving}
                className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({
  label,
  ...props
}: {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>

      <input
        {...props}
        className="mt-1 w-full rounded-xl border border-transparent bg-secondary px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
      />
    </label>
  );
}

function Select({
  label,
  options,
  ...props
}: {
  label: string;
  options: string[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>

      <select
        {...props}
        className="mt-1 w-full appearance-none rounded-xl border border-transparent bg-secondary px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
      >
        <option value="">Select…</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
