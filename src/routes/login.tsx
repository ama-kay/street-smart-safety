import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ShieldLogo } from "@/components/ShieldLogo";
import { Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

// Login screen
function Login() {
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

        <form className="mt-10 space-y-4" onSubmit={(e) => e.preventDefault()}>
          <Field icon={Mail} type="email" placeholder="Email or phone" />
          <Field icon={Lock} type="password" placeholder="Password" />
          <div className="text-right">
            <a href="./forgot-password" className="text-sm text-primary font-medium">
              Forgot password?
            </a>
          </div>
          <Link
            to="/setup"
            className="block w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-4 text-center shadow-emergency active:scale-[0.98] transition-transform"
          >
            Login
          </Link>
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
