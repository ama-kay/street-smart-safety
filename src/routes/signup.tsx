import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signupUser } from "@/services/authServices";
import { MobileShell } from "@/components/MobileShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { User, Phone, Mail, Lock } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: Signup,
});

// Account creation
function Signup() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherNames, setOtherNames] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const result = await signupUser({
      email,
      password,
      firstName,
      lastName,
      otherNames,
      phone,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Contact setup comes before device/shortcut setup.
    navigate({
      to: "/add-first-contact",
    });
  };

  return (
    <MobileShell>
      <ScreenHeader title="Create Account" back="/login" />

      <div className="flex-1 px-6 pt-6 pb-6">
        <p className="text-muted-foreground text-sm">
          Set up your profile to start protecting yourself.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSignup}>
          <Field
            icon={User}
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <Field
            icon={User}
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <Field
            icon={User}
            placeholder="Other Name(s)"
            value={otherNames}
            onChange={(e) => setOtherNames(e.target.value)}
          />

          <Field
            icon={Phone}
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Field
            icon={Mail}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Field
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Field
            icon={Lock}
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-primary text-primary-foreground font-semibold rounded-2xl py-4 shadow-emergency active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {error && <p className="text-sm text-red-500 text-center mt-3">{error}</p>}

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold">
            Login
          </Link>
        </p>
      </div>
    </MobileShell>
  );
}

function Field({
  icon: Icon,
  ...props
}: {
  icon: typeof User;
} & React.InputHTMLAttributes<HTMLInputElement>) {
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
