/* eslint-disable prettier/prettier */

import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";

export function ScreenHeader({
  title,
  back = "/home",
  onBack,
  right,
}: {
  title: string;
  back?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate({ to: back });
  };

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-2">
      <button
        type="button"
        onClick={handleBackClick}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
        aria-label="Back"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <h1 className="text-base font-semibold flex-1 text-center pr-9">
        {title}
      </h1>

      {right}
    </header>
  );
}