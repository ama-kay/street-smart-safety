import { RequireAuth } from "@/components/RequireAuth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Phone } from "lucide-react";

export const Route = createFileRoute("/trigger")({
  component: () => (
    <RequireAuth>
      <Trigger />
    </RequireAuth>
  ),
});

// Full-bleed emergency-activated screen with countdown
function Trigger() {
  const [seconds, setSeconds] = useState(24);
  const navigate = useNavigate();

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const total = 24;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (1 - seconds / total);

  return (
    <div className="min-h-screen w-full bg-muted flex items-stretch justify-center">
      <div className="w-full max-w-[440px] min-h-screen bg-primary text-primary-foreground flex flex-col px-6 pt-16 pb-10 relative overflow-hidden">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/15 flex items-center justify-center backdrop-blur">
            <AlertTriangle className="w-8 h-8" strokeWidth={2.4} />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">Emergency Activated</h1>
          <p className="mt-2 text-primary-foreground/80 text-sm max-w-xs">
            Alert will be sent to your emergency contacts in {seconds} seconds.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-72 h-72">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 280 280">
              <circle
                cx="140"
                cy="140"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="10"
              />
              <circle
                cx="140"
                cy="140"
                r={radius}
                fill="none"
                stroke="white"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-7xl font-bold tabular-nums">{seconds}</span>
              <span className="text-sm uppercase tracking-widest text-primary-foreground/80 mt-1">
                seconds
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="block w-full bg-primary-foreground text-primary font-bold rounded-2xl py-4 active:scale-[0.98] transition-transform"
          >
            Cancel Emergency
          </button>
          <button className="w-full border-2 border-primary-foreground/30 text-primary-foreground font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            <Phone className="w-5 h-5" />
            Call Emergency Services
          </button>
        </div>
      </div>
    </div>
  );
}
