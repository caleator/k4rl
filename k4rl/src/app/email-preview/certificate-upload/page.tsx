import Link from "next/link";

export default function EmailCertificateUploadPreview() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: "#f4f5f9", minHeight: "100vh" }}>
      {/* Demo nav */}
      <div style={{ backgroundColor: "#1e2433", padding: "10px 16px", textAlign: "center", fontSize: 12, color: "#7a81a0" }}>
        <span>Demo — </span>
        <strong style={{ color: "#e2e4ee" }}>Email 1: Certificate upload</strong>
        <span style={{ margin: "0 10px", opacity: 0.3 }}>|</span>
        <Link href="/email-preview/label-download" style={{ color: "#42ba68", textDecoration: "none" }}>
          Email 2: Label download →
        </Link>
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
              Action required — upload your certificates
            </h1>
            <p style={{ margin: "0 0 28px", fontSize: 15, color: "#7a81a0", lineHeight: 1.6 }}>
              You have been added as a manufacturing partner by{" "}
              <strong style={{ color: "#364563", fontWeight: 500 }}>Maison Lyle</strong>.
              Please upload your compliance certificates using the link below.
            </p>

            <Link href="/factory/tok-cert-ghi789" style={{
              display: "inline-block", padding: "13px 28px", backgroundColor: "#42ba68",
              color: "#fff", textDecoration: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 600, letterSpacing: "0.01em",
            }}>
              Upload certificates
            </Link>

            <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #e2e4ee" }} />

            <p style={{ margin: 0, fontSize: 13, color: "#7a81a0", lineHeight: 1.6 }}>
              This link is secure and does not require a login. It will remain active until your certificates are uploaded.
            </p>
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
