import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { syncInventoryFromProducts } from "../lib/inventory/sync";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const { created, totalProducts } = await syncInventoryFromProducts(prisma);
  const total = await prisma.inventoryItem.count();
  console.log(
    `Products: ${totalProducts} | inventory items created this run: ${created} | total inventory items: ${total}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
