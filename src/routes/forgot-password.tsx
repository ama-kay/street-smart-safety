/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ShieldLogo } from "@/components/ShieldLogo";
import { Mail, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!emailSent || canResend) {
      return;
    }

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
  }, [emailSent, canResend]);

  async function sendResetEmail() {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const redirectTo = `${window.location.origin}/update-password`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo,
          },
        );

      if (error) {
        console.error(
          "Password reset request failed:",
          error,
        );

        setError(
          "Unable to send the password reset email. Please try again.",
        );

        return;
      }

      setEmailSent(true);
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      console.error(
        "Password reset request failed:",
        err,
      );

      setError(
        "Unable to send the password reset email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (loading) {
      return;
    }

    sendResetEmail();
  }

  async function handleResend() {
    if (!canResend || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const redirectTo = `${window.location.origin}/update-password`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo,
          },
        );

      if (error) {
        console.error(
          "Password reset resend failed:",
          error,
        );

        setError(
          "Unable to resend the password reset email. Please try again.",
        );

        return;
      }

      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      console.error(
        "Password reset resend failed:",
        err,
      );

      setError(
        "Unable to resend the password reset email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <MobileShell>
      <div className="flex-1 px-6 pt-16 pb-6">
        <div className="flex justify-center">
          <ShieldLogo size={72} />
        </div>

        <h1 className="mt-6 text-center text-2xl font-bold">
          Forgot Password
        </h1>

        {!emailSent ? (
          <>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Enter your email to reset your password
            </p>

            <form
              className="mt-10 space-y-4"
              onSubmit={handleSubmit}
            >
              <Field
                icon={Mail}
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                autoComplete="email"
                required
              />

              {error && (
                <div className="rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-center font-semibold text-primary-foreground shadow-emergency transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="mt-10 space-y-4 text-center">
            <div className="rounded-2xl bg-primary/5 p-5">
              <Mail className="mx-auto h-10 w-10 text-primary" />

              <p className="mt-4 text-sm font-semibold text-foreground">
                Check your email
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                If an account exists for this email,
                a password reset link has been sent.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">
                {error}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {canResend ? (
                "You can request another reset link."
              ) : (
                <>
                  You can resend the link in{" "}
                  <span className="font-semibold text-foreground">
                    {countdown}s
                  </span>
                </>
              )}
            </p>

            <button
              type="button"
              disabled={!canResend || loading}
              onClick={handleResend}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold transition-transform ${
                canResend && !loading
                  ? "bg-primary text-primary-foreground active:scale-[0.98]"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend Link"
              )}
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
}: {
  icon: typeof Mail;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

      <input
        {...props}
        className="w-full rounded-xl border border-transparent bg-secondary py-4 pl-12 pr-4 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
      />
    </div>
  );
}