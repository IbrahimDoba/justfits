import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Upsert a test user
  const user = await prisma.user.upsert({
    where: { email: "testcustomer@justfits.com" },
    update: {},
    create: {
      email: "testcustomer@justfits.com",
      name: "Test Customer",
    },
  });

  // 2. Get any active product + variant
  const product = await prisma.product.findFirst({
    where: { isActive: true },
    include: {
      variants: { where: { isAvailable: true }, take: 1 },
    },
  });

  if (!product || product.variants.length === 0) {
    console.error("No active products/variants found. Add a product first.");
    return;
  }

  const variant = product.variants[0];

  // 3. Create a shipping address
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      firstName: "Test",
      lastName: "Customer",
      phone: "+2348000000000",
      street: "12 Lagos Island",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      postalCode: "100001",
    },
  });

  // 4. Create the order
  const order = await prisma.order.create({
    data: {
      orderNumber: "JF-TEST-001",
      userId: user.id,
      addressId: address.id,
      status: "PROCESSING",
      subtotal: Number(variant.price),
      shippingCost: 2500,
      tax: 0,
      total: Number(variant.price) + 2500,
      items: {
        create: {
          variantId: variant.id,
          quantity: 1,
          price: variant.price,
        },
      },
      payment: {
        create: {
          amount: Number(variant.price) + 2500,
          currency: "NGN",
          status: "COMPLETED",
          method: "PAYSTACK",
          transactionId: "test_txn_001",
          paidAt: new Date(),
        },
      },
    },
  });

  console.log("✅ Test order created:");
  console.log(`   Order Number : ${order.orderNumber}`);
  console.log(`   Email        : testcustomer@justfits.com`);
  console.log(`   Product      : ${product.name} (${variant.size})`);
  console.log(`   Total        : ₦${order.total}`);
  console.log("\nTest your endpoint:");
  console.log(
    `   http://localhost:3001/api/orders/lookup?orderNumber=JF-TEST-001&email=testcustomer@justfits.com`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
