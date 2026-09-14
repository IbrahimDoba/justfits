import { CatalogueBrowser } from "@/components/shop/CatalogueBrowser";

export const metadata = {
  title: "Shop",
  description:
    "Browse JUSTFITS premium car-themed caps and apparel. Order on WhatsApp.",
};

// The shop is sourced live from inventory (single source of truth).
export default function ShopPage() {
  return <CatalogueBrowser />;
}
