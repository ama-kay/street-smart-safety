import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";

export function ScreenHeader({
  title,
  back = "/home",
  right,
}: {
  title: string;
  back?: string;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-2">
      <Link
        to={back}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
        aria-label="Back"
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>
      <h1 className="text-base font-semibold flex-1 text-center pr-9">{title}</h1>
      {right}
    </header>
  );
}
