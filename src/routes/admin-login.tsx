/* eslint-disable prettier/prettier */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldLogo } from "@/components/ShieldLogo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/admin-login")({
  head: () => ({
    meta: [
      { title: "Admin Login — Street Smart" },
      {
        name: "description",
        content: "Sign in to the Street Smart admin console to monitor live emergencies and users.",
      },
      { property: "og:title", content: "Admin Login — Street Smart" },
      {
        property: "og:description",
        content: "Secure access to the Street Smart emergency operations dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLogin,
});

// Admin console sign-in — matches the desktop admin dashboard styling
function AdminLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <ShieldLogo size={40} />
          <span className="font-bold text-foreground text-lg">Street Smart</span>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h1 className="text-xl font-bold text-foreground mb-1">Admin Sign In</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Access the emergency operations console
          </p>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/admin" });
            }}
          >
            <div className="relative">
              <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input type="email" placeholder="Admin email" className="pl-9" />
            </div>
            <div className="relative">
              <Lock className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input type="password" placeholder="Password" className="pl-9" />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="accent-primary" />
                Remember me
              </label>
              <a href="/forgot-password" className="text-primary font-medium">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Authorized personnel only. All activity is logged.
        </p>
      </div>
    </div>
  );
}
