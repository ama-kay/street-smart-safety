import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Hand, MessageSquare, BellRing } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  component: HowItWorks,
});

const steps = [
  { Icon: Hand, title: "Triple Tap Phone", desc: "Tap the back of your phone 3 times." },
  { Icon: MessageSquare, title: "Message Sent", desc: "Alert is triggered automatically." },
  { Icon: BellRing, title: "Help Notified", desc: "Your contacts receive your alert." },
];

// Onboarding — explain the 3-step triple-tap flow
function HowItWorks() {
  return (
    <MobileShell>
      <div className="flex-1 px-6 pt-16">
        <h1 className="text-3xl font-bold text-center">How It Works</h1>
        <p className="text-center text-muted-foreground mt-2">
          Three simple steps to get help fast.
        </p>
        <div className="mt-10 space-y-4">
          {steps.map(({ Icon, title, desc }, i) => (
            <div
              key={title}
              className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 shadow-card"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 pt-1">
                <div className="text-xs font-semibold text-primary tracking-wide">STEP {i + 1}</div>
                <h3 className="font-semibold mt-0.5">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 pb-10 pt-6">
        <Link
          to="/login"
          className="block w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-4 text-center shadow-emergency active:scale-[0.98] transition-transform"
        >
          Continue
        </Link>
      </div>
    </MobileShell>
  );
}
