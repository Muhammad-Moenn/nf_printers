"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthUser } from "@/components/auth-provider";

export function QueryAuthSync() {
  const queryClient = useQueryClient();
  const { user } = useAuthUser();
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    const nextUserId = user?.id ?? null;

    if (previousUserId.current && previousUserId.current !== nextUserId) {
      void queryClient.cancelQueries().then(() => queryClient.clear());
    }

    previousUserId.current = nextUserId;
  }, [user?.id, queryClient]);

  return null;
}
