/* eslint-disable prettier/prettier */

import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Settings as Gear } from "lucide-react";
import { requireIncompleteSetup } from "@/lib/routeGuards";
import { completeSetup } from "@/services/authServices";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/setup")({
  beforeLoad: requireIncompleteSetup,
  component: Setup,
});

type OperatingSystem = "ios" | "android";

function getOperatingSystem(): OperatingSystem {
  const userAgent = navigator.userAgent;

  if (/Android/i.test(userAgent)) {
    return "android";
  }

  return "ios";
}

function Setup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const operatingSystem = getOperatingSystem();

  useEffect(() => {
    if (operatingSystem !== "android") {
      setLoading(false);
      return;
    }

    async function completeAndroidSetup() {
      const result = await completeSetup();

      if (!result.success) {
        alert(
          result.error ?? "Unable to complete setup.",
        );
        setLoading(false);
        return;
      }

      navigate({
        to: "/home",
      });
    }

    completeAndroidSetup();
  }, [navigate, operatingSystem]);

  // Android setup is automatic.
  if (operatingSystem === "android") {
    return (
      <MobileShell>
        <div className="flex-1 flex items-center justify-center px-8 text-center">
          {loading && (
            <p className="text-muted-foreground">
              Completing setup...
            </p>
          )}
        </div>
      </MobileShell>
    );
  }

  // iOS setup
  return (
    <MobileShell>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-24 h-24 rounded-3xl bg-info/10 flex items-center justify-center">
          <Gear
            className="w-12 h-12 text-info"
            strokeWidth={2.2}
          />
        </div>

        <h1 className="mt-8 text-2xl font-bold">
          Setup Required
        </h1>

        <p className="mt-3 text-muted-foreground leading-relaxed">
          To use the triple tap feature, you need to enable it in
          your iPhone settings.
        </p>
      </div>

      <div className="px-6 pb-10 space-y-3">
        <Link
          to="/shortcut-setup"
          className="block w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-4 text-center shadow-emergency active:scale-[0.98] transition-transform"
        >
          Get Started
        </Link>
      </div>
    </MobileShell>
  );
}

export default Setup;