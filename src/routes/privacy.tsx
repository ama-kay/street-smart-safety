/* eslint-disable prettier/prettier */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";

import {
  ArrowLeft,
  MapPin,
  Users,
  Lock,
  Eye,
  Server,
} from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: Privacy,
});

const sections = [
  {
    icon: MapPin,
    title: "Location data",
    body:
      "Your location is only accessed when you trigger an emergency or run a test alert. We share your real-time coordinates with the contacts you select and emergency responders so they can reach you quickly. Location is never tracked in the background or sold to third parties.",
  },
  {
    icon: Users,
    title: "Contact information",
    body:
      "Emergency contacts you save are stored securely on your device and synced to your account. They are only used to deliver SMS and call alerts when you trigger the SOS. We do not message your contacts for marketing or share their numbers with anyone.",
  },
  {
    icon: Lock,
    title: "How your data is protected",
    body:
      "All personal data is encrypted in transit and at rest. Only you can view and edit your contacts and history. Our team cannot read your messages or location logs.",
  },
  {
    icon: Eye,
    title: "What we never collect",
    body:
      "We do not collect your microphone audio, camera feed, browsing activity, or contacts outside of those you explicitly add as emergency contacts.",
  },
  {
    icon: Server,
    title: "Data retention",
    body:
      "Emergency history is stored for 90 days for your reference, then automatically deleted. You can clear your history at any time from the History screen.",
  },
];

function Privacy() {
  const navigate = useNavigate();

  return (
    <MobileShell>
        <ScreenHeader title="Privacy Policy" back="/settings" />
      <div className="px-5 pt-8 pb-6">
        {/* Header */}
       {/*  <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate({ to: "/settings" })}
            className="p-1"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>

          <h1 className="text-xl font-bold text-foreground">
            Privacy
          </h1>
        </div> */}

        {/* Intro */}
        <p className="text-sm text-muted-foreground mb-6">
          Your safety depends on trust. Here's exactly how your information is used.
        </p>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map((s, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-full bg-info-soft text-info flex items-center justify-center">
                  <s.icon className="h-4 w-4" />
                </div>

                <h3 className="text-sm font-semibold text-foreground">
                  {s.title}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

export default Privacy;