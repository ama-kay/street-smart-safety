import { createFileRoute, Link } from "@tanstack/react-router";
import { requireCompletedSetup } from "@/lib/routeGuards";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BottomNav } from "@/components/BottomNav";
import { Phone, Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  deleteEmergencyContact,
  getEmergencyContacts,
  type EmergencyContact,
} from "@/services/contactsService";

export const Route = createFileRoute("/contacts")({
  beforeLoad: requireCompletedSetup,
  component: Contacts,
});

const contactColors = ["oklch(0.7 0.15 30)", "oklch(0.65 0.15 240)", "oklch(0.65 0.15 150)"];

function Contacts() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [contactToDelete, setContactToDelete] = useState<EmergencyContact | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadContacts() {
      try {
        const data = await getEmergencyContacts();
        setContacts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load contacts.");
      } finally {
        setLoading(false);
      }
    }

    loadContacts();
  }, []);

  const handleDelete = async () => {
    if (!contactToDelete) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteEmergencyContact(contactToDelete.contact_id);

      setContacts((currentContacts) =>
        currentContacts.filter((contact) => contact.contact_id !== contactToDelete.contact_id),
      );

      setContactToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete contact.");
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <MobileShell>
      <ScreenHeader title="Emergency Contacts" />

      <div className="flex-1 px-6 pt-6 pb-4 overflow-y-auto">
        <p className="text-sm text-muted-foreground mb-4">
          These contacts will be notified when an emergency is triggered.
        </p>

        {loading && (
          <p className="text-sm text-muted-foreground text-center py-8">Loading contacts...</p>
        )}

        {!loading && error && <p className="text-sm text-red-500 text-center py-8">{error}</p>}

        {!loading && !error && contacts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">You have no emergency contacts yet.</p>
          </div>
        )}

        {!loading && !error && contacts.length > 0 && (
          <div className="space-y-3">
            {contacts.map((contact, index) => (
              <div
                key={contact.contact_id}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-card"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shrink-0"
                  style={{
                    background: contactColors[index % contactColors.length],
                  }}
                >
                  {getInitials(contact.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{contact.name}</h3>

                  <p className="text-xs text-muted-foreground">{contact.relationship}</p>

                  <p className="text-xs text-muted-foreground truncate">{contact.phone}</p>

                  {contact.address && (
                    <p className="text-xs text-muted-foreground truncate">{contact.address}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      aria-label={`Options for ${contact.name}`}
                      onClick={() =>
                        setOpenMenu(openMenu === contact.contact_id ? null : contact.contact_id)
                      }
                      className="w-10 h-10 rounded-full bg-secondary text-foreground flex items-center justify-center"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenu === contact.contact_id && (
                      <div className="absolute right-0 top-12 z-20 w-36 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                        <Link
                          to="/contacts/edit/$contactId"
                          params={{
                            contactId: contact.contact_id,
                          }}
                          onClick={() => setOpenMenu(null)}
                          className="flex items-center gap-2 w-full px-3 py-3 text-sm hover:bg-secondary"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenu(null);
                            setContactToDelete(contact);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-3 text-sm text-red-500 hover:bg-secondary"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <a
                    href={`tel:${contact.phone}`}
                    aria-label={`Call ${contact.name}`}
                    className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <div className="text-center mb-3">
            <p className="text-xs text-muted-foreground">{contacts.length}/5 emergency contacts</p>
          </div>

          {contacts.length < 5 ? (
            <Link
              to="/contacts/add"
              className="w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 shadow-emergency active:scale-[0.98] transition-transform"
            >
              <Plus className="w-5 h-5" />
              Add Contact
            </Link>
          ) : (
            <div className="w-full bg-secondary text-muted-foreground font-semibold rounded-2xl py-4 text-center">
              <p className="text-sm">Maximum contacts reached</p>

              <p className="text-xs font-normal mt-1">You can have up to 5 emergency contacts.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />

      {contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-sm bg-card rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold">Delete Contact?</h2>

            <p className="text-sm text-muted-foreground mt-2">
              Are you sure you want to delete {contactToDelete.name}?
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setContactToDelete(null)}
                disabled={deleting}
                className="bg-secondary text-foreground font-semibold rounded-xl py-3 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-primary text-primary-foreground font-semibold rounded-xl py-3 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
