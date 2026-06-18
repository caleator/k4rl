import { Building2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface FactoryContextHeaderProps {
  brandName: string;
  factoryName: string;
  contextSentence: string;
}

export function FactoryContextHeader({
  brandName,
  factoryName,
  contextSentence,
}: FactoryContextHeaderProps) {
  return (
    <div className="border-b bg-card">
      <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6">
        <div className="flex items-start gap-4">
          {/* Brand logo placeholder */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
            <Building2 className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-sm font-semibold text-foreground">{brandName}</span>
              <Separator orientation="vertical" className="h-3.5" />
              <span className="text-sm text-muted-foreground">{factoryName}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{contextSentence}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
