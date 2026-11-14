"use client";

import { useEffect, useRef } from "react";

import { supabase, whenSupabaseAuthReady } from "@/lib/supabaseClient";

export type RealtimeTable =
  | "Order"
  | "User"
  | "Message"
  | "Conversation"
  | "Service"
  | "Payment"
  | "Expense";

const BUS_TABLES: Record<string, readonly RealtimeTable[]> = {
  "user-dashboard-realtime": ["Order"],
  "admin-dashboard-realtime": ["Order", "User"],
  "admin-orders-page": ["Order"],
  "admin-users-page": ["User", "Order"],
  "admin-services-page": ["Service", "Order"],
  "admin-revenue-page": ["Order", "Payment", "Expense"],
  "admin-inbox-conversations": ["Conversation"],
  "messages-realtime": ["Message"],
};

const REFRESH_DEBOUNCE_MS = 200;
// Never let a slow Clerk bootstrap block live updates forever.
const AUTH_READY_TIMEOUT_MS = 5_000;

function waitForAuthReady(): Promise<void> {
  return Promise.race([
    whenSupabaseAuthReady(),
    new Promise<void>((resolve) => setTimeout(resolve, AUTH_READY_TIMEOUT_MS)),
  ]);
}

export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

/**
 * The subset of a Supabase `postgres_changes` payload the client relies on.
 * Message rows use REPLICA IDENTITY FULL, so `old` also carries the previous
 * row for UPDATE/DELETE.
 */
export type RealtimePayload = {
  schema: string;
  table: RealtimeTable;
  eventType: RealtimeEventType;
  commit_timestamp: string;
  new: Record<string, unknown>;
  old: Record<string, unknown>;
  errors: string[] | null;
};

export type RealtimeListener = (
  table: RealtimeTable,
  events: RealtimePayload[]
) => void;

type Channel = ReturnType<typeof supabase.channel>;

type Bus = {
  channel: Channel;
  listeners: Map<RealtimeTable, Set<RealtimeListener>>;
  pendingEvents: Map<RealtimeTable, RealtimePayload[]>;
  timer: ReturnType<typeof setTimeout> | null;
  refs: number;
};

const buses = new Map<string, Bus>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizePayload(
  value: unknown,
  table: RealtimeTable
): RealtimePayload | null {
  const payload = isRecord(value) ? value : {};
  const eventType = payload.eventType;

  if (
    eventType !== "INSERT" &&
    eventType !== "UPDATE" &&
    eventType !== "DELETE"
  ) {
    return null;
  }

  return {
    schema: typeof payload.schema === "string" ? payload.schema : "public",
    table,
    eventType,
    commit_timestamp:
      typeof payload.commit_timestamp === "string"
        ? payload.commit_timestamp
        : "",
    new: isRecord(payload.new) ? payload.new : {},
    old: isRecord(payload.old) ? payload.old : {},
    errors: Array.isArray(payload.errors)
      ? payload.errors.filter(
          (error): error is string => typeof error === "string"
        )
      : null,
  };
}

function flush(bus: Bus) {
  const pending = Array.from(bus.pendingEvents.entries());
  bus.pendingEvents.clear();

  // A listener subscribed to several tables is still invoked once per flush
  // with every payload from those tables, so existing signal-only consumers
  // keep their previous one-call-per-flush behavior.
  const calls = new Map<RealtimeListener, RealtimePayload[]>();
  for (const [table, events] of pending) {
    bus.listeners.get(table)?.forEach((listener) => {
      const existing = calls.get(listener);
      if (existing) {
        existing.push(...events);
      } else {
        calls.set(listener, events.slice());
      }
    });
  }

  for (const [listener, events] of calls) {
    if (!events.length) continue;
    listener(events[0].table, events);
  }
}

function schedule(name: string, table: RealtimeTable, payload: RealtimePayload) {
  const bus = buses.get(name);
  if (!bus) return;

  const events = bus.pendingEvents.get(table);
  if (events) {
    events.push(payload);
  } else {
    bus.pendingEvents.set(table, [payload]);
  }

  if (bus.timer) clearTimeout(bus.timer);

  bus.timer = setTimeout(() => {
    bus.timer = null;
    flush(bus);
  }, REFRESH_DEBOUNCE_MS);
}

function createBus(name: string): Bus {
  const tables = BUS_TABLES[name] ?? ["Order"];
  const listeners = new Map<RealtimeTable, Set<RealtimeListener>>();
  let channel = supabase.channel(name);

  for (const table of tables) {
    listeners.set(table, new Set());
    channel = channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      (payload) => {
        const normalized = normalizePayload(payload, table);
        if (normalized) schedule(name, table, normalized);
      }
    );
  }

  return {
    channel,
    listeners,
    pendingEvents: new Map(),
    timer: null,
    refs: 0,
  };
}

function subscribe(
  name: string,
  table: RealtimeTable,
  listener: RealtimeListener
) {
  let bus = buses.get(name);
  if (!bus) {
    bus = createBus(name);
    buses.set(name, bus);
    const created = bus;
    // Subscribe only after the Clerk token getter is installed so Realtime RLS
    // authorizes the join with the user's JWT rather than the anon key.
    void waitForAuthReady().then(() => {
      if (buses.get(name) === created) {
        void created.channel.subscribe();
      }
    });
  }

  const tableListeners = bus.listeners.get(table);
  if (!tableListeners) return () => {};

  tableListeners.add(listener);
  bus.refs += 1;

  return () => {
    tableListeners.delete(listener);
    bus!.refs -= 1;

    if (bus!.refs === 0) {
      if (bus!.timer) {
        clearTimeout(bus!.timer);
        bus!.timer = null;
      }
      void bus!.channel.unsubscribe().catch(() => {});
      buses.delete(name);
    }
  };
}

export function useRealtimeTables(
  busName: string,
  tables: readonly RealtimeTable[],
  callback: RealtimeListener,
  options?: { enabled?: boolean }
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const enabled = options?.enabled ?? true;
  const tableKey = tables.join(",");

  useEffect(() => {
    if (!enabled) return;

    const listener: RealtimeListener = (table, events) =>
      callbackRef.current(table, events);
    const unsubscribers = tableKey
      .split(",")
      .filter(Boolean)
      .map((table) => subscribe(busName, table as RealtimeTable, listener));

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [busName, tableKey, enabled]);
}
