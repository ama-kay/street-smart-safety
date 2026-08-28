/* eslint-disable prettier/prettier */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginUser } from "@/services/authServices";
import { MobileShell } from "@/components/MobileShell";
import { ShieldLogo } from "@/components/ShieldLogo";
import { Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

// Login screen
function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          <ShieldLogo size={72} />
        </div>
        <h1 className="text-2xl font-bold text-center mt-6">Welcome Back</h1>
        <p className="text-center text-muted-foreground text-sm mt-1">
          Login to your Street Smart account
        </p>

          <form className="mt-10 space-y-4" onSubmit={handleLogin}>          
          <Field icon={Mail} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
          <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
          <div className="text-right">
            <a href="./forgot-password" className="text-sm text-primary font-medium">
              Forgot password?
            </a>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-4 shadow-emergency active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-semibold">
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
      <Icon className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
      <input
        {...props}
        className="w-full bg-secondary border border-transparent focus:border-primary focus:bg-background rounded-xl pl-12 pr-4 py-4 text-sm outline-none transition-colors"
      />
    </div>
  );
}
