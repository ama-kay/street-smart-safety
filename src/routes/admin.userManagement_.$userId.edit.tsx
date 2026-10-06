/* eslint-disable prettier/prettier */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getAdminUserDetails,
  updateAdminUser,
  type AdminUserDetails,
} from "@/services/adminService";

export const Route = createFileRoute("/admin/userManagement_/$userId/edit")({
  component: EditUser,
});

export default function EditUser() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();

const [user, setUser] = useState<AdminUserDetails | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [country, setCountry] = useState("");
  const [gender, setGender] = useState("");
  const [profession, setProfession] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError(null);

        const data = await getAdminUserDetails(userId);

        setUser(data.user);

        setFirstName(data.user.firstName ?? "");
        setLastName(
          data.user.lastName.split(" ").length > 1
            ? data.user.lastName.split(" ").slice(1).join(" ")
            : "",
        );

        setOtherNames(data.user.otherNames ?? "");
        setCountry(data.user.country ?? "");
        setGender(data.user.gender ?? "");
        setProfession(data.user.profession ?? "");
      } catch (err) {
        console.error("Failed to load user:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load user.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [userId]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await updateAdminUser(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        otherNames: otherNames.trim() || null,
        country: country.trim() || null,
        gender: gender.trim() || null,
        profession: profession.trim() || null,
      });

      navigate({
        to: "/admin/userManagement/$userId/edit",
        params: { userId },
      });
    } catch (err) {
      console.error("Failed to update user:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update user.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="px-6 py-10 text-center text-sm text-muted-foreground">
        Loading user...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-6 py-10">
        <div className="bg-emergency-soft text-emergency border border-border rounded-lg px-4 py-3 text-sm mb-4">
          {error ?? "User not found."}
        </div>

        <Link
          to="/admin/userManagement"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to User Management
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <Link
        to="/admin/userManagement/$userId/view"
        params={{ userId }}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to User
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Edit User
        </h1>

        <p className="text-sm text-muted-foreground">
          Update the user's profile information.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-emergency-soft text-emergency border border-border rounded-lg px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave}>
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {/* First name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-foreground mb-2"
            >
              First Name
            </label>

            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="
                w-full
                rounded-lg
                border border-border
                bg-background
                px-3 py-2
                text-sm text-foreground
                outline-none
                focus:ring-2 focus:ring-primary/30
              "
              required
            />
          </div>

          {/* Last name */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Last Name
            </label>

            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="
                w-full
                rounded-lg
                border border-border
                bg-background
                px-3 py-2
                text-sm text-foreground
                outline-none
                focus:ring-2 focus:ring-primary/30
              "
              required
            />
          </div>

          {/* Other names */}
          <div>
            <label
              htmlFor="otherNames"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Other Names
            </label>

            <input
              id="otherNames"
              type="text"
              value={otherNames}
              onChange={(e) => setOtherNames(e.target.value)}
              className="
                w-full
                rounded-lg
                border border-border
                bg-background
                px-3 py-2
                text-sm text-foreground
                outline-none
                focus:ring-2 focus:ring-primary/30
              "
            />
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Country
            </label>

            <input
              id="country"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="
                w-full
                rounded-lg
                border border-border
                bg-background
                px-3 py-2
                text-sm text-foreground
                outline-none
                focus:ring-2 focus:ring-primary/30
              "
            />
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Gender
            </label>

            <input
              id="gender"
              type="text"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="
                w-full
                rounded-lg
                border border-border
                bg-background
                px-3 py-2
                text-sm text-foreground
                outline-none
                focus:ring-2 focus:ring-primary/30
              "
            />
          </div>

          {/* Profession */}
          <div>
            <label
              htmlFor="profession"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Profession
            </label>

            <input
              id="profession"
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="
                w-full
                rounded-lg
                border border-border
                bg-background
                px-3 py-2
                text-sm text-foreground
                outline-none
                focus:ring-2 focus:ring-primary/30
              "
            />
          </div>

          {/* Read-only information */}
          <div className="border-t border-border pt-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">
              Account Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Email
                </p>

                <p className="text-sm text-foreground">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Phone
                </p>

                <p className="text-sm text-foreground">
                  {user.phone}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Email and phone number cannot be changed from this page.
            </p>
          </div>

          {/* Buttons */}
          <div className="border-t border-border pt-6 flex items-center justify-end gap-3">
            <Link
              to="/admin/userManagement"
              params={{ userId }}
              className="
                px-4 py-2
                rounded-lg
                border border-border
                text-sm font-medium
                text-foreground
                hover:bg-secondary
                transition-colors
              "
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="
                inline-flex
                items-center
                gap-2
                px-4 py-2
                rounded-lg
                bg-primary
                text-primary-foreground
                text-sm font-medium
                hover:opacity-90
                transition-opacity
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              <Save className="h-4 w-4" />

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}