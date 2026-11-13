"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Link2,
  Loader2,
  PackagePlus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Field,
  ModalActions,
  ModalShell,
  StatCard,
  fmtDate,
  inputCls,
  naira,
  toDateInput,
} from "@/components/admin/ui";
import type { BatchStats } from "@/lib/finance/batches";

type BrandKey = "CAPS" | "CARS";

type ExpenseLite = {
  id: string;
  date: string;
  category: string;
  description: string | null;
  amount: number;
};

type InventoryLite = {
  id: string;
  name: string;
  size: string | null;
  costPrice: number | null;
  isActive: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  ORDERED: "Ordered",
  IN_TRANSIT: "In transit",
  RECEIVED: "Received",
};
const STATUS_STYLE: Record<string, string> = {
  ORDERED: "bg-gray-100 text-gray-700",
  IN_TRANSIT: "bg-amber-100 text-amber-800",
  RECEIVED: "bg-emerald-100 text-emerald-800",
};

async function send(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error || "Something went wrong");
  return d;
}

// Stock batches: each purchase of stock, what it cost to land, what has sold
// and what is still on the shelf. Sales draw from the oldest batch first.
export function BatchesTab({
  brand,
  expenses,
  onChanged,
}: {
  brand: BrandKey;
  expenses: ExpenseLite[];
  onChanged: () => void;
}) {
  const [batches, setBatches] = useState<BatchStats[] | null>(null);
  const [unbatched, setUnbatched] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [batchModal, setBatchModal] = useState<{ open: boolean; edit?: BatchStats }>({
    open: false,
  });
  const [linkFor, setLinkFor] = useState<BatchStats | null>(null);
  const [receiveFor, setReceiveFor] = useState<BatchStats | null>(null);
  const [lotEdit, setLotEdit] = useState<{ batch: BatchStats; lotId: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await send(`/api/admin/finance/batches?brand=${brand}`, "GET");
      setBatches(d.batches);
      setUnbatched(d.unbatchedUnits);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load batches");
    }
  }, [brand]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = () => {
    load();
    onChanged();
  };

  const linkedIds = useMemo(
    () => new Set((batches ?? []).flatMap((b) => b.expenses.map((e) => e.id))),
    [batches]
  );

  const totals = useMemo(() => {
    const t = {
      invested: 0, recovered: 0, onShelf: 0, sold: 0, remaining: 0, received: 0,
      gross: 0, net: 0,
    };
    for (const b of batches ?? []) {
      t.invested += b.landedTotal;
      t.recovered += b.recovered;
      t.onShelf += b.remainingValue;
      t.sold += b.unitsSold;
      t.remaining += b.unitsRemaining;
      t.received += b.unitsReceived;
      t.gross += b.grossProfit;
      t.net += b.netProfit;
    }
    return t;
  }, [batches]);

  const recordOpening = async () => {
    if (
      !confirm(
        "Record the stock on the shelf right now as \"Opening stock\", at each item's current cost price? Shelf quantities won't change."
      )
    )
      return;
    setBusy(true);
    try {
      const d = await send("/api/admin/finance/batches/opening", "POST", { brand });
      if (d.skipped?.length) {
        alert(`Skipped (no cost price): ${d.skipped.join(", ")}. Add a cost on the inventory page, then receive them into a batch.`);
      }
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteBatch = async (b: BatchStats) => {
    if (!confirm(`Delete "${b.label}"? Its unsold units come off the shelf. Linked expenses are kept.`)) return;
    try {
      await send(`/api/admin/finance/batches/${b.id}`, "DELETE");
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    }
  };

  const removeLot = async (b: BatchStats, lotId: string) => {
    if (!confirm("Remove this line? Its units come off the shelf.")) return;
    try {
      await send(`/api/admin/finance/batches/${b.id}/lots/${lotId}`, "DELETE");
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    }
  };

  if (error) {
    return (
      <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
        {error}
      </div>
    );
  }
  if (!batches) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  const hasOpening = batches.some((b) => b.isOpening);

  return (
    <div className="space-y-5">
      {/* Combined across batches */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Invested in stock"
          value={naira(totals.invested)}
          sub="Landed cost of every batch"
        />
        <StatCard
          label="Capital recovered"
          value={naira(totals.recovered)}
          sub="Cost of units sold and paid for"
          tone="pos"
        />
        <StatCard
          label="Still on the shelf"
          value={naira(totals.onShelf)}
          sub={`${totals.remaining} units at landed cost`}
        />
        <StatCard
          label="Batch profit"
          value={naira(totals.net)}
          sub={`Gross ${naira(totals.gross)} · ${totals.sold} sold`}
          tone={totals.net >= 0 ? "pos" : "neg"}
        />
      </div>

      {!hasOpening && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-900">
          <span className="min-w-0">
            Start here: record the stock you have now as <b>Opening stock</b>, so
            sales can be costed batch by batch from today.
          </span>
          <button
            onClick={recordOpening}
            disabled={busy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {busy && <Loader2 size={13} className="animate-spin" />}
            Record opening stock
          </button>
        </div>
      )}
      {hasOpening && unbatched > 0 && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-900">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            {unbatched} unit{unbatched === 1 ? " is" : "s are"} on the shelf but in no
            batch (added by a manual recount). They sell at the item&apos;s cost price.
            Receive new stock through a batch to keep costs exact.
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Batches</h2>
        <button
          onClick={() => setBatchModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800"
        >
          <Plus size={16} /> New batch
        </button>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-500 bg-white border border-gray-100 rounded-xl">
          No batches yet.
        </div>
      ) : (
        <div className="space-y-3">
          {[...batches].reverse().map((b) => {
            const expanded = open === b.id;
            return (
              <div key={b.id} className="bg-white border border-gray-100 rounded-xl shadow-sm min-w-0">
                <button
                  onClick={() => setOpen(expanded ? null : b.id)}
                  className="w-full text-left px-4 py-3.5 flex flex-wrap items-center gap-x-4 gap-y-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">{b.label}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_STYLE[b.status]}`}>
                        {STATUS_LABEL[b.status]}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {b.isOpening ? "Recorded" : "Ordered"} {fmtDate(b.orderDate)}
                      {b.receivedAt && !b.isOpening && ` · arrived ${fmtDate(b.receivedAt)}`}
                      {b.supplier && ` · ${b.supplier}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-5 text-right">
                    <div>
                      <div className="text-[11px] text-gray-400">Invested</div>
                      <div className="text-sm font-medium text-gray-900">{naira(b.landedTotal)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-gray-400">Sold</div>
                      <div className="text-sm font-medium text-gray-900">
                        {b.unitsReceived ? `${b.sellThroughPct}%` : "—"}
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-[11px] text-gray-400">Net profit</div>
                      <div className={`text-sm font-medium ${b.netProfit < 0 ? "text-red-600" : "text-gray-900"}`}>
                        {naira(b.netProfit)}
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {expanded && (
                  <BatchDetail
                    b={b}
                    onEdit={() => setBatchModal({ open: true, edit: b })}
                    onLink={() => setLinkFor(b)}
                    onReceive={() => setReceiveFor(b)}
                    onDelete={() => deleteBatch(b)}
                    onEditLot={(lotId) => setLotEdit({ batch: b, lotId })}
                    onRemoveLot={(lotId) => removeLot(b, lotId)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {batchModal.open && (
        <BatchModal
          brand={brand}
          edit={batchModal.edit}
          onClose={() => setBatchModal({ open: false })}
          onSaved={() => {
            setBatchModal({ open: false });
            refresh();
          }}
        />
      )}
      {linkFor && (
        <LinkExpensesModal
          batch={linkFor}
          available={expenses.filter((e) => !linkedIds.has(e.id))}
          onClose={() => setLinkFor(null)}
          onSaved={() => {
            setLinkFor(null);
            refresh();
          }}
        />
      )}
      {receiveFor && (
        <ReceiveModal
          batch={receiveFor}
          onClose={() => setReceiveFor(null)}
          onSaved={() => {
            setReceiveFor(null);
            refresh();
          }}
        />
      )}
      {lotEdit && (
        <LotModal
          batch={lotEdit.batch}
          lotId={lotEdit.lotId}
          onClose={() => setLotEdit(null)}
          onSaved={() => {
            setLotEdit(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function Row({ label, value, strong, tone }: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: "neg";
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className={strong ? "text-gray-900 font-medium" : "text-gray-500"}>{label}</span>
      <span
        className={`${strong ? "font-semibold" : ""} ${tone === "neg" ? "text-red-600" : "text-gray-900"}`}
      >
        {value}
      </span>
    </div>
  );
}

function BatchDetail({
  b,
  onEdit,
  onLink,
  onReceive,
  onDelete,
  onEditLot,
  onRemoveLot,
}: {
  b: BatchStats;
  onEdit: () => void;
  onLink: () => void;
  onReceive: () => void;
  onDelete: () => void;
  onEditLot: (lotId: string) => void;
  onRemoveLot: (lotId: string) => void;
}) {
  const btn =
    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 text-xs font-medium hover:bg-gray-200";
  const purchaseGap = b.linkedStock > 0 && b.purchaseValue > 0 ? b.linkedStock - b.purchaseValue : 0;

  return (
    <div className="border-t border-gray-100 px-4 py-4 space-y-5 text-sm">
      <div className="flex flex-wrap gap-2">
        <button onClick={onReceive} className={btn}>
          <PackagePlus size={14} /> {b.unitsReceived ? "Receive more" : "Receive stock"}
        </button>
        <button onClick={onLink} className={btn}>
          <Link2 size={14} /> Link expenses
        </button>
        <button onClick={onEdit} className={btn}>
          <Pencil size={13} /> Edit
        </button>
        {b.unitsSold === 0 && b.unitsAwaitingPayment === 0 && (
          <button onClick={onDelete} className={`${btn} text-red-600`}>
            <Trash2 size={13} /> Delete
          </button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 mb-1">Investment</h4>
          <Row label="Purchase price of items" value={naira(b.purchaseValue)} />
          {b.linkedStock > 0 && <Row label="Supplier payments linked" value={naira(b.linkedStock)} />}
          <Row label="Shipping, customs and other costs" value={naira(b.linkedExtras)} />
          <Row label="Total landed cost" value={naira(b.landedTotal)} strong />
          {purchaseGap > 1 && (
            <p className="text-[11px] text-gray-400 mt-1">
              Supplier payments are {naira(purchaseGap)} more than the item prices, so the
              difference is spread across the pieces as extra cost.
            </p>
          )}
          <h4 className="text-xs font-semibold text-gray-500 mt-4 mb-1">Stock</h4>
          <Row label="Units received" value={String(b.unitsReceived)} />
          <Row label="Sold and paid" value={String(b.unitsSold)} />
          {b.unitsAwaitingPayment > 0 && (
            <Row label="Sold, awaiting payment" value={String(b.unitsAwaitingPayment)} />
          )}
          <Row label="Remaining" value={String(b.unitsRemaining)} />
          <Row label="Sell-through" value={`${b.sellThroughPct}%`} />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-500 mb-1">Results (paid sales)</h4>
          <Row label="Revenue" value={naira(b.revenue)} />
          <Row label="Cost of units sold" value={`− ${naira(b.cogs)}`} />
          <Row label="Delivery paid on those sales" value={`− ${naira(b.delivery)}`} />
          <Row label="Gross profit" value={naira(b.grossProfit)} strong tone={b.grossProfit < 0 ? "neg" : undefined} />
          {b.attributed.map((a) => (
            <Row key={a.category} label={`${a.category.toLowerCase()} for this batch`} value={`− ${naira(a.amount)}`} />
          ))}
          <Row label="Net profit" value={naira(b.netProfit)} strong tone={b.netProfit < 0 ? "neg" : undefined} />
          <h4 className="text-xs font-semibold text-gray-500 mt-4 mb-1">Capital</h4>
          <Row label="Recovered through sales" value={naira(b.recovered)} />
          <Row label="Still on the shelf" value={naira(b.remainingValue)} />
        </div>
      </div>

      {b.lots.length > 0 && (
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 pr-3 font-medium">Item</th>
                <th className="py-2 px-2 font-medium text-right">In</th>
                <th className="py-2 px-2 font-medium text-right">Sold</th>
                <th className="py-2 px-2 font-medium text-right">Left</th>
                <th className="py-2 px-2 font-medium text-right">Price</th>
                <th className="py-2 px-2 font-medium text-right">Landed</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {b.lots.map((l) => (
                <tr key={l.id} className="border-b border-gray-50">
                  <td className="py-2 pr-3 text-gray-900">
                    {l.name}
                    {l.size && <span className="text-gray-400"> · {l.size}</span>}
                  </td>
                  <td className="py-2 px-2 text-right">{l.quantityReceived}</td>
                  <td className="py-2 px-2 text-right">{l.quantityReceived - l.quantityRemaining}</td>
                  <td className="py-2 px-2 text-right">{l.quantityRemaining}</td>
                  <td className="py-2 px-2 text-right">{naira(l.unitCost)}</td>
                  <td className="py-2 px-2 text-right font-medium">{naira(l.landedUnitCost)}</td>
                  <td className="py-2 pl-2">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onEditLot(l.id)}
                        aria-label="Edit line"
                        className="p-1 text-gray-400 hover:text-gray-900 rounded"
                      >
                        <Pencil size={13} />
                      </button>
                      {l.quantityReceived === l.quantityRemaining && (
                        <button
                          onClick={() => onRemoveLot(l.id)}
                          aria-label="Remove line"
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {b.expenses.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 mb-1">Linked expenses</h4>
          <ul className="divide-y divide-gray-50">
            {b.expenses.map((e) => (
              <li key={e.id} className="flex items-baseline justify-between gap-3 py-1.5">
                <span className="min-w-0 truncate text-gray-700">
                  {fmtDate(e.date)} · {e.description || e.category}
                  <span className="ml-2 text-[11px] text-gray-400">
                    {e.inBatchCost ? "batch cost" : "attributed"}
                  </span>
                </span>
                <span className="shrink-0 text-gray-900">{naira(e.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {b.notes && <p className="text-xs text-gray-500">{b.notes}</p>}
    </div>
  );
}

function BatchModal({
  brand,
  edit,
  onClose,
  onSaved,
}: {
  brand: BrandKey;
  edit?: BatchStats;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    label: edit?.label ?? "",
    orderDate: toDateInput(edit?.orderDate),
    status: edit?.status === "RECEIVED" ? "RECEIVED" : (edit?.status ?? "ORDERED"),
    supplier: edit?.supplier ?? "",
    notes: edit?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.label.trim()) {
      alert("Give the batch a name, e.g. \"Nov 2026 China restock\".");
      return;
    }
    setSaving(true);
    try {
      await send(
        edit ? `/api/admin/finance/batches/${edit.id}` : "/api/admin/finance/batches",
        edit ? "PATCH" : "POST",
        { ...form, brand }
      );
      onSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  };

  return (
    <ModalShell title={edit ? "Edit batch" : "New batch"} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Name">
          <input
            value={form.label}
            onChange={(e) => set("label", e.target.value)}
            placeholder="e.g. Nov 2026 China restock"
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Order date">
            <input
              type="date"
              value={form.orderDate}
              onChange={(e) => set("orderDate", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Status">
            {form.status === "RECEIVED" ? (
              <input value="Received" disabled className={`${inputCls} bg-gray-50`} />
            ) : (
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={inputCls}
              >
                <option value="ORDERED">Ordered</option>
                <option value="IN_TRANSIT">In transit</option>
              </select>
            )}
          </Field>
        </div>
        <Field label="Supplier" hint="Optional">
          <input
            value={form.supplier}
            onChange={(e) => set("supplier", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={2}
            className={inputCls}
          />
        </Field>
      </div>
      <ModalActions saving={saving} onClose={onClose} onSubmit={submit} />
    </ModalShell>
  );
}

// Batch cost = purchase, shipping, customs: becomes part of the stock's
// landed cost. Attributed = an operating expense (ads, packaging) reported
// against this batch.
function LinkExpensesModal({
  batch,
  available,
  onClose,
  onSaved,
}: {
  batch: BatchStats;
  available: ExpenseLite[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const defaultMode = (cat: string) =>
    ["STOCK", "DELIVERY"].includes(cat) ? "cost" : "attr";
  const [picks, setPicks] = useState<Record<string, "cost" | "attr">>({});
  const [unlink, setUnlink] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const sorted = [...available].sort((a, b) => b.date.localeCompare(a.date));

  const toggle = (e: ExpenseLite) =>
    setPicks((p) => {
      const next = { ...p };
      if (next[e.id]) delete next[e.id];
      else next[e.id] = defaultMode(e.category);
      return next;
    });

  const submit = async () => {
    setSaving(true);
    try {
      await send(`/api/admin/finance/batches/${batch.id}`, "PATCH", {
        links: Object.entries(picks).map(([expenseId, mode]) => ({
          expenseId,
          inBatchCost: mode === "cost",
        })),
        unlink: [...unlink],
      });
      onSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`Link expenses: ${batch.label}`} onClose={onClose}>
      <p className="text-xs text-gray-500 mb-3">
        <b>Batch cost</b> (supplier payment, shipping, customs) becomes part of what the
        stock cost you, so it stops counting as an expense. <b>Attributed</b> (ads,
        packaging) stays an expense and shows in this batch&apos;s report.
      </p>

      {batch.expenses.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 mb-1">Linked now</h4>
          <ul className="divide-y divide-gray-50 border border-gray-100 rounded-lg">
            {batch.expenses.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {e.description || e.category}
                  <span className="block text-[11px] text-gray-400">
                    {fmtDate(e.date)} · {e.inBatchCost ? "batch cost" : "attributed"}
                  </span>
                </span>
                <span className="shrink-0">{naira(e.amount)}</span>
                <button
                  onClick={() =>
                    setUnlink((u) => {
                      const n = new Set(u);
                      if (n.has(e.id)) n.delete(e.id);
                      else n.add(e.id);
                      return n;
                    })
                  }
                  className={`shrink-0 text-xs font-medium ${unlink.has(e.id) ? "text-red-600" : "text-gray-500 hover:text-black"}`}
                >
                  {unlink.has(e.id) ? "Will unlink" : "Unlink"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h4 className="text-xs font-semibold text-gray-500 mb-1">Available expenses</h4>
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500 py-3">Every expense is already linked to a batch.</p>
      ) : (
        <ul className="divide-y divide-gray-50 border border-gray-100 rounded-lg max-h-72 overflow-y-auto">
          {sorted.map((e) => {
            const mode = picks[e.id];
            return (
              <li key={e.id} className="px-3 py-2 text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={!!mode} onChange={() => toggle(e)} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate">
                    {e.description || e.category}
                    <span className="block text-[11px] text-gray-400">
                      {fmtDate(e.date)} · {e.category.toLowerCase()}
                    </span>
                  </span>
                  <span className="shrink-0">{naira(e.amount)}</span>
                </label>
                {mode && (
                  <div className="mt-1.5 ml-7 flex gap-1">
                    {(["cost", "attr"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setPicks((p) => ({ ...p, [e.id]: m }))}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                          mode === m ? "bg-black text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {m === "cost" ? "Batch cost" : "Attributed"}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <ModalActions saving={saving} onClose={onClose} onSubmit={submit} />
    </ModalShell>
  );
}

type ReceiveLine = { inventoryItemId: string; quantity: string; unitCost: string };

function ReceiveModal({
  batch,
  onClose,
  onSaved,
}: {
  batch: BatchStats;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [inventory, setInventory] = useState<InventoryLite[]>([]);
  const [lines, setLines] = useState<ReceiveLine[]>([
    { inventoryItemId: "", quantity: "", unitCost: "" },
  ]);
  const [receivedAt, setReceivedAt] = useState(toDateInput(batch.receivedAt));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/inventory")
      .then((r) => r.json())
      .then((d) => setInventory(Array.isArray(d.items) ? d.items : []))
      .catch(() => setInventory([]));
  }, []);

  const setLine = (idx: number, patch: Partial<ReceiveLine>) =>
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const total = lines.reduce(
    (s, l) => s + (Number(l.quantity) || 0) * (Number(l.unitCost) || 0),
    0
  );

  const submit = async () => {
    const ready = lines.filter((l) => l.inventoryItemId && Number(l.quantity) > 0);
    if (ready.length === 0) {
      alert("Pick at least one item and quantity.");
      return;
    }
    if (ready.some((l) => l.unitCost === "")) {
      alert("Every item needs its purchase price per piece.");
      return;
    }
    setSaving(true);
    try {
      await send(`/api/admin/finance/batches/${batch.id}/receive`, "POST", {
        receivedAt,
        lines: ready,
      });
      onSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`Receive stock: ${batch.label}`} onClose={onClose}>
      <p className="text-xs text-gray-500 mb-3">
        Add what arrived and the purchase price per piece. The units go onto the shelf, and
        shipping and customs linked to this batch are spread across them automatically. New
        designs need adding on the Inventory page first (hidden, quantity 0); receiving
        them makes them live.
      </p>
      {!batch.receivedAt && (
        <div className="mb-3 max-w-[12rem]">
          <Field label="Arrived on">
            <input
              type="date"
              value={receivedAt}
              onChange={(e) => setReceivedAt(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      )}
      <div className="space-y-3">
        {lines.map((l, idx) => (
          <div key={idx} className="border border-gray-100 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <select
                value={l.inventoryItemId}
                onChange={(e) => {
                  const inv = inventory.find((i) => i.id === e.target.value);
                  setLine(idx, {
                    inventoryItemId: e.target.value,
                    unitCost: l.unitCost || (inv?.costPrice != null ? String(inv.costPrice) : ""),
                  });
                }}
                className={inputCls}
              >
                <option value="">Pick an item…</option>
                {inventory.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                    {i.size ? ` (${i.size})` : ""}
                    {i.isActive ? "" : " · new, goes live on receipt"}
                  </option>
                ))}
              </select>
              {lines.length > 1 && (
                <button
                  onClick={() => setLines((ls) => ls.filter((_, i) => i !== idx))}
                  aria-label="Remove item"
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Quantity">
                <input
                  type="number"
                  min={1}
                  value={l.quantity}
                  onChange={(e) => setLine(idx, { quantity: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Price per piece (₦)">
                <input
                  type="number"
                  min={0}
                  value={l.unitCost}
                  onChange={(e) => setLine(idx, { unitCost: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() =>
            setLines((ls) => [...ls, { inventoryItemId: "", quantity: "", unitCost: "" }])
          }
          className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-black"
        >
          <Plus size={15} /> Add item
        </button>
        <span className="text-sm text-gray-600">
          Items total <b className="text-gray-900">{naira(total)}</b>
        </span>
      </div>
      <ModalActions saving={saving} onClose={onClose} onSubmit={submit} label="Add to stock" />
    </ModalShell>
  );
}

function LotModal({
  batch,
  lotId,
  onClose,
  onSaved,
}: {
  batch: BatchStats;
  lotId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const lot = batch.lots.find((l) => l.id === lotId)!;
  const sold = lot.quantityReceived - lot.quantityRemaining;
  const [quantity, setQuantity] = useState(String(lot.quantityReceived));
  const [unitCost, setUnitCost] = useState(String(lot.unitCost));
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await send(`/api/admin/finance/batches/${batch.id}/lots/${lotId}`, "PATCH", {
        quantityReceived: quantity,
        unitCost,
      });
      onSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`${lot.name}${lot.size ? ` (${lot.size})` : ""}`} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Quantity received" hint={sold ? `${sold} already sold` : undefined}>
          <input
            type="number"
            min={sold}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Price per piece (₦)">
          <input
            type="number"
            min={0}
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            className={inputCls}
          />
        </Field>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Changing the quantity moves the shelf count by the same amount.
      </p>
      <ModalActions saving={saving} onClose={onClose} onSubmit={submit} />
    </ModalShell>
  );
}
