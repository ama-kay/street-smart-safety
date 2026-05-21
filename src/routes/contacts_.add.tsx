import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { User, Phone, ChevronDown } from "lucide-react";
import { ContactsShell } from "@/components/ContactsShell";

export const Route = createFileRoute("/contacts_/add")({
  component: AddContact,
});

function AddContact() {
  const navigate = useNavigate();
  return (
    <MobileShell>
      <ScreenHeader title="Add Contact" back="/contacts" />
{/*       <ContactsShell>
 */}      <form
        onSubmit={(e) => { e.preventDefault(); navigate({ to: "/contacts" }); }}
        className="flex-1 px-6 pt-6 pb-6 flex flex-col"
      >
        <div className="space-y-4 flex-1">
          <Field icon={User} placeholder="Full Name" />
          <Field icon={Phone} type="tel" placeholder="Phone Number" />
          <div className="relative">
            <select
              className="w-full appearance-none bg-secondary border border-transparent focus:border-primary focus:bg-background rounded-xl px-4 py-4 text-sm outline-none"
              defaultValue=""
            >
              <option value="" disabled>Select Relationship</option>
              <option>Family</option>
              <option>Friend</option>
              <option>Partner</option>
              <option>Doctor</option>
              <option>Other</option>
            </select>
            <ChevronDown className="w-5 h-5 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-4 shadow-emergency active:scale-[0.98] transition-transform"
        >
          Save Contact
        </button>
      </form>
{/*       </ContactsShell>
 */}    </MobileShell>
  );
}

function Field({ icon: Icon, ...props }: { icon: typeof User } & React.InputHTMLAttributes<HTMLInputElement>) {
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
