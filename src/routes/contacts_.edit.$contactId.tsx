import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { requireCompletedSetup } from "@/lib/routeGuards";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { User, Phone, ChevronDown, Book, ShieldAlert, HeartPulse, UserRound } from "lucide-react";
import {
  getEmergencyContacts,
  updateEmergencyContact,
  type EmergencyContact,
} from "@/services/contactsService";

export const Route = createFileRoute("/contacts_/edit/$contactId")({
  beforeLoad: requireCompletedSetup,
  component: EditContact,
});

function EditContact() {
  const navigate = useNavigate();
  const { contactId } = Route.useParams();

  const [contact, setContact] = useState<EmergencyContact | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [address, setAddress] = useState("");

  const [shareMedicalInfo, setShareMedicalInfo] = useState(false);
  const [sharePersonalInfo, setSharePersonalInfo] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadContact() {
      try {
        const contacts = await getEmergencyContacts();

        const selectedContact = contacts.find(
          (currentContact) => currentContact.contact_id === contactId,
        );

        if (!selectedContact) {
          setError("Contact not found.");
          return;
        }

        setContact(selectedContact);

        setName(selectedContact.name);
        setPhone(selectedContact.phone);
        setRelationship(selectedContact.relationship);
        setAddress(selectedContact.address);

        setShareMedicalInfo(selectedContact.share_medical_info);
        setSharePersonalInfo(selectedContact.share_personal_info);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contact.");
      } finally {
        setLoading(false);
      }
    }

    loadContact();
  }, [contactId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !phone.trim() || !relationship) {
      setError("Please complete all required fields.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updatedContact = await updateEmergencyContact(contactId, {
        name,
        phone,
        relationship,
        address,
        share_medical_info: shareMedicalInfo,
        share_personal_info: sharePersonalInfo,
      });

      setContact(updatedContact);

      navigate({ to: "/contacts" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update contact.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MobileShell>
        <ScreenHeader title="Edit Contact" back="/contacts" />

        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading contact...</p>
        </div>
      </MobileShell>
    );
  }

  if (!contact) {
    return (
      <MobileShell>
        <ScreenHeader title="Edit Contact" back="/contacts" />

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-sm text-red-500 text-center">{error}</p>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <ScreenHeader title="Edit Contact" back="/contacts" />

      <form onSubmit={handleSubmit} className="flex-1 px-6 pt-6 pb-6 flex flex-col overflow-y-auto">
        <div className="space-y-4 flex-1">
          <Field
            icon={User}
            placeholder="Full Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <Field
            icon={Phone}
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />

          <Field
            icon={Book}
            placeholder="Address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />

          <div className="relative">
            <select
              className="w-full appearance-none bg-secondary border border-transparent focus:border-primary focus:bg-background rounded-xl px-4 py-4 text-sm outline-none"
              value={relationship}
              onChange={(event) => setRelationship(event.target.value)}
              required
            >
              <option value="" disabled>
                Select Relationship
              </option>

              <option value="Family">Family</option>
              <option value="Friend">Friend</option>
              <option value="Partner">Partner</option>
              <option value="Doctor">Doctor</option>
              <option value="Other">Other</option>
            </select>

            <ChevronDown className="w-5 h-5 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="pt-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>

              <div>
                <h2 className="text-sm font-semibold">Information shared during an emergency</h2>

                <p className="text-xs text-muted-foreground mt-1">
                  Location is included with every emergency alert. Choose whether this contact can
                  also receive additional information.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <PermissionRow
                icon={HeartPulse}
                title="Medical information"
                description="Blood type, allergies and health conditions"
                enabled={shareMedicalInfo}
                onChange={setShareMedicalInfo}
              />

              <div className="h-px bg-border" />

              <PermissionRow
                icon={UserRound}
                title="Personal information"
                description="Personal details and address"
                enabled={sharePersonalInfo}
                onChange={setSharePersonalInfo}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-4 shadow-emergency active:scale-[0.98] transition-transform disabled:opacity-50 mt-6"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </MobileShell>
  );
}

function PermissionRow({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: typeof HeartPulse;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-9 h-9 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{title}</p>

        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`Share ${title.toLowerCase()}`}
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          enabled ? "bg-primary" : "bg-secondary border border-border"
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function Field({
  icon: Icon,
  ...props
}: {
  icon: typeof User;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />

      <input
        {...props}
        className="w-full bg-secondary border border-transparent focus:border-primary focus:bg-background rounded-xl pl-12 pr-4 py-4 text-sm outline-none transition-colors"
      />
    </div>
  );
}
