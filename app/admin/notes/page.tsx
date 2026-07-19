"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  StickyNote,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  Pin,
  PinOff,
} from "lucide-react";

interface Note {
  id: string;
  title: string | null;
  content: string;
  pinned: boolean;
  authorName: string | null;
  authorEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; edit?: Note }>({
    open: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notes");
      const data = await res.json();
      setNotes(Array.isArray(data.notes) ? data.notes : []);
    } catch (e) {
      console.error("Failed to load notes", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        (n.title || "").toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }, [notes, search]);

  const togglePin = async (n: Note) => {
    await fetch(`/api/admin/notes/${n.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !n.pinned }),
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    await fetch(`/api/admin/notes/${id}`, { method: "DELETE" });
    load();
  };

  const pinnedCount = notes.filter((n) => n.pinned).length;

  return (
    <div className="light-theme p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <StickyNote size={26} /> Notes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {notes.length} note{notes.length === 1 ? "" : "s"}
            {pinnedCount > 0 && ` · ${pinnedCount} pinned`}
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800"
        >
          <Plus size={16} /> New note
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes…"
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <StickyNote size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">
            {search ? "No notes match your search." : "No notes yet."}
          </p>
          {!search && (
            <button
              onClick={() => setModal({ open: true })}
              className="mt-4 text-sm font-medium text-black hover:underline"
            >
              Write your first note
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence initial={false}>
            {filtered.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col ${
                  n.pinned ? "border-amber-300 bg-amber-50/40" : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                    {n.title || (
                      <span className="text-gray-400 font-normal">Untitled</span>
                    )}
                  </h3>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => togglePin(n)}
                      title={n.pinned ? "Unpin" : "Pin"}
                      className={`p-1.5 rounded hover:bg-gray-100 ${
                        n.pinned ? "text-amber-600" : "text-gray-400"
                      }`}
                    >
                      {n.pinned ? <Pin size={14} /> : <PinOff size={14} />}
                    </button>
                    <button
                      onClick={() => setModal({ open: true, edit: n })}
                      className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => remove(n.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words flex-1">
                  {n.content}
                </p>

                <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                  {n.authorName ? `${n.authorName} · ` : ""}
                  {fmtDate(n.updatedAt)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {modal.open && (
        <NoteModal
          edit={modal.edit}
          onClose={() => setModal({ open: false })}
          onSaved={() => {
            setModal({ open: false });
            load();
          }}
        />
      )}
    </div>
  );
}

function NoteModal({
  edit,
  onClose,
  onSaved,
}: {
  edit?: Note;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(edit?.title ?? "");
  const [content, setContent] = useState(edit?.content ?? "");
  const [pinned, setPinned] = useState(edit?.pinned ?? false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!content.trim()) {
      alert("Note content is required.");
      return;
    }
    setSaving(true);
    try {
      const url = edit ? `/api/admin/notes/${edit.id}` : "/api/admin/notes";
      const res = await fetch(url, {
        method: edit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, pinned }),
      });
      if (!res.ok) throw new Error("Save failed");
      onSaved();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-semibold text-gray-900">
            {edit ? "Edit note" : "New note"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <label className="block">
            <span className="text-xs font-medium text-gray-600">
              Title (optional)
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Supplier contact, Restock reminder"
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-gray-600">Note</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Write anything you need to remember…"
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 resize-y font-mono"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            Pin to top
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
