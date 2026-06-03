import { Shield } from "lucide-react";

export function ShieldLogo({ size = 72 }: { size?: number }) {
  return (
    <div
      className="rounded-2xl bg-primary flex items-center justify-center shadow-emergency overflow-hidden"
      style={{
        width: size,
        height: size,
        boxShadow: "var(--shadow-emergency)",
      }}
    >
      <img
        src="/shield_logo.png"
        alt="Shield Logo"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          objectFit: "contain",
        }}
      />
    </div>
  );
}
