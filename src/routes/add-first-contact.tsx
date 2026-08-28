/* eslint-disable prettier/prettier */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Check, Contact, Phone, Trash2, UserPlus } from "lucide-react";
import {
  addEmergencyContact,
  deleteEmergencyContact,
  getEmergencyContacts,
  type EmergencyContact,
} from "@/services/contactsService";
import { requireIncompleteSetup } from "@/lib/routeGuards";

export const Route = createFileRoute("/add-first-contact")({
  beforeLoad: async () => {
    await requireIncompleteSetup();
  },
  component: OnboardingAddContact,
});

const relationships = [
  "Parent",
  "Guardian",
  "Sibling",
  "Spouse",
  "Partner",
  "Friend",
  "Relative",
  "Other",
];

function OnboardingAddContact() {
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [contactPickerSupported, setContactPickerSupported] =
    useState(false);

  /*
   * Maximum number of emergency contacts allowed.
   */
  const MAX_CONTACTS = 5;

  /*
   * At least one contact is required before continuing.
   */
  const canContinue = contacts.length >= 1;

  /*
   * Check whether the browser supports the Contact Picker API.
   */
  useEffect(() => {
    const supported =
      "contacts" in navigator &&
      "ContactsManager" in window;

    setContactPickerSupported(supported);
  }, []);

  /*
   * Load existing contacts.
   *
   * This also means that if the user leaves this page
   * and comes back, their contacts are still there.
   */
  useEffect(() => {
    async function loadContacts() {
      try {
        const data = await getEmergencyContacts();

        setContacts(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load emergency contacts.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadContacts();
  }, []);

  function showMessage(text: string) {
    setMessage(text);

    setTimeout(() => {
      setMessage(null);
    }, 3000);
  }

  /*
   * Choose a contact from the device's contacts.
   *
   * This only works on browsers that support the
   * Contact Picker API.
   */
  async function handleChooseContact() {
    if (!contactPickerSupported) {
      showMessage(
        "Contact selection is not supported on this browser. Please enter the number manually.",
      );
      return;
    }

    try {
      const contactsFromDevice = await (
        navigator as Navigator & {
          contacts: {
            select: (
              properties: string[],
              options?: { multiple?: boolean },
            ) => Promise<
              Array<{
                name?: string[];
                tel?: string[];
              }>
            >;
          };
        }
      ).contacts.select(["name", "tel"], {
        multiple: false,
      });

      const selected = contactsFromDevice[0];

      if (!selected) {
        return;
      }

      setName(selected.name?.[0] ?? "");
      setPhone(selected.tel?.[0] ?? "");

      showMessage("Contact selected.");
    } catch (err) {
      /*
       * The user may simply have cancelled the
       * contact picker, so don't show an error for that.
       */
      console.log("Contact picker closed:", err);
    }
  }

  /*
   * Add a new emergency contact.
   */
  async function handleAddContact() {
    setError(null);
    setMessage(null);

    if (contacts.length >= MAX_CONTACTS) {
      setError("You can add a maximum of 5 emergency contacts.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter the contact's name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter the contact's phone number.");
      return;
    }

    if (!relationship) {
      setError("Please select your relationship with this contact.");
      return;
    }

    try {
      setAdding(true);

      const newContact = await addEmergencyContact({
        name: name.trim(),
        phone: phone.trim(),
        relationship,
        address: "",
      });

      setContacts((current) => [...current, newContact]);

      /*
       * Clear the form after successfully adding.
       */
      setName("");
      setPhone("");
      setRelationship("");

      showMessage("Emergency contact added.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add emergency contact.",
      );
    } finally {
      setAdding(false);
    }
  }

  /*
   * Remove a contact.
   *
   * The user must always retain at least one contact
   * if they want to continue, but they can remove one
   * and replace it with another.
   */
  async function handleDeleteContact(contactId: string) {
    setError(null);
    setMessage(null);

    try {
      setDeletingId(contactId);

      await deleteEmergencyContact(contactId);

      setContacts((current) =>
        current.filter((contact) => contact.contact_id !== contactId),
      );

      showMessage("Emergency contact removed.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove emergency contact.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * Continue to shortcut setup.
   *
   * The button is disabled until at least one
   * emergency contact exists.
   */
  function handleContinue() {
    if (!canContinue) {
      showMessage("Add at least one emergency contact first.");
      return;
    }

    navigate({
      to: "/shortcut-setup",
    });
  }

  if (loading) {
    return (
      <MobileShell>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Loading emergency contacts...
          </p>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <ScreenHeader title="Emergency Contacts" />

      <div className="flex-1 px-6 pt-4 pb-6 overflow-y-auto">
        {/* INTRODUCTION */}

        <div>
          <h1 className="text-xl font-bold">
            Add an emergency contact
          </h1>

          <p className="text-sm text-muted-foreground mt-2">
            Choose at least one person who should receive your
            emergency alert.
          </p>

          <p className="text-xs text-primary font-medium mt-3">
            You can add up to 5 emergency contacts.
          </p>
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mt-4 rounded-xl bg-primary/10 border border-primary/20 p-3">
            <p className="text-xs text-primary font-medium">
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3">
            <p className="text-xs text-red-600 font-medium">
              {error}
            </p>
          </div>
        )}

        {/* CURRENT CONTACTS */}

        {contacts.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your Emergency Contacts
              </h2>

              <span className="text-xs text-muted-foreground">
                {contacts.length}/{MAX_CONTACTS}
              </span>
            </div>

            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.contact_id}
                  className="bg-card border border-border rounded-2xl p-4 shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-success/15 text-success flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5" strokeWidth={3} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {contact.name}
                      </h3>

                      <p className="text-xs text-muted-foreground mt-1">
                        {contact.phone}
                      </p>

                      <p className="text-xs text-primary font-medium mt-1">
                        {contact.relationship}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteContact(contact.contact_id)
                      }
                      disabled={
                        deletingId === contact.contact_id
                      }
                      className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center disabled:opacity-50"
                      aria-label={`Remove ${contact.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADD CONTACT */}

        {contacts.length < MAX_CONTACTS && (
          <div className="mt-6 bg-card border border-border rounded-2xl p-4 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>

              <div>
                <h2 className="font-semibold text-sm">
                  Add a contact
                </h2>

                <p className="text-xs text-muted-foreground mt-0.5">
                  Enter their details below.
                </p>
              </div>
            </div>

            {/* CHOOSE FROM CONTACTS */}

            <button
              type="button"
              onClick={handleChooseContact}
              className="w-full border border-primary text-primary font-semibold rounded-xl py-3 flex items-center justify-center gap-2 mb-4"
            >
              <Contact className="w-4 h-4" />

              {contactPickerSupported
                ? "Choose from Contacts"
                : "Choose from Contacts"}
            </button>

            {!contactPickerSupported && (
              <p className="text-[11px] text-muted-foreground text-center mb-4">
                Contact selection is not supported by this browser.
                You can enter the number manually below.
              </p>
            )}

            {/* NAME */}

            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                Name
              </span>

              <input
                type="text"
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full bg-secondary border border-transparent focus:border-primary focus:bg-background rounded-xl px-4 py-3 text-sm outline-none transition-colors"
              />
            </label>

            {/* PHONE */}

            <label className="block mt-3">
              <span className="text-xs font-medium text-muted-foreground">
                Phone Number
              </span>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <input
                  type="tel"
                  placeholder="+233 24 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full bg-secondary border border-transparent focus:border-primary focus:bg-background rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-colors"
                />
              </div>
            </label>

            {/* RELATIONSHIP */}

            <label className="block mt-3">
              <span className="text-xs font-medium text-muted-foreground">
                Relationship
              </span>

              <select
                value={relationship}
                onChange={(e) =>
                  setRelationship(e.target.value)
                }
                className="mt-1 w-full bg-secondary border border-transparent focus:border-primary focus:bg-background rounded-xl px-4 py-3 text-sm outline-none transition-colors appearance-none"
              >
                <option value="">Select relationship...</option>

                {relationships.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            {/* ADD BUTTON */}

            <button
              type="button"
              onClick={handleAddContact}
              disabled={
                adding ||
                !name.trim() ||
                !phone.trim() ||
                !relationship
              }
              className="mt-4 w-full bg-primary text-primary-foreground font-semibold rounded-xl py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus className="w-4 h-4" />

              {adding ? "Adding..." : "Add Emergency Contact"}
            </button>
          </div>
        )}

        {/* MAX CONTACTS MESSAGE */}

        {contacts.length >= MAX_CONTACTS && (
          <div className="mt-6 rounded-xl bg-secondary p-4 text-center">
            <p className="text-xs text-muted-foreground">
              You have reached the maximum of 5 emergency contacts.
            </p>
          </div>
        )}

        {/* REQUIREMENT */}

        <div className="mt-6 text-center">
          {!canContinue && (
            <p className="text-xs text-muted-foreground">
              Add at least one emergency contact to continue.
            </p>
          )}
        </div>
      </div>

      {/* NEXT */}

      <div className="px-6 pb-10">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="w-full font-semibold rounded-2xl py-4 text-center transition-transform
            bg-primary text-primary-foreground
            shadow-emergency active:scale-[0.98]
            disabled:bg-secondary
            disabled:text-muted-foreground
            disabled:opacity-60
            disabled:shadow-none
            disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </MobileShell>
  );
}

export default OnboardingAddContact;