import { notFound } from "next/navigation";
import { FACTORY_LINKS } from "@/lib/mock/factories";
import { FACTORIES } from "@/lib/mock/factories";
import { BRANDS } from "@/lib/mock/brands";
import { PRODUCTS, BATCHES, QR_ITEMS } from "@/lib/mock/products";
import { CertificateUploadPage } from "@/components/factory/certificate-upload-page";
import { LabelDownloadPage } from "@/components/factory/label-download-page";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function FactoryTokenPage({ params }: PageProps) {
  const { token } = await params;

  const link = FACTORY_LINKS.find((l) => l.token === token);
  if (!link) notFound();

  const factory = FACTORIES.find((f) => f.id === link.factoryId);
  if (!factory) notFound();

  const brand = BRANDS.find((b) => b.id === factory.brandId);
  if (!brand) notFound();

  if (link.type === "certificate-upload") {
    return (
      <CertificateUploadPage
        brandName={brand.name}
        factoryName={factory.name}
        contextSentence={`${brand.name} has requested your compliance certificates. Upload them below to continue.`}
      />
    );
  }

  if (link.type === "label-download") {
    const batch = link.batchId ? BATCHES.find((b) => b.id === link.batchId) : null;
    if (!batch) notFound();

    const product = PRODUCTS.find((p) => p.id === batch.productId);
    if (!product) notFound();

    // Build demo items: real mock QR items + generated filler up to 20 shown
    const realItems = QR_ITEMS.filter(
      (i) => i.batchId === batch.id && i.state === "locked"
    );
    const realCodes = new Set(realItems.map((i) => i.qrCode));
    const code = product.sku.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 6);

    // Deterministic claim code generator for filler items (format: ABC-DEF)
    const CLAIM_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    function genClaimCode(seed: number): string {
      let n = seed * 31337;
      const chunk = (len: number) => {
        let s = "";
        for (let i = 0; i < len; i++) { s += CLAIM_CHARS[n % CLAIM_CHARS.length]; n = Math.floor(n / CLAIM_CHARS.length) + 17; }
        return s;
      };
      return `${chunk(3)}-${chunk(3)}`;
    }

    const generated = Array.from({ length: 20 }, (_, n) => ({
      id: `gen-${batch.id}-${n}`,
      qrCode: `K4RL-${code}-${String(n + 1).padStart(6, "0")}`,
      claimCode: genClaimCode(n + 1),
    })).filter((i) => !realCodes.has(i.qrCode));

    const items = [
      ...realItems.map((i) => ({ id: i.id, qrCode: i.qrCode, claimCode: i.claimCode })),
      ...generated,
    ].slice(0, 20);

    return (
      <LabelDownloadPage
        brandName={brand.name}
        factoryName={factory.name}
        contextSentence={`${product.name} — batch ${batch.id} is ready for download.`}
        batch={{
          productName: product.name,
          batchId: batch.id,
          quantity: batch.quantity,
        }}
        items={items}
      />
    );
  }

  notFound();
}
