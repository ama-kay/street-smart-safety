import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Camera } from "lucide-react";
import { Country } from "country-state-city";
import { supabase, type Profile } from "@/integrations/supabase/client";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/integrations/supabase/auth-context";

export const Route = createFileRoute("/profile/edit")({
  component: () => (
    <RequireAuth>
      <EditProfile />
    </RequireAuth>
  ),
});

const countries = Country.getAllCountries()
  .map((c) => c.name)
  .sort((a, b) => a.localeCompare(b));

const currentYear = new Date().getFullYear();

const EMPTY: Omit<Profile, "id"> = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  country: "",
  gender: "",
  profession: "",
  blood_type: "",
  allergies: "",
  health_conditions: "",
  phone: "",
  email: "",
  address: "",
  profile_photo_url: "",
};

function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<Omit<Profile, "id">>(EMPTY);
  const [initial, setInitial] = useState<Omit<Profile, "id">>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) setError(error.message);
      const merged: Omit<Profile, "id"> = {
        ...EMPTY,
        email: user.email ?? "",
        ...(data ?? {}),
      };
      // Strip id if present
      delete (merged as { id?: string }).id;
      setForm(merged);
      setInitial(merged);
      setLoading(false);
    })();
  }, [user]);

  function update<K extends keyof Omit<Profile, "id">>(key: K, value: Omit<Profile, "id">[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setError(null);
    const payload = {
      id: user.id,
      ...form,
      date_of_birth: form.date_of_birth || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("profiles").upsert(payload);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/settings" });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setError(null);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    update("profile_photo_url", data.publicUrl);
    setUploading(false);
  }

  const initials =
    `${form.first_name?.[0] ?? ""}${form.last_name?.[0] ?? ""}`.toUpperCase() || "ST";

  return (
    <MobileShell>
      <ScreenHeader title="Edit Profile" back="/settings" />
      <div className="flex-1 px-6 pt-6 pb-6 overflow-y-auto">
        {/* Photo */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-secondary border-4 border-card shadow-card flex items-center justify-center text-2xl font-bold text-muted-foreground overflow-hidden">
              {form.profile_photo_url ? (
                <img
                  src={form.profile_photo_url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-emergency"
            >
              <Camera className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute -bottom-12 left-20 bg-gray-100 border rounded shadow-md w-36 z-10">
                <label className="block w-full text-xs text-left px-2 py-1 hover:bg-gray-200 cursor-pointer">
                  {uploading ? "Uploading…" : "Choose Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      setMenuOpen(false);
                      handleFile(e);
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-sm text-muted-foreground mt-8">Loading profile…</p>
        ) : (
          <>
            <Section title="Personal Details">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  placeholder="John"
                  value={form.first_name ?? ""}
                  onChange={(e) => update("first_name", e.target.value)}
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  value={form.last_name ?? ""}
                  onChange={(e) => update("last_name", e.target.value)}
                />
              </div>
              <Input
                label="Date of Birth"
                type="date"
                min="1900-01-01"
                max={`${currentYear}-12-31`}
                value={form.date_of_birth ?? ""}
                onChange={(e) => update("date_of_birth", e.target.value)}
              />
              <Select
                label="Country"
                options={countries}
                value={form.country ?? ""}
                onChange={(v) => update("country", v)}
              />
              <Select
                label="Gender"
                options={["Male", "Female", "Non-binary", "Prefer not to say"]}
                value={form.gender ?? ""}
                onChange={(v) => update("gender", v)}
              />
              <Input
                label="Profession"
                value={form.profession ?? ""}
                onChange={(e) => update("profession", e.target.value)}
              />
            </Section>

            <Section title="Medical Details">
              <Select
                label="Blood Type"
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                value={form.blood_type ?? ""}
                onChange={(v) => update("blood_type", v)}
              />
              <Input
                label="Allergies"
                placeholder="e.g. Peanuts, Penicillin"
                value={form.allergies ?? ""}
                onChange={(e) => update("allergies", e.target.value)}
              />
              <Input
                label="Health Conditions"
                placeholder="e.g. Asthma"
                value={form.health_conditions ?? ""}
                onChange={(e) => update("health_conditions", e.target.value)}
              />
            </Section>

            <Section title="Contact Information">
              <Input
                label="Phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={form.phone ?? ""}
                onChange={(e) => update("phone", e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="john.doe@example.com"
                value={form.email ?? ""}
                onChange={(e) => update("email", e.target.value)}
              />
              <Input
                label="Address"
                placeholder="Street, City, ZIP"
                value={form.address ?? ""}
                onChange={(e) => update("address", e.target.value)}
              />
            </Section>

            {error && <p className="mt-4 text-sm text-primary">{error}</p>}

            <div className="grid grid-cols-2 gap-3 mt-8">
              <button
                type="button"
                onClick={() => setForm(initial)}
                className="bg-secondary text-foreground font-semibold rounded-2xl py-4 active:scale-[0.98] transition-transform"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-primary-foreground font-semibold rounded-2xl py-4 shadow-emergency active:scale-[0.98] transition-transform disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </>
        )}
      </div>
    </MobileShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        className="mt-1 w-full bg-secondary border border-transparent focus:border-primary focus:bg-background rounded-xl px-4 py-3 text-sm outline-none transition-colors"
      />
    </label>
  );
}

function Select({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full bg-secondary border border-transparent focus:border-primary focus:bg-background rounded-xl px-4 py-3 text-sm outline-none transition-colors appearance-none"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
