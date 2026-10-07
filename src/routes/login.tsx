/* eslint-disable prettier/prettier */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginUser } from "@/services/authServices";
import { MobileShell } from "@/components/MobileShell";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

// Login screen
function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const result = await loginUser(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    navigate({ to: "/home" });
  };

  return (
    <MobileShell>
      <div className="flex-1 px-6 pt-16 pb-6">
        <div className="flex justify-center">
        <img src="/shieldlogo.png" alt="Street Smart logo" />        <h1 className="mt-8 text-4xl font-bold tracking-tight">Street Smart</h1>
        </div>

        <h1 className="mt-6 text-center text-2xl font-bold">
          Welcome Back
        </h1>

        <p className="mt-1 text-center text-sm text-muted-foreground">
          Login to your Street Smart account
        </p>

        <form className="mt-10 space-y-4" onSubmit={handleLogin}>
          <Field
            icon={Mail}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <Field
              icon={Lock}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary"
            >
              Forgot Password?
            </Link>
          </div>

          {error && (
            <p className="text-center text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-emergency transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-primary"
          >
            Sign up
          </Link>
        </p>
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
      <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

      <input
        {...props}
        className="w-full rounded-xl border border-transparent bg-secondary py-4 pl-12 pr-12 text-sm outline-none transition-colors focus:border-primary focus:bg-background"
      />
    </div>
  );
}