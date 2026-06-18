import { notFound } from "next/navigation";
import { FACTORY_LINKS, FACTORIES } from "@/lib/mock/factories";
import { BRANDS } from "@/lib/mock/brands";
import { PRODUCTS, BATCHES, QR_ITEMS, type QrItem } from "@/lib/mock/products";
import { UnusedLabelsPage } from "@/components/factory/unused-labels-page";

interface PageProps {
  params: Promise<{ token: string }>;
}

// Generate realistic demo items beyond what's in the small mock set
function buildDemoItems(batchId: string, productCode: string, quantity: number) {
  const STATES: QrItem["state"][] = ["locked", "locked", "locked", "locked", "unlocked", "claimed"];
  const seeded: QrItem[] = Array.from({ length: quantity }, (_, i) => {
    const n = String(i + 1).padStart(6, "0");
    const state = STATES[i % STATES.length];
    return {
      id: `gen-${batchId}-${n}`,
      productId: "",
      batchId,
      qrCode: `K4RL-${productCode}-${n}`,
      claimCode: "",
      state,
    };
  });
  return seeded;
}

export default async function FactoryReportPage({ params }: PageProps) {
  const { token } = await params;

  const link = FACTORY_LINKS.find((l) => l.token === token && l.type === "label-download");
  if (!link || !link.batchId) notFound();

  const factory = FACTORIES.find((f) => f.id === link.factoryId);
  if (!factory) notFound();

  const brand = BRANDS.find((b) => b.id === factory.brandId);
  if (!brand) notFound();

  const batch = BATCHES.find((b) => b.id === link.batchId);
  if (!batch) notFound();

  const product = PRODUCTS.find((p) => p.id === batch.productId);
  if (!product) notFound();

  // Merge real mock items with generated demo items, deduplicated by qrCode
  const realItems = QR_ITEMS.filter((i) => i.batchId === batch.id);
  const realCodes = new Set(realItems.map((i) => i.qrCode));
  const productCode = product.sku.split("-").slice(0, 2).join("").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const generated = buildDemoItems(batch.id, productCode, Math.min(batch.quantity, 20)).filter(
    (i) => !realCodes.has(i.qrCode)
  );

  const items = [...realItems, ...generated].slice(0, 20).map((i) => ({
    id: i.id,
    qrCode: i.qrCode,
    state: i.state as "locked" | "unlocked" | "claimed" | "transfer-requested",
  }));

  return (
    <UnusedLabelsPage
      brandName={brand.name}
      factoryName={factory.name}
      contextSentence={`${product.name} — batch ${batch.id}. Select any labels that were not used.`}
      productName={product.name}
      batchId={batch.id}
      totalQuantity={batch.quantity}
      items={items}
    />
  );
}
