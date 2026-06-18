import Link from "next/link";

export default function EmailLabelDownloadPreview() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#f4f5f9", minHeight: "100vh" }}>
      {/* Demo nav */}
      <div style={{ backgroundColor: "#1e2433", padding: "10px 16px", textAlign: "center", fontSize: 12, color: "#7a81a0" }}>
        <Link href="/email-preview/certificate-upload" style={{ color: "#42ba68", textDecoration: "none" }}>
          ← Email 1: Certificate upload
        </Link>
        <span style={{ margin: "0 10px", opacity: 0.3 }}>|</span>
        <strong style={{ color: "#e2e4ee" }}>Email 2: Label download</strong>
      </div>

      {/* Email card */}
      <div style={{ padding: "40px 16px" }}>
        <div style={{
          maxWidth: 560, margin: "0 auto", backgroundColor: "#fff",
          borderRadius: 12, border: "1px solid #e2e4ee", overflow: "hidden",
        }}>
          {/* Accent bar */}
          <div style={{ backgroundColor: "#42ba68", height: 4 }} />

          {/* Header */}
          <div style={{ padding: "28px 40px 20px", borderBottom: "1px solid #e2e4ee" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, backgroundColor: "#f0f5f2", borderRadius: 8,
                border: "1px solid #e2e4ee", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#42ba68" }}>MN</span>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#364563" }}>Maison Lyle</p>
                <p style={{ margin: 0, fontSize: 11, color: "#7a81a0" }}>via K4RL</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "36px 40px" }}>
            <h1 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 600, color: "#364563", letterSpacing: "-0.01em" }}>
              Your labels are ready
            </h1>
            <p style={{ margin: "0 0 28px", fontSize: 15, color: "#7a81a0", lineHeight: 1.6 }}>
              A new batch of QR labels is ready for{" "}
              <strong style={{ color: "#364563", fontWeight: 500 }}>Noir Oversized Tee</strong>.
              Please download and print them using the link below.
            </p>

            {/* Batch details */}
            <div style={{ backgroundColor: "#f9fafb", borderRadius: 8, border: "1px solid #e2e4ee", marginBottom: 28 }}>
              {[
                { label: "Product", value: "Noir Oversized Tee", mono: false },
                { label: "Batch", value: "batch-001", mono: true },
                { label: "Items", value: "500 labels — each includes a QR code and a paired claim code", mono: false },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  padding: "14px 20px",
                  borderBottom: i < arr.length - 1 ? "1px solid #e2e4ee" : "none",
                  display: "flex", gap: 16, alignItems: "baseline",
                }}>
                  <span style={{ fontSize: 11, color: "#7a81a0", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 64 }}>
                    {row.label}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: row.mono ? 400 : 500, color: row.mono ? "#7a81a0" : "#364563", fontFamily: row.mono ? "monospace" : "inherit" }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Primary CTA */}
            <Link href="/factory/tok-lbl-def456" style={{
              display: "inline-block", padding: "13px 28px", backgroundColor: "#42ba68",
              color: "#fff", textDecoration: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 600, letterSpacing: "0.01em", marginBottom: 12,
            }}>
              Download labels
            </Link>

            <hr style={{ margin: "28px 0", border: "none", borderTop: "1px solid #e2e4ee" }} />

            {/* Note */}
            <div style={{ backgroundColor: "#f0f5f2", borderRadius: 8, borderLeft: "3px solid #42ba68", padding: "14px 16px", marginBottom: 28 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#364563", lineHeight: 1.6 }}>
                Each label contains a visible QR code and a hidden claim code.{" "}
                <strong style={{ fontWeight: 500 }}>The claim code must not be visible before purchase</strong>{" "}
                — print it on the back or inside a fold of the tag.
              </p>
            </div>

            {/* Secondary CTA */}
            <Link href="/factory/tok-lbl-def456#report-unused" style={{
              display: "inline-block", padding: "11px 24px",
              border: "1px solid #e2e4ee", backgroundColor: "#fff",
              color: "#364563", textDecoration: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 500,
            }}>
              Report unused labels
            </Link>
          </div>

          {/* Footer */}
          <div style={{ padding: "20px 40px", backgroundColor: "#f9fafb", borderTop: "1px solid #e2e4ee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#42ba68", letterSpacing: "-0.02em" }}>K4RL</span>
            <span style={{ fontSize: 11, color: "#b0b4c8" }}>Powered by K4RL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
