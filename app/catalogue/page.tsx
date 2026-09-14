import { redirect } from "next/navigation";

// The catalogue now lives at /shop (single, inventory-driven storefront).
export default function CataloguePage() {
  redirect("/shop");
}
