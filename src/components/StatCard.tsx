import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  tone?: "navy" | "gold" | "success" | "info";
  delay?: number;
}

const toneStyles: Record<string, string> = {
  navy: "bg-primary/10 text-primary",
  gold: "bg-gold/15 text-gold",
  success: "bg-success/12 text-success",
  info: "bg-info/12 text-info",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "navy",
  delay = 0,
}: StatCardProps) {
  return (
    <Card
      className="card-hover animate-fade-up rounded-2xl border-border/70 p-5 shadow-soft"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-foreground">{value}</p>
          {trend && <p className="mt-1 text-xs font-medium text-success">{trend}</p>}
        </div>
        <span
          className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl", toneStyles[tone])}
        >
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </Card>
  );
}
