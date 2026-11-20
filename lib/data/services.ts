import "server-only";

import { services, type ServiceProps } from "@/data/services";
import { CACHE_TTL, cacheKeys } from "@/lib/cache/keys";
import { getOrSet } from "@/lib/cache/store";
import { prisma } from "@/lib/prisma";

async function loadPublicServiceCatalog(): Promise<ServiceProps[]> {
  const records = await prisma.service.findMany({
    where: { isActive: true, isFavorite: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      details: true,
      icon: true,
    },
  });

  if (!records.length) return services;

  return records.map((service) => ({
    id: service.id,
    title: service.name,
    description: service.description,
    icon: service.icon,
    iconColor: "text-primary-text",
    iconBg: "bg-primary/10",
    details: service.details ?? undefined,
    link: `/services/${service.slug}`,
    slug: service.slug,
  }));
}

function isDynamicServerError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    (error as { digest?: unknown }).digest === "DYNAMIC_SERVER_USAGE"
  );
}

export async function getPublicServiceCatalog(): Promise<ServiceProps[]> {
  try {
    return await getOrSet(
      cacheKeys.services.publicCatalog,
      CACHE_TTL.publicServices,
      loadPublicServiceCatalog
    );
  } catch (error) {
    // Let Next.js switch the route to dynamic rendering instead of silently
    // freezing the built-in catalog into a static page.
    if (isDynamicServerError(error)) throw error;

    console.error(
      "Unable to load the public service catalog; using built-in services.",
      error
    );
    return services;
  }
}
