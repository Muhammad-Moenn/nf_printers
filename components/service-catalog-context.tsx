"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useStore } from "zustand";

import {
  createServiceCatalogStore,
  type ServiceCatalogStore,
} from "@/app/store/service-catalog-store";
import type { ServiceProps } from "@/data/services";

const ServiceCatalogStoreContext =
  createContext<ServiceCatalogStore | null>(null);

export function ServiceCatalogProvider({
  services,
  children,
}: {
  services: ServiceProps[];
  children: ReactNode;
}) {
  const storeRef = useRef<ServiceCatalogStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createServiceCatalogStore(services);
  }

  const store = storeRef.current;

  useEffect(() => {
    store.setState((current) =>
      current.services === services ? current : { services },
    );
  }, [services, store]);

  return (
    <ServiceCatalogStoreContext.Provider value={store}>
      {children}
    </ServiceCatalogStoreContext.Provider>
  );
}

export function useServiceCatalog() {
  const store = useContext(ServiceCatalogStoreContext);

  if (!store) {
    throw new Error("useServiceCatalog must be used within ServiceCatalogProvider");
  }

  return useStore(store, (state) => state.services);
}
