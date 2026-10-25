"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import type { SerializedInvestor } from "@/lib/investors/serialize";
import { fmtDate, naira } from "@/components/admin/ui";

interface Settings {
  storeName?: string | null;
  storeEmail?: string | null;
  storePhone?: string | null;
}

const statusLabel: Record<string, string> = {
  ACTIVE: "Active",
  MATURED: "Matured",
  PAID_OUT: "Paid out",
  CANCELLED: "Cancelled",
};

export default function InvestorStatementPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [investor, setInvestor] = useState<SerializedInvestor | null>(null);
  const [settings, setSettings] = useState<Settings>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/investors/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Failed to load statement");
        setInvestor(d.investor);
      })
      .catch((e) => setError(e.message));
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : {}))
      .then((d) => setSettings(d || {}))
      .catch(() => {});
  }, [id]);

  // The browser uses the document title as the default "Save as PDF" filename.
  useEffect(() => {
    if (!investor) return;
    const prev = document.title;
    document.title = `JUSTFITS Investor Statement for ${investor.name}`;
    return () => {
      document.title = prev;
    };
  }, [investor]);

  if (error) {
    return <div className="light-theme p-10 text-center text-sm text-red-600">{error}</div>;
  }
  if (!investor) {
    return (
      <div className="light-theme flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="animate-spin" size={26} />
      </div>
    );
  }

  const storeName = settings.storeName || "JUSTFITS";
  const email = settings.storeEmail || "support@justfitsng.com";
  const phone = settings.storePhone || "";
  const t = investor.totals;
  const payouts = investor.investments
    .flatMap((i) => i.payouts.map((p) => ({ ...p, plan: i.planName })))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const today = new Date().toISOString();

  return (
    <div className="light-theme min-h-screen bg-gray-100 print:bg-white py-8 print:py-0">
      <div className="print:hidden max-w-3xl mx-auto px-4 mb-4 flex items-center justify-between">
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

      <div className="max-w-3xl mx-auto bg-white shadow-sm print:shadow-none rounded-xl print:rounded-none overflow-hidden">
        <div className="h-2 bg-black" />
        <div className="p-6 sm:p-10">
          {/* Header */}
          <div className="flex flex-wrap justify-between gap-6 mb-8">
            <div>
              <div className="font-display text-3xl tracking-[0.2em] text-black">
                {storeName.toUpperCase()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Premium Car-Themed Caps &amp; Apparel</p>
              <div className="text-xs text-gray-500 mt-3 space-y-0.5">
                {email && <div>{email}</div>}
                {phone && <div>{phone}</div>}
                <div>@justfitsng</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl sm:text-4xl tracking-widest text-gray-300">STATEMENT</div>
              <div className="mt-3 text-sm text-gray-500">
                Date <span className="font-medium text-gray-900">{fmtDate(today)}</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-1">Investor</div>
            <div className="text-lg font-semibold text-gray-900">{investor.name}</div>
            <div className="text-sm text-gray-500">
              {[investor.phone, investor.email].filter(Boolean).join(" · ")}
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              ["Invested", naira(t.invested)],
              ["Paid to you", naira(t.paid)],
              ["Profit paid", naira(t.returnsPaid)],
              ["Due now", naira(t.dueNow)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-gray-100 p-3">
                <div className="text-[11px] uppercase tracking-wider text-gray-400">{label}</div>
                <div className="mt-1 font-semibold text-gray-900">{value}</div>
              </div>
            ))}
          </div>

          {/* Investments */}
          <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-2">Investments</div>
          <div className="space-y-3 mb-8">
            {investor.investments.map((i) => {
              const m = i.metrics;
              return (
                <div key={i.id} className="rounded-lg border border-gray-200 p-4 break-inside-avoid">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <div className="font-semibold text-gray-900">{i.planName}</div>
                      <div className="text-xs text-gray-500">
                        {fmtDate(i.startDate)} → {fmtDate(m.maturityDate)}
                        {i.batchLabel ? ` · ${i.batchLabel}` : ""}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{naira(i.amount)}</div>
                      <div className="text-xs text-gray-500">{statusLabel[i.status]}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <div className="text-gray-400">Terms</div>
                      <div className="text-gray-800">
                        {i.planType === "PER_UNIT"
                          ? `${naira(i.unitCost)} + ${naira(i.perUnitReturn)} / piece`
                          : `${i.fixedRatePct}% fixed`}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Progress</div>
                      <div className="text-gray-800">
                        {i.planType === "PER_UNIT"
                          ? `${i.unitsSold} of ${i.unitsFunded} sold`
                          : `${m.progressPct}% of term`}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Projected total</div>
                      <div className="text-gray-800">{naira(m.projectedTotal)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Paid so far</div>
                      <div className="text-gray-800">{naira(m.totalPaid)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payouts */}
          {payouts.length > 0 && (
            <div className="mb-8">
              <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-2">Payouts</div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    <th className="py-2 font-medium">Date</th>
                    <th className="py-2 font-medium">Plan</th>
                    <th className="py-2 font-medium">Type</th>
                    <th className="py-2 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-600">{fmtDate(p.date)}</td>
                      <td className="py-2 text-gray-600">{p.plan}</td>
                      <td className="py-2 text-gray-600">{p.type === "RETURN" ? "Profit" : "Capital"}</td>
                      <td className="py-2 text-right font-medium text-gray-900">{naira(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-gray-100 pt-6 text-center">
            <p className="font-display tracking-widest text-gray-900 text-sm">THANK YOU FOR BACKING JUSTFITS</p>
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
