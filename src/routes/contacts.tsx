import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { BottomNav } from "@/components/BottomNav";
import { Phone, Plus } from "lucide-react";

export const Route = createFileRoute("/contacts")({
  component: Contacts,
});

const contacts = [
  { name: "Sarah Johnson", relation: "Sister", phone: "+1 (555) 234-5678", color: "oklch(0.7 0.15 30)" },
  { name: "Mike Davis", relation: "Friend", phone: "+1 (555) 345-6789", color: "oklch(0.65 0.15 240)" },
  { name: "Dr. Emily Chen", relation: "Doctor", phone: "+1 (555) 456-7890", color: "oklch(0.65 0.15 150)" },
];

function Contacts() {
  return (
    <MobileShell>
      <ScreenHeader title="Emergency Contacts" />
      <div className="flex-1 px-6 pt-6 pb-4 overflow-y-auto">
        <p className="text-sm text-muted-foreground mb-4">
          These contacts will be notified when an emergency is triggered.
        </p>
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.name} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-card">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ background: c.color }}
              >
                {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">{c.name}</h3>
                <p className="text-xs text-muted-foreground">{c.relation}</p>
                <p className="text-xs text-muted-foreground truncate">{c.phone}</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <Link
          to="/contacts/add"
          className="mt-6 w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 shadow-emergency active:scale-[0.98] transition-transform"
        >
          <Plus className="w-5 h-5" />
          Add Contact
        </Link>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
