"use client";

import { create } from "zustand";
import {
  getAdminOrdersOverviewAction,
  getAdminRevenueAnalyticsAction,
  getAdminStatsCardsAction,
} from "@/app/actions/admin-dashboard-action";
import type {
  AdminOrdersOverviewPayload,
  AdminRevenueAnalyticsPayload,
  AdminStats,
  AdminStatsCard,
  AdminStatsCardsPayload,
} from "@/app/schemas/admin-dashboard-schema";

type AdminDashboardStore = {
  stats: AdminStats | null;
  cards: AdminStatsCard[];
  isRefreshingStats: boolean;
  statsError: string | null;
  lastStatsFetchedAt: number | null;
  setStatsPayload: (payload: AdminStatsCardsPayload) => void;
  refreshStatsCards: (options?: { force?: boolean }) => Promise<void>;
  revenueAnalytics: AdminRevenueAnalyticsPayload | null;
  isRefreshingRevenue: boolean;
  revenueError: string | null;
  lastRevenueFetchedAt: number | null;
  setRevenueAnalyticsPayload: (
    payload: AdminRevenueAnalyticsPayload
  ) => void;
  refreshRevenueAnalytics: (options?: { force?: boolean }) => Promise<void>;
  ordersOverview: AdminOrdersOverviewPayload | null;
  isRefreshingOrdersOverview: boolean;
  ordersOverviewError: string | null;
  lastOrdersOverviewFetchedAt: number | null;
  setOrdersOverviewPayload: (payload: AdminOrdersOverviewPayload) => void;
  refreshOrdersOverview: (options?: { force?: boolean }) => Promise<void>;
};

const STATS_CACHE_MS = 60_000;
const REVENUE_CACHE_MS = 60_000;
const ORDERS_OVERVIEW_CACHE_MS = 60_000;

export const useAdminDashboardStore = create<AdminDashboardStore>((set, get) => ({
  stats: null,
  cards: [],
  isRefreshingStats: false,
  statsError: null,
  lastStatsFetchedAt: null,
  revenueAnalytics: null,
  isRefreshingRevenue: false,
  revenueError: null,
  lastRevenueFetchedAt: null,
  ordersOverview: null,
  isRefreshingOrdersOverview: false,
  ordersOverviewError: null,
  lastOrdersOverviewFetchedAt: null,

  setStatsPayload: (payload) =>
    set({
      stats: payload.stats,
      cards: payload.cards,
      statsError: null,
      lastStatsFetchedAt: Date.now(),
    }),

  refreshStatsCards: async (options) => {
    const { lastStatsFetchedAt, isRefreshingStats } = get();
    const isFresh =
      lastStatsFetchedAt && Date.now() - lastStatsFetchedAt < STATS_CACHE_MS;

    if (!options?.force && (isFresh || isRefreshingStats)) {
      return;
    }

    set({ isRefreshingStats: true, statsError: null });

    try {
      const payload = await getAdminStatsCardsAction();

      if (!payload) {
        set({
          isRefreshingStats: false,
          statsError: "Admin stats are unavailable.",
        });
        return;
      }

      set({
        stats: payload.stats,
        cards: payload.cards,
        isRefreshingStats: false,
        lastStatsFetchedAt: Date.now(),
      });
    } catch (error) {
      set({
        isRefreshingStats: false,
        statsError: "Failed to refresh admin stats.",
      });
    }
  },

  setRevenueAnalyticsPayload: (payload) =>
    set({
      revenueAnalytics: payload,
      revenueError: null,
      lastRevenueFetchedAt: Date.now(),
    }),

  refreshRevenueAnalytics: async (options) => {
    const { lastRevenueFetchedAt, isRefreshingRevenue } = get();
    const isFresh =
      lastRevenueFetchedAt &&
      Date.now() - lastRevenueFetchedAt < REVENUE_CACHE_MS;

    if (isRefreshingRevenue || (!options?.force && isFresh)) {
      return;
    }

    set({ isRefreshingRevenue: true, revenueError: null });

    try {
      const payload = await getAdminRevenueAnalyticsAction();

      if (!payload) {
        set({
          isRefreshingRevenue: false,
          revenueError: "Revenue analytics are unavailable.",
        });
        return;
      }

      set({
        revenueAnalytics: payload,
        isRefreshingRevenue: false,
        revenueError: null,
        lastRevenueFetchedAt: Date.now(),
      });
    } catch {
      set({
        isRefreshingRevenue: false,
        revenueError: "Failed to refresh revenue analytics.",
      });
    }
  },

  setOrdersOverviewPayload: (payload) =>
    set({
      ordersOverview: payload,
      ordersOverviewError: null,
      lastOrdersOverviewFetchedAt: Date.now(),
    }),

  refreshOrdersOverview: async (options) => {
    const { lastOrdersOverviewFetchedAt, isRefreshingOrdersOverview } = get();
    const isFresh =
      lastOrdersOverviewFetchedAt &&
      Date.now() - lastOrdersOverviewFetchedAt < ORDERS_OVERVIEW_CACHE_MS;

    if (isRefreshingOrdersOverview || (!options?.force && isFresh)) {
      return;
    }

    set({
      isRefreshingOrdersOverview: true,
      ordersOverviewError: null,
    });

    try {
      const payload = await getAdminOrdersOverviewAction();

      if (!payload) {
        set({
          isRefreshingOrdersOverview: false,
          ordersOverviewError: "Orders overview is unavailable.",
        });
        return;
      }

      set({
        ordersOverview: payload,
        isRefreshingOrdersOverview: false,
        ordersOverviewError: null,
        lastOrdersOverviewFetchedAt: Date.now(),
      });
    } catch {
      set({
        isRefreshingOrdersOverview: false,
        ordersOverviewError: "Failed to refresh orders overview.",
      });
    }
  },
}));
