import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Check, Clock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/history")({
  component: History,
});

const events = [
  {
    date: "Oct 12, 2025",
    time: "9:42 PM",
    status: "Pending",
    location: "Downtown, Main St",
    ok: false,
  },
  {
    date: "Sep 28, 2025",
    time: "11:15 PM",
    status: "Resolved",
    location: "Park Avenue",
    ok: true,
  },
  { date: "Sep 03, 2025", time: "6:08 PM", status: "Sent", location: "5th Avenue", ok: true },
  { date: "Aug 21, 2025", time: "2:34 AM", status: "Cancelled", location: "Home", ok: false },
];

function History() {
  return (
    <MobileShell>
      <ScreenHeader title="Emergency History" />
      <div className="flex-1 px-6 pt-6 pb-10 overflow-y-auto">
        <p className="text-sm text-muted-foreground mb-4">Recent alerts you've triggered.</p>
        <div className="space-y-3">
          {events.map((e, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4 shadow-card"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  e.ok ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}
              >
                {e.ok ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-sm">{e.date}</h3>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      e.ok ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {e.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {e.time}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{e.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
