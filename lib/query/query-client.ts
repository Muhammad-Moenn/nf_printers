import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
        // Realtime can miss events while the socket is down; refetching stale
        // active queries on reconnect recovers them.
        refetchOnReconnect: true,
      },
    },
  });
}
