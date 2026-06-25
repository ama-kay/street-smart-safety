import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Camera } from "lucide-react";
import { Country } from "country-state-city";

export const Route = createFileRoute("/profile/edit")({
  component: EditProfile,
});

const countries = Country.getAllCountries()
  .map((c) => c.name)
  .sort((a, b) => a.localeCompare(b));

const currentYear = new Date().getFullYear();

function EditProfile() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <MobileShell>
      <ScreenHeader title="Edit Profile" back="/settings" />
      <div className="flex-1 px-6 pt-6 pb-6 overflow-y-auto">
        {/* Photo */}
        {/*  <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-secondary border-4 border-card shadow-card flex items-center justify-center text-2xl font-bold text-muted-foreground">
              JD
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-emergency">
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div> */}
        {/* Photo */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-secondary border-4 border-card shadow-card flex items-center justify-center text-2xl font-bold text-muted-foreground">
              JD
            </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-emergency"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute bottom--12 left-20 bg-gray-100 border rounded shadow-md w-35 z-10">
                <button
                  className="block w-full text-xs text-left px-2 py-1 hover:bg-gray-200"
                  onClick={() => {
                    setMenuOpen(false);
                    // TODO: implement camera capture
                    console.log("Take a Photo clicked");
                  }}
                >
                  Take a Photo
                </button>
                <button
                  className="block w-full text-xs text-left px-2 py-1 hover:bg-gray-200"
                  onClick={() => {
                    setMenuOpen(false);
                    // TODO: implement file picker
                    console.log("Choose Photo clicked");
                  }}
                >
                  Choose/Change Photo
                </button>
              </div>
            )}
          </div>
        </div>

        <Section title="Personal Details">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" placeholder="John" />
            <Input label="Last Name" placeholder="Doe" />
          </div>
          <Input
            label="Date of Birth"
            type="date"
            placeholder="1995-04-12"
            min="1900-01-01"
            max={`${currentYear}-12-31`}
          />
          <Select label="Country" options={countries} />
          <Select label="Gender" options={["Male", "Female", "Non-binary", "Prefer not to say"]} />
          <Input label="Profession" defaultValue="Software Engineer" />
        </Section>

        <Section title="Medical Details">
          <Select label="Blood Type" options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} />
          <Input label="Allergies" placeholder="e.g. Peanuts, Penicillin" />
          <Input label="Health Conditions" placeholder="e.g. Asthma" />
        </Section>

        <Section title="Contact Information">
          <Input label="Phone" type="tel" placeholder="+1 (555) 123-4567" />
          <Input label="Email" type="email" placeholder="john.doe@example.com" />
          <Input label="Address" placeholder="Street, City, ZIP" />
        </Section>

        <div className="grid grid-cols-2 gap-3 mt-8">
          <button className="bg-secondary text-foreground font-semibold rounded-2xl py-4 active:scale-[0.98] transition-transform">
            Reset
          </button>
          <button className="bg-primary text-primary-foreground font-semibold rounded-2xl py-4 shadow-emergency active:scale-[0.98] transition-transform">
            <a href="/settings" className="block w-full text-center">
              Save
            </a>
          </button>
        </div>
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

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        defaultValue=""
        className="mt-1 w-full bg-secondary border border-transparent focus:border-primary focus:bg-background rounded-xl px-4 py-3 text-sm outline-none transition-colors appearance-none"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
