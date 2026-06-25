import { Shield } from "lucide-react";

export function ShieldLogo({ size = 72 }: { size?: number }) {
  return (
    <div
      className="rounded-2xl bg-primary flex items-center justify-center shadow-emergency"
      style={{ width: size, height: size, boxShadow: "var(--shadow-emergency)" }}
    >
      <Shield className="text-primary-foreground" style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={2.5} />
    </div>
  );
}
