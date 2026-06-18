export default function FactoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#1e2433] px-4 py-2.5 text-center text-xs text-[#7a81a0]">
        <span>Demo — </span>
        <a href="/email-preview/certificate-upload" className="text-[#42ba68] hover:underline">
          Email 1: Certificate upload
        </a>
        <span className="mx-2.5 opacity-30">|</span>
        <a href="/email-preview/label-download" className="text-[#42ba68] hover:underline">
          Email 2: Label download
        </a>
      </div>
      {children}
    </div>
  );
}
