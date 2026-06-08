import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ShieldLogo } from "@/components/ShieldLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Street Smart — Personal Emergency Safety" },
      {
        name: "description",
        content: "Triple-tap your phone to instantly alert your emergency contacts.",
      },
    ],
  }),
  component: Welcome,
});

// Welcome screen — first impression, brand & primary CTA
function Welcome() {
  return (
    <MobileShell>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <ShieldLogo size={96} />
        <h1 className="mt-8 text-4xl font-bold tracking-tight">Street Smart</h1>
        <p className="mt-4 text-muted-foreground text-lg leading-relaxed max-w-xs">
          Your personal emergency safety system.
        </p>
      </div>
      <div className="px-6 pb-10 space-y-6">
        <Link
          to="/how-it-works"
          className="block w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-4 text-center shadow-emergency active:scale-[0.98] transition-transform"
        >
          Get Started
        </Link>
      </div>
    </MobileShell>
  );
}
