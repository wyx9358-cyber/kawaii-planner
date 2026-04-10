import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatPill({
  icon: Icon,
  label,
  value,
  softClass,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  softClass: string;
}) {
  return (
    <div className={cn("rounded-2xl px-3 py-3", softClass)}>
      <div className="flex items-center gap-2 text-xs font-medium opacity-80">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
