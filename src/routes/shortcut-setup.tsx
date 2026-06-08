/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Check, Settings, Hand, Zap } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/shortcut-setup")({
  component: ShortcutSetup,
});

const initialSteps = [
  {
    Icon: Settings,
    title: "Open Settings",
    desc: "Go to Settings → Accessibility → Touch",
  },
  {
    Icon: Hand,
    title: "Enable Back Tap",
    desc: "Scroll down and select 'Back Tap'",
  },
  {
    Icon: Zap,
    title: "Assign Emergency Shortcut",
    desc: "Choose 'Triple Tap' → Street Smart",
  },
];

function ShortcutSetup() {
  const [steps, setSteps] = useState(
    initialSteps.map((s) => ({
      ...s,
      done: false,
    }))
  );

  const [message, setMessage] = useState<string | null>(null);

  const allDone = steps.every((s) => s.done);

  function showMessage(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(null), 2000);
  }

  function toggleStep(index: number) {
    setSteps((prev) => {
      const canComplete = index === 0 || prev[index - 1].done;

      if (!canComplete) {
        showMessage("Complete previous step");
        return prev;
      }

      return prev.map((step, i) => {
        if (i === index) {
          return { ...step, done: true };
        }
        return step;
      });
    });
  }

  return (
    <MobileShell>
      <ScreenHeader title="Triple Tap Setup" back="/setup" />

      <div className="flex-1 px-6 pt-6 pb-6">
        <p className="text-sm text-muted-foreground">
          Follow these steps to enable the emergency shortcut. {'\n'}
        </p>
         <p className="text-sm text-primary font-medium text-muted-foreground">
         {'\n'} WARNING: This system will not function properly until you complete all the steps.
        </p>

        {/* Floating message */}
        {message && (
          <div className="mt-4 text-sm text-warning font-medium">
            {message}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {steps.map(({ Icon, title, desc, done }, i) => {
            const locked = i > 0 && !steps[i - 1].done;

            return (
              <div
                key={title}
                onClick={() => toggleStep(i)}
                className={`bg-card border border-border rounded-2xl p-4 flex items-center gap-4 shadow-card ${
                  locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    done
                      ? "bg-success/15 text-success"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1">
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    STEP {i + 1}
                  </div>
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {desc}
                  </p>
                </div>

                {done && (
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center flex-shrink-0">
                    <Check
                      className="w-4 h-4 text-success-foreground"
                      strokeWidth={3}
                    />
                  </div>
                )}
              </div>
            );
          })}
          <div className="pb-10 pt-2 text-center">
            <p className="text-xs text-muted-foreground">
              Need help? Click{" "}
              <a href="https://youtu.be/Dm9Zf1WYQ_A?t=63" className="text-xs text-primary font-medium">
                here
              </a>{" "}
              for a step-by-step video tutorial.
            </p>
          </div>
        </div>
      </div>

     
      
      <div className="px-6 pb-10 space-y-2">
        <Link
          to="/home"
          className={`block w-full font-semibold rounded-2xl py-4 text-center transition-transform ${
            allDone
              ? "bg-primary text-primary-foreground shadow-emergency active:scale-[0.98]"
              : "bg-secondary text-muted-foreground opacity-60 pointer-events-none"
          }`}
        >
          Continue to Home
        </Link>

        {/* Helper message under button */}
        {!allDone && (
          <p className="text-center text-xs text-muted-foreground">
            Complete all steps to continue
          </p>
        )}
      </div>
    </MobileShell>
  );
}