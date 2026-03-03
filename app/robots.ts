import { MetadataRoute } from "next";
import { siteConfig } from "@/config/siteConfig";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        // All crawlers — full access to public content
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/shop/",
          "/products/",
          "/about",
          "/contact",
          "/shipping",
          "/returns",
          "/privacy",
          "/terms",
          "/blog",
          "/blog/",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/auth/",
          "/cart",
          "/checkout",
          "/checkout/",
          "/orders",
          "/orders/",
          "/profile",
          "/wishlist",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
