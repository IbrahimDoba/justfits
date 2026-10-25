"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  HandCoins,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
  Package,
  Wallet,
  Clock,
  CheckCircle2,
  Calculator,
} from "lucide-react";
import type {
  SerializedInvestor,
  SerializedInvestment,
} from "@/lib/investors/serialize";
import {
  PLAN_TEMPLATES,
  projectFixed,
  projectPerUnit,
  type PlanTemplate,
} from "@/lib/investors/plans";
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

type Investor = SerializedInvestor;
type Investment = SerializedInvestment;

interface Summary {
  investorsCount: number;
  totalInvested: number;
  activeCapital: number;
  dueNow: number;
  outstanding: number;
  totalPaid: number;
  returnsPaid: number;
  nextMaturity: string | null;
}

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-blue-50 text-blue-700",
  MATURED: "bg-amber-50 text-amber-700",
  PAID_OUT: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export default function InvestorsPage() {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showPlans, setShowPlans] = useState(false);

  const [investorModal, setInvestorModal] = useState<{ open: boolean; edit?: Investor }>({ open: false });
  const [investmentModal, setInvestmentModal] = useState<{ open: boolean; investor?: Investor; edit?: Investment }>({ open: false });
  const [soldModal, setSoldModal] = useState<Investment | null>(null);
  const [payoutModal, setPayoutModal] = useState<Investment | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api("/api/admin/investors", "GET");
      setInvestors(data.investors || []);
      setSummary(data.summary || null);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load investors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const deleteInvestor = (inv: Investor) => {
    if (!confirm(`Delete ${inv.name}, all their investments and payouts? This cannot be undone.`)) return;
    run(() => api(`/api/admin/investors/${inv.id}`, "DELETE"));
  };
  const deleteInvestment = (i: Investment) => {
    if (!confirm("Delete this investment and its payout history? Linked investor-return expenses are removed too.")) return;
    run(() => api(`/api/admin/investors/investments/${i.id}`, "DELETE"));
  };
  const deletePayout = (id: string) => {
    if (!confirm("Undo this payout? If it was a return, its Finance expense is removed too.")) return;
    run(() => api(`/api/admin/investors/payouts/${id}`, "DELETE"));
  };
  const settle = (i: Investment) => {
    const { principalDue, returnDue, dueNow } = i.metrics;
    if (
      !confirm(
        `Record a payout of ${naira(dueNow)}?\n\nCapital back: ${naira(principalDue)}\nReturn: ${naira(returnDue)}\n\nThe return is logged as an "Investor return" expense in Finance.`
      )
    )
      return;
    run(() => api(`/api/admin/investors/investments/${i.id}/payouts`, "POST", { settle: true }));
  };
  const setStatus = (i: Investment, status: string) =>
    run(() => api(`/api/admin/investors/investments/${i.id}`, "PATCH", { status }));

  return (
    <div className="light-theme p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HandCoins size={24} /> Investors
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Capital raised, what you owe, and every payout.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPlans((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Calculator size={15} /> Our plans
          </button>
          <button
            onClick={() => setInvestorModal({ open: true })}
            className="flex items-center gap-1.5 px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            <Plus size={15} /> Add investor
          </button>
        </div>
      </div>

      {showPlans && <PlansPanel />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Active capital"
          value={naira(summary?.activeCapital ?? 0)}
          sub={`${summary?.investorsCount ?? 0} investor${summary?.investorsCount === 1 ? "" : "s"}`}
          icon={<Wallet size={16} className="text-gray-400" />}
        />
        <StatCard
          label="Due now"
          value={naira(summary?.dueNow ?? 0)}
          sub="Payable to investors today"
          tone={summary?.dueNow ? "warn" : undefined}
          icon={<Clock size={16} className="text-gray-400" />}
        />
        <StatCard
          label="Still owed (projected)"
          value={naira(summary?.outstanding ?? 0)}
          sub={summary?.nextMaturity ? `Next deadline ${fmtDate(summary.nextMaturity)}` : "No open deadlines"}
          icon={<Package size={16} className="text-gray-400" />}
        />
        <StatCard
          label="Paid out"
          value={naira(summary?.totalPaid ?? 0)}
          sub={`${naira(summary?.returnsPaid ?? 0)} of it profit`}
          tone="pos"
          icon={<CheckCircle2 size={16} className="text-gray-400" />}
        />
      </div>

      {loadError && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          <span>{loadError}</span>
          <button onClick={load} className="px-3 py-1 rounded-md bg-red-600 text-white text-xs font-medium">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <Loader2 className="animate-spin" size={26} />
        </div>
      ) : investors.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-10 text-center">
          <HandCoins size={28} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No investors yet.</p>
          <button
            onClick={() => setInvestorModal({ open: true })}
            className="mt-3 text-sm font-medium text-black underline"
          >
            Add your first investor
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {investors.map((inv) => (
            <InvestorCard
              key={inv.id}
              investor={inv}
              onEdit={() => setInvestorModal({ open: true, edit: inv })}
              onDelete={() => deleteInvestor(inv)}
              onAddInvestment={() => setInvestmentModal({ open: true, investor: inv })}
              onEditInvestment={(i) => setInvestmentModal({ open: true, investor: inv, edit: i })}
              onDeleteInvestment={deleteInvestment}
              onSold={setSoldModal}
              onSettle={settle}
              onManualPayout={setPayoutModal}
              onDeletePayout={deletePayout}
              onStatus={setStatus}
            />
          ))}
        </div>
      )}

      {investorModal.open && (
        <InvestorModal
          edit={investorModal.edit}
          onClose={() => setInvestorModal({ open: false })}
          onSaved={() => {
            setInvestorModal({ open: false });
            load();
          }}
        />
      )}
      {investmentModal.open && investmentModal.investor && (
        <InvestmentModal
          investor={investmentModal.investor}
          edit={investmentModal.edit}
          onClose={() => setInvestmentModal({ open: false })}
          onSaved={() => {
            setInvestmentModal({ open: false });
            load();
          }}
        />
      )}
      {soldModal && (
        <SoldModal
          investment={soldModal}
          onClose={() => setSoldModal(null)}
          onSaved={() => {
            setSoldModal(null);
            load();
          }}
        />
      )}
      {payoutModal && (
        <PayoutModal
          investment={payoutModal}
          onClose={() => setPayoutModal(null)}
          onSaved={() => {
            setPayoutModal(null);
            load();
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------ plans panel ------------------------------ */

function PlansPanel() {
  const [amount, setAmount] = useState(500_000);
  const perPiece = PLAN_TEMPLATES.find((p) => p.type === "PER_UNIT")!;
  const note = PLAN_TEMPLATES.find((p) => p.type === "FIXED_RETURN")!;
  const pp = projectPerUnit(amount, perPiece.unitCost!, perPiece.perUnitReturn!);
  const fx = projectFixed(amount, note.fixedRatePct!);

  return (
    <div className="mb-6 bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        {PLAN_TEMPLATES.map((p) => (
          <div key={p.key} className="rounded-lg border border-gray-200 p-4 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-semibold text-gray-900">{p.name}</h3>
              <span className="text-[11px] text-gray-400 shrink-0">min {naira(p.minAmount)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{p.tagline}</p>
            <ul className="mt-3 space-y-1.5">
              {p.points.map((pt) => (
                <li key={pt} className="text-xs text-gray-600 flex gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-gray-50 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-56">
            <Field label="If they invest (₦)">
              <input
                type="number"
                min={0}
                step={50000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className={inputCls}
              />
            </Field>
          </div>
          <p className="text-xs text-gray-500 pb-2">
            Per-Piece funds {pp.units} pieces at {naira(perPiece.unitCost!)} each.
          </p>
        </div>
        <div className="mt-3 grid gap-2 grid-cols-2 sm:grid-cols-4">
          {pp.scenarios.map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-100 p-3 min-w-0">
              <div className="text-[11px] text-gray-500">Per-Piece · {s.label}</div>
              <div className="font-semibold text-gray-900 truncate">{naira(s.total)}</div>
              <div className="text-[11px] text-emerald-600">+{naira(s.profit)}</div>
            </div>
          ))}
          <div className="bg-white rounded-lg border border-gray-100 p-3 min-w-0">
            <div className="text-[11px] text-gray-500">Stock Note · 4 months</div>
            <div className="font-semibold text-gray-900 truncate">{naira(fx.total)}</div>
            <div className="text-[11px] text-emerald-600">+{naira(fx.profit)}</div>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-gray-400">
          Per-Piece assumes unsold pieces are bought back at cost at the 3-month deadline, so capital always comes back.
          Keep investor stock under ~₦900k a month so pieces sell within the 1.5-2 month target.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ investor card ------------------------------ */

function InvestorCard({
  investor,
  onEdit,
  onDelete,
  onAddInvestment,
  onEditInvestment,
  onDeleteInvestment,
  onSold,
  onSettle,
  onManualPayout,
  onDeletePayout,
  onStatus,
}: {
  investor: Investor;
  onEdit: () => void;
  onDelete: () => void;
  onAddInvestment: () => void;
  onEditInvestment: (i: Investment) => void;
  onDeleteInvestment: (i: Investment) => void;
  onSold: (i: Investment) => void;
  onSettle: (i: Investment) => void;
  onManualPayout: (i: Investment) => void;
  onDeletePayout: (id: string) => void;
  onStatus: (i: Investment, s: string) => void;
}) {
  const t = investor.totals;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 flex flex-wrap items-start justify-between gap-3 border-b border-gray-100">
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900 truncate">{investor.name}</h2>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {[investor.phone, investor.email].filter(Boolean).join(" · ") || "No contact saved"}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Invested <b>{naira(t.invested)}</b> · Paid <b>{naira(t.paid)}</b>
            {t.dueNow > 0 && (
              <span className="ml-1 text-amber-600 font-medium">· {naira(t.dueNow)} due now</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={onAddInvestment}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800"
          >
            <Plus size={13} /> Investment
          </button>
          <a
            href={`/admin/investors/statement/${investor.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <FileText size={13} /> Statement
          </a>
          <button onClick={onEdit} title="Edit investor" className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} title="Delete investor" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {investor.investments.length === 0 ? (
        <p className="p-4 sm:p-5 text-sm text-gray-400">No investments recorded yet.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {investor.investments.map((i) => (
            <InvestmentRow
              key={i.id}
              inv={i}
              onEdit={() => onEditInvestment(i)}
              onDelete={() => onDeleteInvestment(i)}
              onSold={() => onSold(i)}
              onSettle={() => onSettle(i)}
              onManualPayout={() => onManualPayout(i)}
              onDeletePayout={onDeletePayout}
              onStatus={(s) => onStatus(i, s)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InvestmentRow({
  inv,
  onEdit,
  onDelete,
  onSold,
  onSettle,
  onManualPayout,
  onDeletePayout,
  onStatus,
}: {
  inv: Investment;
  onEdit: () => void;
  onDelete: () => void;
  onSold: () => void;
  onSettle: () => void;
  onManualPayout: () => void;
  onDeletePayout: (id: string) => void;
  onStatus: (s: string) => void;
}) {
  const [showPayouts, setShowPayouts] = useState(false);
  const m = inv.metrics;
  const perUnit = inv.planType === "PER_UNIT";
  const closed = inv.status === "PAID_OUT" || inv.status === "CANCELLED";

  return (
    <div className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-gray-900">{inv.planName}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusStyles[inv.status]}`}>
              {inv.status.replace("_", " ")}
            </span>
            {m.isOverdue && (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700">Payout due</span>
            )}
            {m.isDueSoon && (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700">Due soon</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {naira(inv.amount)} · {fmtDate(inv.startDate)} → {fmtDate(m.maturityDate)}
            {inv.batchLabel ? ` · ${inv.batchLabel}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} title="Edit" className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} title="Delete" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3">
        <div className="flex justify-between text-[11px] text-gray-500 mb-1">
          <span>
            {perUnit
              ? `${inv.unitsSold} of ${inv.unitsFunded ?? 0} pieces sold`
              : `${m.progressPct}% of term elapsed`}
          </span>
          <span>{m.progressPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full bg-black rounded-full" style={{ width: `${m.progressPct}%` }} />
        </div>
      </div>

      {/* Money */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <Money label="Projected total" value={naira(m.projectedTotal)} sub={`+${naira(m.projectedReturn)} profit`} />
        <Money label="Earned so far" value={naira(m.principalEarned + m.returnEarned)} />
        <Money label="Paid" value={naira(m.totalPaid)} />
        <Money label="Due now" value={naira(m.dueNow)} tone={m.dueNow > 0 ? "warn" : undefined} />
      </div>
      {perUnit && (
        <p className="mt-2 text-[11px] text-gray-400">
          {naira(inv.unitCost)} cost + {naira(inv.perUnitReturn)} profit per piece sold
        </p>
      )}
      {!perUnit && (
        <p className="mt-2 text-[11px] text-gray-400">{inv.fixedRatePct}% fixed return, paid at maturity</p>
      )}

      {/* Actions */}
      {!closed && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {perUnit && (
            <button onClick={onSold} className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
              Record pieces sold
            </button>
          )}
          <button
            onClick={onSettle}
            disabled={m.dueNow <= 0}
            className="px-2.5 py-1.5 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Pay {m.dueNow > 0 ? naira(m.dueNow) : "due"}
          </button>
          <button onClick={onManualPayout} className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">
            Manual payout
          </button>
          {inv.status === "ACTIVE" && (
            <button onClick={() => onStatus("CANCELLED")} className="px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:text-red-600">
              Cancel deal
            </button>
          )}
        </div>
      )}
      {inv.status === "CANCELLED" && (
        <button onClick={() => onStatus("ACTIVE")} className="mt-3 text-xs font-medium text-gray-500 underline">
          Reopen deal
        </button>
      )}

      {/* Payout history */}
      {inv.payouts.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowPayouts((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
          >
            {showPayouts ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {inv.payouts.length} payout{inv.payouts.length === 1 ? "" : "s"}
          </button>
          {showPayouts && (
            <ul className="mt-2 space-y-1">
              {inv.payouts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2">
                  <span className="min-w-0 truncate text-gray-600">
                    {fmtDate(p.date)} ·{" "}
                    <span className={p.type === "RETURN" ? "text-emerald-700" : "text-gray-700"}>
                      {p.type === "RETURN" ? "Profit" : "Capital"}
                    </span>
                    {p.notes ? ` · ${p.notes}` : ""}
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <b className="text-gray-900">{naira(p.amount)}</b>
                    <button onClick={() => onDeletePayout(p.id)} title="Undo payout" className="text-gray-300 hover:text-red-600">
                      <Trash2 size={12} />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Money({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "warn" }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2 min-w-0">
      <div className="text-[11px] text-gray-500 truncate">{label}</div>
      <div className={`font-semibold truncate ${tone === "warn" ? "text-amber-600" : "text-gray-900"}`}>{value}</div>
      {sub && <div className="text-[11px] text-emerald-600 truncate">{sub}</div>}
    </div>
  );
}

/* ------------------------------ modals ------------------------------ */

function InvestorModal({ edit, onClose, onSaved }: { edit?: Investor; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: edit?.name ?? "",
    phone: edit?.phone ?? "",
    email: edit?.email ?? "",
    notes: edit?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await api(edit ? `/api/admin/investors/${edit.id}` : "/api/admin/investors", edit ? "PATCH" : "POST", form);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={edit ? "Edit investor" : "Add investor"} onClose={onClose}>
      <div className="space-y-3">
        <Field label="Name">
          <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} autoFocus />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Phone">
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={inputCls} />
        </Field>
      </div>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <ModalActions saving={saving} onClose={onClose} onSubmit={submit} />
    </ModalShell>
  );
}

function InvestmentModal({
  investor,
  edit,
  onClose,
  onSaved,
}: {
  investor: Investor;
  edit?: Investment;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initialTemplate: PlanTemplate =
    PLAN_TEMPLATES.find((p) => p.type === edit?.planType) ?? PLAN_TEMPLATES[0];
  const [form, setForm] = useState({
    planType: edit?.planType ?? initialTemplate.type,
    planName: edit?.planName ?? initialTemplate.name,
    amount: String(edit?.amount ?? initialTemplate.minAmount),
    startDate: toDateInput(edit?.startDate),
    termMonths: String(edit?.termMonths ?? initialTemplate.termMonths),
    batchLabel: edit?.batchLabel ?? "",
    unitCost: String(edit?.unitCost ?? initialTemplate.unitCost ?? ""),
    perUnitReturn: String(edit?.perUnitReturn ?? initialTemplate.perUnitReturn ?? ""),
    unitsFunded: edit?.unitsFunded != null ? String(edit.unitsFunded) : "",
    fixedRatePct: String(edit?.fixedRatePct ?? initialTemplate.fixedRatePct ?? ""),
    notes: edit?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const applyTemplate = (key: string) => {
    const t = PLAN_TEMPLATES.find((p) => p.key === key);
    if (!t) return;
    setForm((f) => ({
      ...f,
      planType: t.type,
      planName: t.name,
      termMonths: String(t.termMonths),
      unitCost: String(t.unitCost ?? ""),
      perUnitReturn: String(t.perUnitReturn ?? ""),
      fixedRatePct: String(t.fixedRatePct ?? ""),
      unitsFunded: "",
    }));
  };

  const amount = Number(form.amount) || 0;
  const perUnit = form.planType === "PER_UNIT";
  const autoUnits = perUnit && Number(form.unitCost) > 0 ? Math.floor(amount / Number(form.unitCost)) : 0;
  const units = form.unitsFunded ? Number(form.unitsFunded) : autoUnits;

  const preview = useMemo(() => {
    if (perUnit) {
      const ret = Number(form.perUnitReturn) || 0;
      return { total: amount + units * ret, profit: units * ret };
    }
    return projectFixed(amount, Number(form.fixedRatePct) || 0);
  }, [perUnit, amount, units, form.perUnitReturn, form.fixedRatePct]);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        ...form,
        investorId: investor.id,
        amount,
        termMonths: Number(form.termMonths),
        unitsFunded: perUnit ? units : null,
      };
      await api(
        edit ? `/api/admin/investors/investments/${edit.id}` : "/api/admin/investors/investments",
        edit ? "PATCH" : "POST",
        body
      );
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={`${edit ? "Edit" : "New"} investment · ${investor.name}`} onClose={onClose}>
      <div className="space-y-3">
        {!edit && (
          <div className="grid grid-cols-2 gap-2">
            {PLAN_TEMPLATES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => applyTemplate(t.key)}
                className={`text-left rounded-lg border p-3 min-w-0 transition-colors ${
                  form.planType === t.type ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-sm font-medium text-gray-900 truncate">{t.name}</div>
                <div className="text-[11px] text-gray-500 line-clamp-2">{t.tagline}</div>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Amount invested (₦)">
            <input type="number" min={0} value={form.amount} onChange={(e) => set("amount", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Start date">
            <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls} />
          </Field>
        </div>

        {perUnit ? (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cost per piece (₦)">
              <input type="number" min={0} value={form.unitCost} onChange={(e) => set("unitCost", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Profit per piece (₦)">
              <input type="number" min={0} value={form.perUnitReturn} onChange={(e) => set("perUnitReturn", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Pieces funded" hint={form.unitsFunded ? undefined : `Auto: ${autoUnits}`}>
              <input
                type="number"
                min={0}
                value={form.unitsFunded}
                placeholder={String(autoUnits)}
                onChange={(e) => set("unitsFunded", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Buyback deadline (months)">
              <input type="number" min={1} value={form.termMonths} onChange={(e) => set("termMonths", e.target.value)} className={inputCls} />
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fixed return (%)">
              <input type="number" min={0} value={form.fixedRatePct} onChange={(e) => set("fixedRatePct", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Term (months)">
              <input type="number" min={1} value={form.termMonths} onChange={(e) => set("termMonths", e.target.value)} className={inputCls} />
            </Field>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Plan name">
            <input value={form.planName} onChange={(e) => set("planName", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Batch (optional)">
            <input value={form.batchLabel} placeholder="e.g. Nov restock" onChange={(e) => set("batchLabel", e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={inputCls} />
        </Field>

        <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2.5 text-xs text-emerald-800">
          {perUnit ? `If all ${units} pieces sell` : "At maturity"}, {investor.name.split(" ")[0]} receives{" "}
          <b>{naira(preview.total)}</b> (+{naira(preview.profit)}).
        </div>
      </div>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <ModalActions saving={saving} onClose={onClose} onSubmit={submit} />
    </ModalShell>
  );
}

function SoldModal({ investment, onClose, onSaved }: { investment: Investment; onClose: () => void; onSaved: () => void }) {
  const remaining = (investment.unitsFunded ?? 0) - investment.unitsSold;
  const [add, setAdd] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const n = Math.max(0, Math.min(remaining, Number(add) || 0));
  const per = (investment.unitCost ?? 0) + (investment.perUnitReturn ?? 0);

  const submit = async () => {
    if (n <= 0) {
      setError("Enter how many pieces sold");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api(`/api/admin/investors/investments/${investment.id}`, "PATCH", { addSold: n });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Record pieces sold" onClose={onClose}>
      <p className="text-sm text-gray-600 mb-3">
        {investment.unitsSold} of {investment.unitsFunded} sold so far · {remaining} left.
      </p>
      <Field label="Pieces sold since last update">
        <input type="number" min={0} max={remaining} value={add} onChange={(e) => setAdd(e.target.value)} className={inputCls} autoFocus />
      </Field>
      {n > 0 && (
        <p className="mt-3 text-xs text-gray-600">
          Adds <b>{naira(n * per)}</b> to what you owe ({naira(n * (investment.unitCost ?? 0))} capital +{" "}
          {naira(n * (investment.perUnitReturn ?? 0))} profit).
        </p>
      )}
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <ModalActions saving={saving} onClose={onClose} onSubmit={submit} />
    </ModalShell>
  );
}

function PayoutModal({ investment, onClose, onSaved }: { investment: Investment; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    type: "RETURN" as "RETURN" | "PRINCIPAL",
    amount: "",
    date: toDateInput(),
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await api(`/api/admin/investors/investments/${investment.id}/payouts`, "POST", {
        ...form,
        amount: Number(form.amount),
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Manual payout" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {(["RETURN", "PRINCIPAL"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm((f) => ({ ...f, type: t }))}
              className={`rounded-lg border p-3 text-left min-w-0 ${
                form.type === t ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">{t === "RETURN" ? "Profit" : "Capital back"}</div>
              <div className="text-[11px] text-gray-500">
                {t === "RETURN" ? "Logged as an Investor return expense" : "Not an expense"}
              </div>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (₦)">
            <input type="number" min={0} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className={inputCls} autoFocus />
          </Field>
          <Field label="Date">
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
          </Field>
        </div>
        <Field label="Notes">
          <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="e.g. Bank transfer" className={inputCls} />
        </Field>
        <p className="text-[11px] text-gray-400">
          Due now: {naira(investment.metrics.principalDue)} capital + {naira(investment.metrics.returnDue)} profit.
        </p>
      </div>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <ModalActions saving={saving} onClose={onClose} onSubmit={submit} label="Record payout" />
    </ModalShell>
  );
}
