/* eslint-disable prettier/prettier */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Hand, Loader2 } from "lucide-react";

import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";

import { supabase } from "@/lib/supabase";
import { requireCompletedSetup } from "@/lib/routeGuards";

export const Route = createFileRoute("/test-new-shortcut")({
  beforeLoad: requireCompletedSetup,
  component: TestNewShortcut,
});

function TestNewShortcut() {
  const navigate = useNavigate();

  const [testing, setTesting] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    async function checkNewShortcut() {
      try {
        /*
         * Get the currently active token.
         *
         * A newly generated token is initially:
         *
         * active = false
         * last_used = null
         *
         * Once the shortcut is triggered, the Edge Function
         * changes it to:
         *
         * active = true
         * last_used = current timestamp
         *
         * We therefore look for the latest token that has
         * been used.
         */
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("You must be logged in.");
        }

        /*
         * Find the most recently created shortcut token.
         *
         * This should be the token the user just generated.
         */
        const { data: token, error: tokenError } = await supabase
          .from("shortcut_tokens")
          .select("id, active, last_used, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (tokenError) {
          throw new Error(tokenError.message);
        }

        if (!token) {
          console.log("New shortcut test: no token found yet.");
          return;
        }

        /*
         * The new token becomes active after the shortcut
         * successfully reaches the Edge Function.
         */
        if (!token.active || !token.last_used) {
          console.log(
            "New shortcut test: waiting for the new token to be used.",
          );
          return;
        }

        console.log(
          "New shortcut test: new token has been activated.",
        );

        if (!mounted) return;

        setSuccess(true);
        setTesting(false);

        /*
         * Stop polling once the new token has been activated.
         */
        if (interval) {
          clearInterval(interval);
          interval = null;
        }

        /*
         * Give the user time to see the success message.
         */
        timeout = setTimeout(() => {
          if (mounted) {
            navigate({
              to: "/home",
            });
          }
        }, 2500);
      } catch (err) {
        console.error("New shortcut test error:", err);

        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong.",
        );
      }
    }

    /*
     * Check immediately.
     */
    checkNewShortcut();

    /*
     * Continue checking every second.
     */
    interval = setInterval(() => {
      checkNewShortcut();
    }, 1000);

    return () => {
      mounted = false;

      if (interval) {
        clearInterval(interval);
      }

      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [navigate]);

  return (
    <MobileShell>
      <ScreenHeader title="Test New Shortcut" />

      <div className="flex-1 px-6 pt-6 pb-10 flex flex-col">
        {!success ? (
          <>
            {/* INTRODUCTION */}

            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Hand className="w-9 h-9" />
              </div>

              <h1 className="text-xl font-bold mt-6">
                Test Your New Shortcut
              </h1>

              <p className="text-sm text-muted-foreground mt-3">
                Let's make sure your new shortcut token is working
                correctly.
              </p>
            </div>

            {/* TEST CARD */}

            <div className="mt-8 bg-card border border-border rounded-2xl p-5 shadow-card text-center">
              <p className="text-sm font-semibold">
                Trigger your Street Smart shortcut
              </p>

              <p className="text-xs text-muted-foreground mt-2 leading-5">
                Use the shortcut you just updated with your new token.
                We'll automatically detect when the new token has been
                activated.
              </p>

              {testing && (
                <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />

                  <span>
                    Waiting for your shortcut...
                  </span>
                </div>
              )}
            </div>

            {/* ERROR */}

            {error && (
              <p className="text-sm text-red-500 text-center mt-6">
                {error}
              </p>
            )}

            {/* FOOTER */}

            <div className="mt-auto pt-8 text-center">
              <p className="text-xs text-muted-foreground">
                Don't press anything here. Simply trigger your updated
                shortcut and we'll detect it automatically.
              </p>
            </div>
          </>
        ) : (
          /* SUCCESS */

          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-success/15 text-success flex items-center justify-center">
              <Check
                className="w-10 h-10"
                strokeWidth={3}
              />
            </div>

            <h1 className="text-2xl font-bold mt-6">
              Shortcut Updated!
            </h1>

            <p className="text-sm text-muted-foreground mt-3 max-w-sm">
              Your new shortcut token is working correctly. Your
              emergency shortcut is ready to use.
            </p>

            <p className="text-xs text-muted-foreground mt-6">
              Taking you to the home page...
            </p>
          </div>
        )}
      </div>
    </MobileShell>
  );
}

export default TestNewShortcut;