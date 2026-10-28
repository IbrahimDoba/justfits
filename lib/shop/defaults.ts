// Client-safe shop defaults, shared by the server-rendered /shop page and its
// client filters (lib/shop/list.ts pulls in Prisma, so keep these separate).
export const SHOP_DEFAULT_SORT = "price-high";
export const SHOP_PAGE_LIMIT = 50;
