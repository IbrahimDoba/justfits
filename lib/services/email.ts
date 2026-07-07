import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "JustFits <noreply@justfits.com>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@justfits.com";

interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount?: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode?: string;
  };
  trackingUrl?: string;
  rewardCode?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
}

function generateOrderConfirmationHtml(data: OrderEmailData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br>
          <span style="color: #666; font-size: 14px;">Size: ${item.size}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - JustFits</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #000;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 700;">JUSTFITS</h1>
      </div>

      <div style="padding: 30px 0;">
        <h2 style="color: #000; margin-bottom: 10px;">Order Confirmed!</h2>
        <p style="color: #666; margin-top: 0;">Thank you for your order, ${data.customerName}!</p>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 5px 0;"><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p style="margin: 0; color: #666; font-size: 14px;">Please save this for your records</p>
        </div>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 5px 0;">Subtotal</td>
              <td style="text-align: right;">${formatCurrency(data.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0;">Shipping</td>
              <td style="text-align: right;">${data.shippingCost === 0 ? "Free" : formatCurrency(data.shippingCost)}</td>
            </tr>
            ${
              data.discount
                ? `
            <tr style="color: #22c55e;">
              <td style="padding: 5px 0;">Discount</td>
              <td style="text-align: right;">-${data.discount}%</td>
            </tr>
            `
                : ""
            }
            <tr style="font-weight: bold; font-size: 18px;">
              <td style="padding: 15px 0 5px;">Total</td>
              <td style="text-align: right; padding: 15px 0 5px;">${formatCurrency(data.total)}</td>
            </tr>
          </table>
        </div>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Shipping Address</h3>
        <p style="margin: 0; color: #666;">
          ${data.shippingAddress.street}<br>
          ${data.shippingAddress.city}, ${data.shippingAddress.state}${data.shippingAddress.postalCode ? ` ${data.shippingAddress.postalCode}` : ""}<br>
          Nigeria
        </p>

        <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 10px 0; font-weight: 600;">What's Next?</p>
          <p style="margin: 0; color: #666; font-size: 14px;">
            We're preparing your order for shipment. You'll receive another email when your order ships.
          </p>
        </div>

        ${data.trackingUrl ? `
        <div style="margin-top: 20px; text-align: center;">
          <a href="${data.trackingUrl}" style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Track Your Order
          </a>
        </div>
        ` : ""}

        ${data.rewardCode ? `
        <div style="margin-top: 20px; padding: 20px; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-weight: 700; font-size: 15px;">You've earned a reward!</p>
          <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">Sign up at justfits.shop to claim 15% off your next order.</p>
          <p style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 2px; color: #000;">${data.rewardCode}</p>
          <p style="margin: 8px 0 0 0; color: #999; font-size: 12px;">Code expires in 30 days</p>
        </div>
        ` : ""}
      </div>

      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
        <p>Questions? Contact us at support@justfits.com</p>
        <p>&copy; ${new Date().getFullYear()} JustFits. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

function generateOrderConfirmationText(data: OrderEmailData): string {
  const itemsList = data.items
    .map((item) => `- ${item.name} (Size: ${item.size}) x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`)
    .join("\n");

  return `
JUSTFITS - Order Confirmation

Thank you for your order, ${data.customerName}!

Order Number: ${data.orderNumber}

ORDER SUMMARY
${itemsList}

Subtotal: ${formatCurrency(data.subtotal)}
Shipping: ${data.shippingCost === 0 ? "Free" : formatCurrency(data.shippingCost)}
${data.discount ? `Discount: -${data.discount}%\n` : ""}Total: ${formatCurrency(data.total)}

SHIPPING ADDRESS
${data.shippingAddress.street}
${data.shippingAddress.city}, ${data.shippingAddress.state}${data.shippingAddress.postalCode ? ` ${data.shippingAddress.postalCode}` : ""}
Nigeria

We're preparing your order for shipment. You'll receive another email when your order ships.
${data.trackingUrl ? `\nTrack your order: ${data.trackingUrl}\n` : ""}${data.rewardCode ? `\nYou've earned a reward! Sign up at justfits.shop and use code ${data.rewardCode} for 15% off your next order. Expires in 30 days.\n` : ""}
Questions? Contact us at support@justfits.com

© ${new Date().getFullYear()} JustFits. All rights reserved.
  `.trim();
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Confirmed - ${data.orderNumber}`,
      html: generateOrderConfirmationHtml(data),
      text: generateOrderConfirmationText(data),
    });

    if (error) {
      console.error("Failed to send order confirmation email:", error);
      return { success: false, error };
    }

    console.log("Order confirmation email sent:", result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return { success: false, error };
  }
}

interface OrderStatusEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

function getStatusMessage(status: string): { title: string; description: string; color: string } {
  switch (status) {
    case "PROCESSING":
      return {
        title: "Your Order is Being Processed",
        description: "We're preparing your order for shipment.",
        color: "#3b82f6",
      };
    case "SHIPPED":
      return {
        title: "Your Order Has Shipped!",
        description: "Your order is on its way to you.",
        color: "#8b5cf6",
      };
    case "DELIVERED":
      return {
        title: "Your Order Has Been Delivered",
        description: "We hope you love your new items!",
        color: "#22c55e",
      };
    case "CANCELLED":
      return {
        title: "Your Order Has Been Cancelled",
        description: "Your order has been cancelled. If you have any questions, please contact support.",
        color: "#ef4444",
      };
    default:
      return {
        title: "Order Status Update",
        description: `Your order status has been updated to: ${status}`,
        color: "#6b7280",
      };
  }
}

function generateOrderStatusHtml(data: OrderStatusEmailData): string {
  const statusInfo = getStatusMessage(data.status);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Update - JustFits</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #000;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 700;">JUSTFITS</h1>
      </div>

      <div style="padding: 30px 0;">
        <div style="text-align: center; padding: 30px; background: ${statusInfo.color}15; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="color: ${statusInfo.color}; margin: 0 0 10px 0;">${statusInfo.title}</h2>
          <p style="color: #666; margin: 0;">${statusInfo.description}</p>
        </div>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 5px 0;"><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p style="margin: 0;"><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: 600;">${data.status}</span></p>
        </div>

        ${
          data.trackingNumber
            ? `
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
          ${
            data.trackingUrl
              ? `<a href="${data.trackingUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Track Your Order</a>`
              : ""
          }
        </div>
        `
            : ""
        }
      </div>

      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
        <p>Questions? Contact us at support@justfits.com</p>
        <p>&copy; ${new Date().getFullYear()} JustFits. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

export async function sendOrderStatusEmail(data: OrderStatusEmailData) {
  try {
    const statusInfo = getStatusMessage(data.status);

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `${statusInfo.title} - ${data.orderNumber}`,
      html: generateOrderStatusHtml(data),
    });

    if (error) {
      console.error("Failed to send order status email:", error);
      return { success: false, error };
    }

    console.log("Order status email sent:", result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Error sending order status email:", error);
    return { success: false, error };
  }
}

// Admin notification email
interface AdminOrderNotificationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount?: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode?: string;
  };
}

function generateAdminNotificationHtml(data: AdminOrderNotificationData): string {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.size}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.price)}</td>
        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order - JustFits Admin</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px;">
      <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🛒 NEW ORDER RECEIVED</h1>
      </div>

      <div style="padding: 20px; background: #f9f9f9;">
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 15px 0; color: #000; border-bottom: 2px solid #000; padding-bottom: 10px;">
            Order #${data.orderNumber}
          </h2>
          <p style="margin: 0; color: #666;">
            Received on ${new Date().toLocaleString("en-NG", { dateStyle: "full", timeStyle: "short" })}
          </p>
        </div>

        <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Customer Information</h3>
          <table style="width: 100%;">
            <tr>
              <td style="padding: 5px 0; color: #666; width: 120px;">Name:</td>
              <td style="padding: 5px 0; font-weight: 600;">${data.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #666;">Email:</td>
              <td style="padding: 5px 0;"><a href="mailto:${data.customerEmail}" style="color: #0066cc;">${data.customerEmail}</a></td>
            </tr>
            ${data.customerPhone ? `
            <tr>
              <td style="padding: 5px 0; color: #666;">Phone:</td>
              <td style="padding: 5px 0;"><a href="tel:${data.customerPhone}" style="color: #0066cc;">${data.customerPhone}</a></td>
            </tr>
            ` : ""}
          </table>
        </div>

        <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Delivery Address</h3>
          <p style="margin: 0; line-height: 1.8;">
            ${data.shippingAddress.street}<br>
            ${data.shippingAddress.city}, ${data.shippingAddress.state}${data.shippingAddress.postalCode ? ` ${data.shippingAddress.postalCode}` : ""}<br>
            Nigeria
          </p>
        </div>

        <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #333;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Item</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Size</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Qty</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Price</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #eee;">
            <table style="width: 100%; max-width: 300px; margin-left: auto;">
              <tr>
                <td style="padding: 5px 0;">Subtotal:</td>
                <td style="padding: 5px 0; text-align: right;">${formatCurrency(data.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;">Shipping:</td>
                <td style="padding: 5px 0; text-align: right;">${data.shippingCost === 0 ? "Free" : formatCurrency(data.shippingCost)}</td>
              </tr>
              ${data.discount ? `
              <tr style="color: #22c55e;">
                <td style="padding: 5px 0;">Discount:</td>
                <td style="padding: 5px 0; text-align: right;">-${data.discount}%</td>
              </tr>
              ` : ""}
              <tr style="font-weight: bold; font-size: 18px; border-top: 2px solid #000;">
                <td style="padding: 15px 0 5px;">TOTAL:</td>
                <td style="padding: 15px 0 5px; text-align: right;">${formatCurrency(data.total)}</td>
              </tr>
            </table>
          </div>
        </div>

        <div style="text-align: center; padding: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/orders/${data.orderNumber}"
             style="display: inline-block; background: #000; color: #fff; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Order in Admin Panel
          </a>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
        <p>This is an automated notification from JustFits</p>
      </div>
    </body>
    </html>
  `;
}

export async function sendAdminOrderNotification(data: AdminOrderNotificationData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🛒 New Order #${data.orderNumber} - ${formatCurrency(data.total)}`,
      html: generateAdminNotificationHtml(data),
    });

    if (error) {
      console.error("Failed to send admin notification email:", error);
      return { success: false, error };
    }

    console.log("Admin notification email sent:", result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Error sending admin notification email:", error);
    return { success: false, error };
  }
}

interface PasswordResetEmailData {
  email: string;
  name?: string | null;
  resetUrl: string;
}

function generatePasswordResetHtml(data: PasswordResetEmailData): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#000000;padding:28px;text-align:center;">
          <span style="color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:2px;">JUSTFITS</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:20px;color:#111827;">Reset your password</h1>
          <p style="margin:0 0 16px;font-size:14px;line-height:22px;color:#4b5563;">
            Hi ${data.name || "there"}, we received a request to reset your JUSTFITS password.
            Click the button below to choose a new one. This link expires in 1 hour.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
            <tr><td style="border-radius:12px;background:#000000;">
              <a href="${data.resetUrl}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:12px;">Reset Password</a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">Or paste this link into your browser:</p>
          <p style="margin:0 0 16px;font-size:12px;color:#2563eb;word-break:break-all;">${data.resetUrl}</p>
          <p style="margin:0;font-size:12px;line-height:20px;color:#9ca3af;">
            If you didn't request this, you can safely ignore this email — your password won't change.
          </p>
        </td></tr>
        <tr><td style="padding:20px;text-align:center;background:#f9fafb;">
          <span style="font-size:11px;color:#9ca3af;">&copy; JUSTFITS. Premium car-themed caps.</span>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData) {
  try {
    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: "Reset your JUSTFITS password",
      html: generatePasswordResetHtml(data),
      text: `Reset your JUSTFITS password using this link (expires in 1 hour): ${data.resetUrl}\n\nIf you didn't request this, ignore this email.`,
    });

    if (error) {
      console.error("Failed to send password reset email:", error);
      return { success: false, error };
    }

    console.log("Password reset email sent:", result?.id);
    return { success: true, id: result?.id };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, error };
  }
}
