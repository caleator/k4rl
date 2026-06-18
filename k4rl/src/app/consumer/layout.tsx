import { ConsumerAuthProvider } from "@/context/consumer-auth";

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsumerAuthProvider>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </ConsumerAuthProvider>
  );
}
