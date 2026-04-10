import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function CuteCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/60 shadow-soft backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
