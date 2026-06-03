import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { User, Phone, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: Signup,
});

// Account creation
function Signup() {
  return (
    <MobileShell>
      <ScreenHeader title="Create Account" back="/login" />
      <div className="flex-1 px-6 pt-6 pb-6">
        <p className="text-muted-foreground text-sm">
          Set up your profile to start protecting yourself.
        </p>
        <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Field icon={User} placeholder="Full Name" />
          <Field icon={Phone} type="tel" placeholder="Phone Number" />
          <Field icon={Mail} type="email" placeholder="Email (optional)" />
          <Field icon={Lock} type="password" placeholder="Password" />
          <Link
            to="/setup"
            className="block w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-4 text-center shadow-emergency active:scale-[0.98] transition-transform mt-2"
          >
            Create Account
          </Link>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold">
            Login
          </Link>
        </p>
      </div>
    </MobileShell>
  );
}

function Field({
  icon: Icon,
  ...props
}: { icon: typeof User } & React.InputHTMLAttributes<HTMLInputElement>) {
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
