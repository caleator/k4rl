import { cn } from "@/lib/utils";

type Grade = "A" | "B" | "C" | "D" | "E";

const GRADE_STYLES: Record<Grade, string> = {
  A: "bg-emerald-100 text-emerald-800 border-emerald-200",
  B: "bg-green-100 text-green-800 border-green-200",
  C: "bg-amber-100 text-amber-800 border-amber-200",
  D: "bg-orange-100 text-orange-800 border-orange-200",
  E: "bg-red-100 text-red-800 border-red-200",
};

interface EcoScoreBadgeProps {
  score: number;
  grade: Grade;
  showScore?: boolean;
  className?: string;
}

export function EcoScoreBadge({
  score,
  grade,
  showScore = true,
  className,
}: EcoScoreBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold",
        GRADE_STYLES[grade],
        className
      )}
    >
      <span>{grade}</span>
      {showScore && <span className="font-normal opacity-70">{score}</span>}
    </span>
  );
}
