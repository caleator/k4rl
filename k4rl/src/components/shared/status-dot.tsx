import { cn } from "@/lib/utils";

type Status =
  | "draft"
  | "generated"
  | "locked"
  | "unlocked"
  | "claimed"
  | "transfer-requested"
  | "re-locked"
  | "production"
  | "active"
  | "trialling"
  | "past-due"
  | "cancelled"
  | "pending"
  | "generating"
  | "ready"
  | "dispatched"
  | "uploaded"
  | "expired";

const STATUS_CONFIG: Record<Status, { label: string; dot: string }> = {
  draft:               { label: "Draft",              dot: "bg-muted-foreground" },
  generated:           { label: "Generated",          dot: "bg-emerald-500" },
  locked:              { label: "Locked",             dot: "bg-slate-400" },
  unlocked:            { label: "Unlocked",           dot: "bg-amber-400" },
  claimed:             { label: "Claimed",            dot: "bg-emerald-500" },
  "transfer-requested":{ label: "Transfer requested", dot: "bg-blue-400" },
  "re-locked":         { label: "Re-locked",          dot: "bg-slate-400" },
  production:          { label: "Production",         dot: "bg-violet-400" },
  active:              { label: "Active",             dot: "bg-emerald-500" },
  trialling:           { label: "Trial",              dot: "bg-amber-400" },
  "past-due":          { label: "Past due",           dot: "bg-red-500" },
  cancelled:           { label: "Cancelled",          dot: "bg-muted-foreground" },
  generating:          { label: "Generating",         dot: "bg-amber-400" },
  pending:             { label: "Pending",            dot: "bg-amber-400" },
  ready:               { label: "Awaiting dispatch",   dot: "bg-amber-400" },
  dispatched:          { label: "Dispatched",         dot: "bg-blue-400" },
  uploaded:            { label: "Uploaded",           dot: "bg-emerald-500" },
  expired:             { label: "Expired",            dot: "bg-red-500" },
};

interface StatusDotProps {
  status: Status;
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dot)} />
      <span className="text-sm text-foreground">{config.label}</span>
    </span>
  );
}
