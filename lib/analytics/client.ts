"use client";

import type { EventType, TrackEvent } from "./events";

// Lightweight first-party tracker. Events are queued and sent in small batches
// (every few seconds, or when the tab is hidden) with navigator.sendBeacon, so
// tracking never blocks rendering or navigation.

const VISITOR_KEY = "jf_vid";
const SESSION_KEY = "jf_sid";
const SESSION_SEEN_KEY = "jf_sid_seen";
const ATTRIBUTION_KEY = "jf_attr";
export const INTERNAL_KEY = "jf_internal"; // set on admin devices: no tracking
const SESSION_IDLE_MS = 30 * 60 * 1000;
const FLUSH_MS = 4000;

const queue: TrackEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

const randomId = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  ).replace(/[^a-zA-Z0-9_-]/g, "");

function safeGet(store: Storage, key: string) {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(store: Storage, key: string, value: string) {
  try {
    store.setItem(key, value);
  } catch {
    /* storage blocked (private mode) - fall back to per-page ids */
  }
}

export function isTrackingDisabled() {
  if (typeof window === "undefined") return true;
  return safeGet(localStorage, INTERNAL_KEY) === "1";
}

function visitorId() {
  let id = safeGet(localStorage, VISITOR_KEY);
  if (!id) {
    id = randomId();
    safeSet(localStorage, VISITOR_KEY, id);
  }
  return id;
}

// A session ends after 30 minutes of inactivity.
export function sessionInfo(): { id: string; isNew: boolean } {
  const now = Date.now();
  const seen = Number(safeGet(sessionStorage, SESSION_SEEN_KEY) || 0);
  let id = safeGet(sessionStorage, SESSION_KEY);
  const isNew = !id || now - seen > SESSION_IDLE_MS;
  if (isNew) {
    id = randomId();
    safeSet(sessionStorage, SESSION_KEY, id);
  }
  safeSet(sessionStorage, SESSION_SEEN_KEY, String(now));
  return { id: id!, isNew };
}

// UTM tags / external referrer captured on a session's first page view.
export function attribution(): Partial<TrackEvent> {
  try {
    return JSON.parse(safeGet(sessionStorage, ATTRIBUTION_KEY) || "{}");
  } catch {
    return {};
  }
}
export function setAttribution(a: Partial<TrackEvent>) {
  safeSet(sessionStorage, ATTRIBUTION_KEY, JSON.stringify(a));
}

export function flush() {
  if (!queue.length || typeof window === "undefined") return;
  const payload = JSON.stringify({
    visitorId: visitorId(),
    sessionId: sessionInfo().id,
    events: queue.splice(0, queue.length),
  });
  const ok =
    typeof navigator.sendBeacon === "function" &&
    navigator.sendBeacon("/api/track", payload);
  if (!ok) {
    fetch("/api/track", { method: "POST", body: payload, keepalive: true }).catch(() => {});
  }
}

export function track(
  type: EventType,
  props: Omit<TrackEvent, "type" | "path"> & { path?: string } = {}
) {
  if (isTrackingDisabled()) return;
  queue.push({ type, path: props.path ?? window.location.pathname, ...props });
  if (queue.length >= 10) {
    flush();
  } else if (!timer) {
    timer = setTimeout(() => {
      timer = null;
      flush();
    }, FLUSH_MS);
  }
}
