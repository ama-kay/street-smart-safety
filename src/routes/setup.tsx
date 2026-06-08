import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Settings as Gear } from "lucide-react";

export const Route = createFileRoute("/setup")({
  component: Setup,
});

// Prompt user to set up the triple-tap shortcut in OS settings
function Setup() {
  return (
    <MobileShell>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-24 h-24 rounded-3xl bg-info/10 flex items-center justify-center">
          <Gear className="w-12 h-12 text-info" strokeWidth={2.2} />
        </div>
        <h1 className="mt-8 text-2xl font-bold">Setup Required</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          To use the triple tap feature, you need to enable it in your phone settings.
        </p>
      </div>
      <div className="px-6 pb-10 space-y-3">
        {/*  <button className="block w-full bg-success text-success-foreground font-semibold rounded-2xl py-4 active:scale-[0.98] transition-transform">
          Mark as Done
        </button> */}
        <Link
          to="/shortcut-setup"
          className="block w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-4 text-center shadow-emergency active:scale-[0.98] transition-transform"
        >
          Get Started
        </Link>
      </div>
    </MobileShell>
  );
}
