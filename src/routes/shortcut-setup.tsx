import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Check, Settings, Hand, Zap } from "lucide-react";

export const Route = createFileRoute("/shortcut-setup")({
  component: ShortcutSetup,
});

const steps = [
  {
    Icon: Settings,
    title: "Open Settings",
    desc: "Go to Settings → Accessibility → Touch",
    done: true,
  },
  { Icon: Hand, title: "Enable Back Tap", desc: "Scroll down and select 'Back Tap'", done: true },
  {
    Icon: Zap,
    title: "Assign Emergency Shortcut",
    desc: "Choose 'Triple Tap' → Street Smart",
    done: false,
  },
];

// Walkthrough for OS-level triple-tap shortcut configuration
function ShortcutSetup() {
  return (
    <MobileShell>
      <ScreenHeader title="Triple Tap Setup" back="/setup" />
      <div className="flex-1 px-6 pt-6 pb-6">
        <p className="text-sm text-muted-foreground">
          Follow these steps on your phone to enable the emergency shortcut.
        </p>
        <div className="mt-6 space-y-3">
          {steps.map(({ Icon, title, desc, done }, i) => (
            <div
              key={title}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-card"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  done ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-[11px] font-semibold text-muted-foreground">STEP {i + 1}</div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              {done && (
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-success-foreground" strokeWidth={3} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 pb-10">
        <Link
          to="/home"
          className="block w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-4 text-center shadow-emergency active:scale-[0.98] transition-transform"
        >
          Continue to Home
        </Link>
      </div>
    </MobileShell>
  );
}
