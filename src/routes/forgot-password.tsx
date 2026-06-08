/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ShieldLogo } from "@/components/ShieldLogo";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!emailSent) return;

  const timer = setInterval(() => {
    setCountdown((prev) => {
      if (prev <= 1) {
        setCanResend(true);
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [emailSent]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailSent(true);
    setCountdown(60);
    setCanResend(false);
  }

  function handleResend() {
    setCountdown(60);
    setCanResend(false);
  }

  return (
    <MobileShell>
      <div className="flex-1 px-6 pt-16 pb-6">
        <div className="flex justify-center">
          <ShieldLogo size={72} />
        </div>

        <h1 className="text-2xl font-bold text-center mt-6">Forgot Password</h1>

        {!emailSent ? (
          <>
            <p className="text-center text-muted-foreground text-sm mt-1">
              Enter your email to reset your password
            </p>

            <form className="mt-10 space-y-4" onSubmit={handleSubmit}>
              <Field icon={Mail} type="email" placeholder="Email or phone" />

              <button
                type="submit"
                className="block w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-4 text-center shadow-emergency active:scale-[0.98] transition-transform"
              >
                Reset Password
              </button>
            </form>
          </>
        ) : (
          <div className="mt-10 text-center space-y-4">
            <p className="text-sm text-muted-foreground">Check your email for a reset link.</p>

            <p className="text-xs text-muted-foreground">
              You can resend the link in{" "}
              <span className="font-semibold text-foreground">{countdown}s</span>
            </p>

            <button
              disabled={!canResend}
              onClick={handleResend}
              className={`w-full font-semibold rounded-2xl py-4 transition-transform ${
                canResend
                  ? "bg-primary text-primary-foreground active:scale-[0.98]"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              Resend Link
            </button>
          </div>
        )}
      </div>
    </MobileShell>
  );
}

function Field({
  icon: Icon,
  ...props
}: { icon: typeof Mail } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
      <input
        {...props}
        className="w-full bg-secondary border border-transparent focus:border-primary focus:bg-background rounded-xl pl-12 pr-4 py-4 text-sm outline-none transition-colors"
      />
    </div>
  );
}
