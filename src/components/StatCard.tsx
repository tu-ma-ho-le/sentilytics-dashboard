import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  accent?: "primary" | "positive" | "neutral" | "negative";
}

export function StatCard({ label, value, hint, icon: Icon, accent = "primary" }: StatCardProps) {
  const accentClass = {
    primary: "from-primary/30 to-accent/20",
    positive: "from-[var(--positive)]/30 to-[var(--positive)]/5",
    neutral: "from-[var(--neutral)]/30 to-[var(--neutral)]/5",
    negative: "from-[var(--negative)]/30 to-[var(--negative)]/5",
  }[accent];

  return (
    <div className={cn("glass-card rounded-2xl p-5 relative overflow-hidden group transition-transform hover:-translate-y-0.5")}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", accentClass)} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {Icon && (
          <div className="h-10 w-10 rounded-xl bg-background/60 backdrop-blur grid place-items-center border">
            <Icon className="h-5 w-5 text-foreground/80" />
          </div>
        )}
      </div>
    </div>
  );
}
