"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";

interface SaleItem {
  id?: string;
  name: string;
  size: string | null;
  quantity: number;
  unitPrice: number;
}

interface Sale {
  id: string;
  date: string;
  customerName: string;
  productText: string;
  variantText: string | null;
  quantity: number;
  unitPrice: number;
  deliveryFee: number | null;
  location: string | null;
  totalCollected: number;
  paymentStatus: "PAID" | "PARTIAL" | "PENDING";
  notes: string | null;
  items: SaleItem[];
}

interface StoreSettings {
  storeName?: string | null;
  storeEmail?: string | null;
  storePhone?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
}

const naira = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const statusStyles: Record<string, string> = {
  PAID: "bg-green-100 text-green-800 border-green-200",
  PARTIAL: "bg-amber-100 text-amber-800 border-amber-200",
  PENDING: "bg-red-100 text-red-800 border-red-200",
};

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [settings, setSettings] = useState<StoreSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/finance/sales/${id}`).then((r) => r.json()),
      fetch("/api/admin/settings")
        .then((r) => r.json())
        .catch(() => ({})),
    ])
      .then(([s, st]) => {
        if (!s?.sale) throw new Error(s?.error || "Sale not found");
        setSale(s.sale);
        setSettings(st || {});
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="light-theme min-h-screen flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="light-theme min-h-screen flex flex-col items-center justify-center gap-3 text-gray-500">
        <p>{error || "Sale not found"}</p>
        <button
          onClick={() => router.back()}
          className="text-sm font-medium text-black hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  // Line items: use itemised lines if present, else a single line from the
  // free-text product fields.
  const lines: SaleItem[] =
    sale.items.length > 0
      ? sale.items
      : [
          {
            name: [sale.productText, sale.variantText]
              .filter(Boolean)
              .join(" — "),
            size: null,
            quantity: sale.quantity,
            unitPrice: sale.unitPrice,
          },
        ];

  const subtotal = lines.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const delivery = sale.deliveryFee || 0;
  const total = subtotal + delivery;
  const amountPaid = sale.paymentStatus === "PAID" ? total : sale.totalCollected;
  const balanceDue = Math.max(0, total - amountPaid);

  const invoiceNo = `INV-${sale.date.slice(0, 10).replace(/-/g, "")}-${sale.id
    .slice(-5)
    .toUpperCase()}`;

  const storeName = settings.storeName || "JUSTFITS";
  const email = settings.storeEmail || "support@justfitsng.com";
  const phone = settings.storePhone || "";
  const hasBank =
    settings.bankName || settings.bankAccountName || settings.bankAccountNumber;

  return (
    <div className="light-theme min-h-screen bg-gray-100 print:bg-white py-8 print:py-0">
      {/* Toolbar (hidden when printing) */}
      <div className="invoice-toolbar print:hidden max-w-3xl mx-auto px-4 mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800"
        >
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      {/* Invoice sheet */}
      <div className="max-w-3xl mx-auto bg-white shadow-sm print:shadow-none rounded-xl print:rounded-none overflow-hidden">
        {/* Accent bar */}
        <div className="h-2 bg-black" />

        <div className="p-8 sm:p-10">
          {/* Header */}
          <div className="flex flex-wrap justify-between gap-6 mb-8">
            <div>
              <div className="font-display text-3xl tracking-[0.2em] text-black">
                {storeName.toUpperCase()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Premium Car-Themed Caps &amp; Apparel
              </p>
              <div className="text-xs text-gray-500 mt-3 space-y-0.5">
                {email && <div>{email}</div>}
                {phone && <div>{phone}</div>}
                <div>@justfitsng</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-4xl tracking-widest text-gray-300">
                INVOICE
              </div>
              <div className="mt-3 text-sm">
                <div className="text-gray-500">
                  No.{" "}
                  <span className="font-medium text-gray-900">{invoiceNo}</span>
                </div>
                <div className="text-gray-500">
                  Date{" "}
                  <span className="font-medium text-gray-900">
                    {fmtDate(sale.date)}
                  </span>
                </div>
              </div>
              <span
                className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${
                  statusStyles[sale.paymentStatus]
                }`}
              >
                {sale.paymentStatus === "PAID"
                  ? "PAID"
                  : sale.paymentStatus === "PARTIAL"
                    ? "PART-PAID"
                    : "UNPAID"}
              </span>
            </div>
          </div>

          {/* Bill to */}
          <div className="mb-8">
            <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">
              Billed to
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {sale.customerName}
            </div>
            {sale.location && (
              <div className="text-sm text-gray-500">{sale.location}</div>
            )}
          </div>

          {/* Items */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b-2 border-gray-900 text-left">
                <th className="py-2 font-semibold text-gray-900">Description</th>
                <th className="py-2 font-semibold text-gray-900 text-center w-16">
                  Qty
                </th>
                <th className="py-2 font-semibold text-gray-900 text-right w-28">
                  Unit price
                </th>
                <th className="py-2 font-semibold text-gray-900 text-right w-32">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((it, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 text-gray-900">
                    {it.name}
                    {it.size && (
                      <span className="text-gray-400"> · {it.size}</span>
                    )}
                  </td>
                  <td className="py-3 text-center text-gray-600">
                    {it.quantity}
                  </td>
                  <td className="py-3 text-right text-gray-600">
                    {naira(it.unitPrice)}
                  </td>
                  <td className="py-3 text-right text-gray-900 font-medium">
                    {naira(it.quantity * it.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full sm:w-72 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{naira(subtotal)}</span>
              </div>
              {delivery > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>{naira(delivery)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
                <span>Total</span>
                <span>{naira(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600 pt-1">
                <span>Amount paid</span>
                <span>{naira(amountPaid)}</span>
              </div>
              {balanceDue > 0 && (
                <div className="flex justify-between font-semibold text-red-600 bg-red-50 rounded px-2 py-1.5 mt-1">
                  <span>Balance due</span>
                  <span>{naira(balanceDue)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment details */}
          {hasBank && balanceDue > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-1.5">
                Payment details
              </div>
              <div className="text-sm text-gray-700 space-y-0.5">
                {settings.bankName && <div>Bank: {settings.bankName}</div>}
                {settings.bankAccountName && (
                  <div>Account name: {settings.bankAccountName}</div>
                )}
                {settings.bankAccountNumber && (
                  <div>Account no: {settings.bankAccountNumber}</div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {sale.notes && (
            <div className="mb-6">
              <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">
                Notes
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {sale.notes}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-100 pt-6 text-center">
            <p className="font-display tracking-widest text-gray-900 text-sm">
              THANK YOU FOR YOUR PATRONAGE
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {storeName} · {email}
              {phone ? ` · ${phone}` : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
