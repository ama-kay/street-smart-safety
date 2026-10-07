/* eslint-disable prettier/prettier */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ShieldLogo } from "@/components/ShieldLogo";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";

export const Route = createFileRoute("/update-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
  useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [recoveryReady, setRecoveryReady] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    /*
     * Supabase detects the recovery session from the
     * password-reset URL automatically.
     *
     * We listen for PASSWORD_RECOVERY because this is
     * the event Supabase emits after the recovery link
     * establishes the recovery session.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          return;
        }

        if (event === "PASSWORD_RECOVERY" && session) {
          setRecoveryReady(true);
          setCheckingSession(false);
        }
      },
    );

    /*
     * Also check whether a session already exists.
     *
     * This handles cases where the recovery session has
     * already been established before the listener runs.
     */
    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        if (session) {
          setRecoveryReady(true);
        } else {
          setError(
            "This password reset link is invalid or has expired.",
          );
        }
      } catch (err) {
        console.error(
          "Password recovery session check failed:",
          err,
        );

        if (mounted) {
          setError(
            "This password reset link is invalid or has expired.",
          );
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (updating) {
      return;
    }

    setError("");

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setUpdating(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        console.error(
          "Password update failed:",
          error,
        );

        setError(
          "Unable to update your password. Please try again.",
        );

        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error(
        "Password update failed:",
        err,
      );

      setError(
        "Unable to update your password. Please try again.",
      );
    } finally {
      setUpdating(false);
    }
  }

  function goToLogin() {
    navigate({
      to: "/login",
    });
  }

  if (checkingSession) {
    return (
      <MobileShell>
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <p className="mt-4 text-sm text-muted-foreground">
            Verifying password reset link...
          </p>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="flex-1 px-6 pt-16 pb-6">
        <div className="flex justify-center">
          <ShieldLogo size={72} />
        </div>

        <h1 className="mt-6 text-center text-2xl font-bold">
          {success
            ? "Password Updated"
            : "Create New Password"}
        </h1>

        {success ? (
          <div className="mt-10 text-center">
            <div className="rounded-2xl bg-primary/5 p-6">
              <p className="text-sm text-muted-foreground">
                Your password has been changed
                successfully.
              </p>
            </div>

            <button
              type="button"
              onClick={goToLogin}
              className="mt-6 w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
            >
              Back to Login
            </button>
          </div>
        ) : !recoveryReady ? (
          <div className="mt-10 text-center">
            <div className="rounded-2xl bg-destructive/10 p-5">
              <p className="text-sm text-destructive">
                {error ||
                  "This password reset link is invalid or has expired."}
              </p>
            </div>

            <button
              type="button"
              onClick={goToLogin}
              className="mt-6 w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Enter a new password for your account
            </p>

            <form
              className="mt-10 space-y-4"
              onSubmit={handleSubmit}
            >
              <div className="relative">
  <Field
    icon={Lock}
    type={showPassword ? "text" : "password"}
    placeholder="New password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    autoComplete="new-password"
    required
  />

  <button
    type="button"
    onClick={() => setShowPassword((prev) => !prev)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
    aria-label={
      showPassword ? "Hide password" : "Show password"
    }
  >
    {showPassword ? (
      <EyeOff className="h-5 w-5" />
    ) : (
      <Eye className="h-5 w-5" />
    )}
  </button>
</div>

<div className="relative">
  <Field
    icon={Lock}
    type={showConfirmPassword ? "text" : "password"}
    placeholder="Confirm new password"
    value={confirmPassword}
    onChange={(e) =>
      setConfirmPassword(e.target.value)
    }
    autoComplete="new-password"
    required
  />

  <button
    type="button"
    onClick={() =>
      setShowConfirmPassword((prev) => !prev)
    }
    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
    aria-label={
      showConfirmPassword
        ? "Hide password"
        : "Show password"
    }
  >
    {showConfirmPassword ? (
      <EyeOff className="h-5 w-5" />
    ) : (
      <Eye className="h-5 w-5" />
    )}
  </button>
</div>

              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters.
              </p>

              {error && (
                <div className="rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={updating}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-emergency transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </MobileShell>
  );
}

function Field({
  icon: Icon,
  ...props
}: {
  icon: typeof Lock;
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