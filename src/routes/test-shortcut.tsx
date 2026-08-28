import { supabase } from "@/lib/supabase";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Hand, Loader2 } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { completeSetup } from "@/services/authServices";
import { useAuth } from "@/services/authContext";
import { requireIncompleteSetup } from "@/lib/routeGuards";

export const Route = createFileRoute("/test-shortcut")({
  beforeLoad: async () => {
    await requireIncompleteSetup();
  },
  component: TestShortcut,
});

interface TriggerSession {
  id: string;
  user_id: string;
  trigger_count: number;
  purpose: string;
  status: string;
}

function TestShortcut() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [testing, setTesting] = useState(true);
  const [triggerCount, setTriggerCount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    let mounted = true;

    async function handleSession(session: TriggerSession) {
      if (!mounted) {
        return;
      }

      /*
       * We only care about the onboarding test session.
       */
      if (session.purpose !== "test") {
        return;
      }

      console.log("TEST SESSION:", session);

      /*
       * Update progress.
       */
      setTriggerCount(session.trigger_count);

      /*
       * Three successful shortcut triggers
       * complete the onboarding test.
       */
      if (session.trigger_count !== 3 || session.status !== "completed") {
        return;
      }

      try {
        const result = await completeSetup();

        if (!result.success) {
          throw new Error(result.error ?? "Failed to complete setup.");
        }

        if (!mounted) {
          return;
        }

        console.log("TEST PAGE: setup completed.");

        setSuccess(true);
        setTesting(false);

        setTimeout(() => {
          if (mounted) {
            navigate({
              to: "/home",
            });
          }
        }, 2500);
      } catch (err) {
        console.error("Shortcut test error:", err);

        if (!mounted) {
          return;
        }

        setTesting(false);

        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    }

    /*
     * ---------------------------------------------------------
     * Check for an existing test session first.
     *
     * This prevents the UI from missing a session that was
     * created before the realtime listener finished connecting.
     * ---------------------------------------------------------
     */

    async function loadExistingSession() {
      const { data, error } = await supabase
        .from("shortcut_trigger_sessions")
        .select("id, user_id, trigger_count, purpose, status")
        .eq("user_id", user.id)
        .eq("purpose", "test")
        .in("status", ["pending", "completed"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error("Failed to load shortcut test session:", error);

        setError("Unable to load shortcut test progress.");
        return;
      }

      if (data) {
        await handleSession(data as TriggerSession);
      }
    }

    loadExistingSession();

    /*
     * ---------------------------------------------------------
     * Realtime listener
     * ---------------------------------------------------------
     */

    const channel = supabase
      .channel(`shortcut-test-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shortcut_trigger_sessions",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log("TEST PAGE RECEIVED SESSION INSERT:", payload);

          await handleSession(payload.new as TriggerSession);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shortcut_trigger_sessions",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log("TEST PAGE RECEIVED SESSION UPDATE:", payload);

          await handleSession(payload.new as TriggerSession);
        },
      )
      .subscribe((status) => {
        console.log("TEST PAGE REALTIME STATUS:", status);

        if (!mounted) {
          return;
        }

        if (status === "SUBSCRIBED") {
          console.log("TEST PAGE: listening for shortcut trigger sessions.");

          setTesting(true);
          setError("");
        }

        if (status === "CHANNEL_ERROR") {
          setTesting(false);
          setError("Unable to listen for the shortcut test. Please refresh the page.");
        }

        if (status === "TIMED_OUT") {
          setTesting(false);
          setError("The connection timed out. Please refresh the page.");
        }
      });

    return () => {
      mounted = false;

      console.log("TEST PAGE: removing realtime listener.");

      supabase.removeChannel(channel);
    };
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <MobileShell>
        <ScreenHeader title="Test Your Shortcut" />

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <ScreenHeader title="Test Your Shortcut" />

      <div className="flex-1 px-6 pt-6 pb-10 flex flex-col">
        {!success ? (
          <>
            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Hand className="w-9 h-9" />
              </div>

              <h1 className="text-xl font-bold mt-6">Test Your Emergency Shortcut</h1>

              <p className="text-sm text-muted-foreground mt-3">
                Let's make sure your shortcut is working correctly before you finish setup.
              </p>
            </div>

            <div className="mt-8 bg-card border border-border rounded-2xl p-5 shadow-card text-center">
              <p className="text-sm font-semibold">Triple tap your phone 3 times</p>

              <p className="text-xs text-muted-foreground mt-2">
                Triple tap the back of your iPhone three times within 20 seconds. We'll
                automatically detect each trigger.
              </p>

              <div className="mt-6">
                <p className="text-4xl font-bold text-primary">{triggerCount} / 3</p>

                <p className="text-xs text-muted-foreground mt-1">shortcut triggers detected</p>
              </div>

              {testing && (
                <div className="mt-5 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Waiting for your shortcut...
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-500 text-center mt-6">{error}</p>}

            <div className="mt-auto pt-8 text-center">
              <p className="text-xs text-muted-foreground">
                Don't press anything here. Simply triple tap your phone three times within 20
                seconds.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-success/15 text-success flex items-center justify-center">
              <Check className="w-10 h-10" strokeWidth={3} />
            </div>

            <h1 className="text-2xl font-bold mt-6">Setup Complete!</h1>

            <p className="text-sm text-muted-foreground mt-3 max-w-sm">
              Your emergency shortcut is working correctly. Street Smart is now ready to use.
            </p>

            <p className="text-xs text-muted-foreground mt-6">Taking you to the home page...</p>
          </div>
        )}
      </div>
    </MobileShell>
  );
}

export default TestShortcut;
