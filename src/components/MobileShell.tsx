import { ReactNode } from "react";

// Mobile-styled outer frame so the design feels like a phone app
// regardless of browser viewport.
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-muted flex items-stretch justify-center">
      <div className="w-full max-w-[440px] min-h-screen bg-background relative shadow-2xl flex flex-col">
        {children}
      </div>
    </div>
  );
}
