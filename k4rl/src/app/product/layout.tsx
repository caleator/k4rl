import Link from "next/link";

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="mx-auto max-w-lg px-4 h-12 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[10px] tracking-tight">K4</span>
            </div>
            <span className="font-semibold text-sm text-foreground">K4RL</span>
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
