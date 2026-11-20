import { createStore, type StoreApi } from "zustand/vanilla";

import type { ServiceProps } from "@/data/services";

export type ServiceCatalogState = {
  services: ServiceProps[];
};

export type ServiceCatalogStore = StoreApi<ServiceCatalogState>;

export function createServiceCatalogStore(
  services: ServiceProps[],
): ServiceCatalogStore {
  return createStore<ServiceCatalogState>()(() => ({ services }));
}
