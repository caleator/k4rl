import { cn } from "@/lib/utils";

interface MonoIdProps {
  value: string;
  className?: string;
}

export function MonoId({ value, className }: MonoIdProps) {
  return (
    <span
      className={cn(
        "font-mono text-xs tracking-tight text-muted-foreground",
        className
      )}
    >
      {value}
    </span>
  );
}
