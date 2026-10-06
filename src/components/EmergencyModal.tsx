/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { stopEmergencyTracking } from "@/services/trackingService";

type ActiveEmergency = {
  id: string;
  status: string;
  created_at: string;
};

export function EmergencyModal() {
  const [emergency, setEmergency] = useState<ActiveEmergency | null>(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadActiveEmergency() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        const { data, error } = await supabase
          .from("sos_alerts")
          .select("id, status, created_at")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Failed to check active emergency:", error);

          if (mounted) {
            setError("Unable to check emergency status.");
          }

          return;
        }

        if (mounted) {
          setEmergency(data);
        }
      } catch (err) {
        console.error("Active emergency check failed:", err);

        if (mounted) {
          setError("Unable to check emergency status.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadActiveEmergency();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Listen for changes to the user's emergency.
   *
   * This means the modal can disappear immediately when
   * the emergency status changes from "active" to "resolved".
   */
  useEffect(() => {
    let mounted = true;

    async function subscribeToEmergency() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const channel = supabase
        .channel(`active-emergency-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "sos_alerts",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("Emergency status update:", payload);

            if (!mounted) {
              return;
            }

            if (payload.eventType === "INSERT") {
              const newEmergency = payload.new as ActiveEmergency;

              if (newEmergency.status?.toLowerCase() === "active") {
                setEmergency(newEmergency);
              }
            }

            if (payload.eventType === "UPDATE") {
              const updatedEmergency = payload.new as ActiveEmergency;

              if (updatedEmergency.status?.toLowerCase() === "active") {
                setEmergency(updatedEmergency);
              } else {
                setEmergency(null);
              }
            }
          },
        )
        .subscribe((status) => {
          console.log("Emergency realtime subscription:", status);
        });

      return channel;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    subscribeToEmergency().then((createdChannel) => {
      channel = createdChannel ?? null;
    });

    return () => {
      mounted = false;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  async function endEmergency() {
    if (!emergency || ending) {
      return;
    }

    setEnding(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in.");
      }

      const { error } = await supabase
        .from("sos_alerts")
        .update({
          status: "resolved",
        })
        .eq("id", emergency.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to end emergency:", error);
        throw new Error("Failed to end emergency.");
      }

      /*
       * Stop the browser GPS watcher that was started
       * when the emergency was triggered.
       */
      stopEmergencyTracking();

      /*
       * Realtime will normally clear the modal for us,
       * but clearing it here makes the UI respond immediately.
       */
      setEmergency(null);
    } catch (err) {
      console.error("End emergency failed:", err);

      setError(err instanceof Error ? err.message : "Failed to end emergency.");
    } finally {
      setEnding(false);
    }
  }

  if (loading || !emergency) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <AlertTriangle className="h-8 w-8" strokeWidth={2.3} />
          </div>

          <h2 id="emergency-modal-title" className="mt-5 text-2xl font-bold text-foreground">
            Emergency Active
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your emergency alert is currently active. Your emergency contacts have been notified and
            your location is being shared.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckCircle className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">Emergency alert sent</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Your emergency contacts can track your location while this emergency remains active.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={endEmergency}
          disabled={ending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 font-bold text-primary-foreground transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {ending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Ending Emergency...
            </>
          ) : (
            "End Emergency"
          )}
        </button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Do not end the emergency until you are safe.
        </p>
      </div>
    </div>
  );
}
