import "server-only";

import type { ServiceProps } from "@/data/services";
import { prisma } from "@/lib/prisma";

function getSafeServiceImageUrl(imageUrl: string | null) {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("/") && !imageUrl.startsWith("//")) return imageUrl;

  try {
    const parsedUrl = new URL(imageUrl);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
      ? imageUrl
      : undefined;
  } catch {
    return undefined;
  }
}

async function loadPublicServiceCatalog(): Promise<ServiceProps[]> {
  const records = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      details: true,
      icon: true,
      imageUrl: true,
      isFavorite: true,
      isActive: true,
      displayOrder: true,
    },
  });

  return records.map((service) => ({
    id: service.id,
    title: service.name,
    description: service.description,
    icon: service.icon,
    iconName: service.icon,
    imageUrl: getSafeServiceImageUrl(service.imageUrl),
    isFavorite: service.isFavorite,
    isActive: service.isActive,
    displayOrder: service.displayOrder,
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
    return await loadPublicServiceCatalog();
  } catch (error) {
    if (isDynamicServerError(error)) throw error;

    console.error("Unable to load the public service catalog.", error);
    return [];
  }
}
