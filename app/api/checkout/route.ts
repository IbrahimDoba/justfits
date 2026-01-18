import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db/prisma";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
} from "@/lib/services/email";

interface CartItem {
  productSlug: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
}

interface ProductVariant {
  id: string;
  size: string | null;
}

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `JF-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to place an order" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      email,
      phone,
      firstName,
      lastName,
      address,
      city,
      state,
      postalCode,
      items,
      subtotal,
      shippingCost,
      total,
      rewardCode,
      discount,
      paymentMethod,
      transactionRef,
    } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !address || !city || !state) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Create or find shipping address
    const shippingAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        firstName,
        lastName,
        phone: phone || "",
        street: address,
        city,
        state,
        postalCode: postalCode || "",
        country: "Nigeria",
      },
    });

    // Find or create variants for each cart item
    const orderItems = [];
    for (const item of items as CartItem[]) {
      // Try to find the variant by product slug and size
      const product = await prisma.product.findUnique({
        where: { slug: item.productSlug },
        include: { variants: true },
      });

      let variantId: string;

      if (product) {
        // Find variant by size
        const variant = product.variants.find(
          (v: ProductVariant) => v.size === item.size
        );
        if (variant) {
          variantId = variant.id;
        } else if (product.variants.length > 0) {
          // Use first variant if size doesn't match
          variantId = product.variants[0].id;
        } else {
          // Create a default variant if none exists
          const newVariant = await prisma.productVariant.create({
            data: {
              productId: product.id,
              sku: `${product.slug}-${item.size || "default"}`
                .toUpperCase()
                .replace(/-/g, "_"),
              name: `${product.name} - ${item.size || "Default"}`,
              color: "Default",
              size: item.size || "One Size",
              price: item.price,
              stockQuantity: 100,
              isAvailable: true,
            },
          });
          variantId = newVariant.id;
        }
      } else {
        // Product not found in DB - create product and variant
        const category = await prisma.category.findFirst();
        if (!category) {
          return NextResponse.json(
            { error: "No categories found. Please contact support." },
            { status: 500 }
          );
        }

        const newProduct = await prisma.product.create({
          data: {
            name: item.productName,
            slug: item.productSlug,
            description: item.productName,
            basePrice: item.price,
            categoryId: category.id,
            featured: false,
          },
        });

        const newVariant = await prisma.productVariant.create({
          data: {
            productId: newProduct.id,
            sku: `${item.productSlug}-${item.size || "default"}`
              .toUpperCase()
              .replace(/-/g, "_"),
            name: `${item.productName} - ${item.size || "Default"}`,
            color: "Default",
            size: item.size || "One Size",
            price: item.price,
            stockQuantity: 100,
            isAvailable: true,
          },
        });
        variantId = newVariant.id;
      }

      orderItems.push({
        variantId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    // If reward code provided, verify and mark as redeemed
    if (rewardCode) {
      const reward = await prisma.loyaltyReward.findUnique({
        where: { code: rewardCode.toUpperCase() },
      });

      if (
        reward &&
        reward.userId === session.user.id &&
        !reward.isRedeemed &&
        new Date(reward.expiresAt) > new Date()
      ) {
        await prisma.loyaltyReward.update({
          where: { id: reward.id },
          data: {
            isRedeemed: true,
            redeemedAt: new Date(),
          },
        });
      }
    }

    // Create order with items and payment
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        addressId: shippingAddress.id,
        status: "PENDING",
        subtotal: subtotal,
        shippingCost: shippingCost,
        tax: 0,
        total: total,
        notes: rewardCode
          ? `Reward code applied: ${rewardCode} (-${discount || 0}%)`
          : null,
        items: {
          create: orderItems,
        },
        payment: {
          create: {
            amount: total,
            currency: "NGN",
            status: "PENDING",
            method: paymentMethod || "BANK_TRANSFER",
            receiptUrl: body.receiptUrl || null,
            transactionId: transactionRef || null,
          },
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        shippingAddress: true,
        payment: true,
      },
    });

    // Send order confirmation email (don't await to not block response)
    sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerName: `${firstName} ${lastName}`,
      customerEmail: email,
      items: (items as CartItem[]).map((item) => ({
        name: item.productName,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal,
      shippingCost,
      discount: discount || undefined,
      total,
      shippingAddress: {
        street: address,
        city,
        state,
        postalCode,
      },
    }).catch((err) => console.error("Failed to send confirmation email:", err));

    // Send admin notification email (don't await to not block response)
    sendAdminOrderNotification({
      orderNumber: order.orderNumber,
      customerName: `${firstName} ${lastName}`,
      customerEmail: email,
      customerPhone: phone,
      items: (items as CartItem[]).map((item) => ({
        name: item.productName,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal,
      shippingCost,
      discount: discount || undefined,
      total,
      shippingAddress: {
        street: address,
        city,
        state,
        postalCode,
      },
    }).catch((err) => console.error("Failed to send admin notification:", err));

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}
