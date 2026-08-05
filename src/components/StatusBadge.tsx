import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tone = "success" | "gold" | "info" | "destructive" | "muted";

const toneClasses: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/20",
  gold: "bg-gold/15 text-gold border-gold/30",
  info: "bg-info/12 text-info border-info/20",
  destructive: "bg-destructive/12 text-destructive border-destructive/20",
  muted: "bg-muted text-muted-foreground border-border",
};

const statusTone: Record<string, Tone> = {
  Selesai: "success",
  Closed: "success",
  Sesuai: "success",
  Aktif: "success",
  Berjalan: "gold",
  "In Progress": "gold",
  "Perlu Perbaikan": "gold",
  Terjadwal: "info",
  Open: "info",
  Draft: "muted",
  Nonaktif: "muted",
  "Tidak Sesuai": "destructive",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = statusTone[status] ?? "muted";
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full font-medium px-2.5 py-0.5", toneClasses[tone], className)}
    >
      {status}
    </Badge>
  );
}
