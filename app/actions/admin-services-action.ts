"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { GetDBUser } from "@/app/actions/user_action";
import {
  serviceInputSchema,
  type AdminService,
  type AdminServicesPayload,
} from "@/app/schemas/admin-services-schema";
import { CACHE_TTL, cacheKeys } from "@/lib/cache/keys";
import { getOrSet } from "@/lib/cache/store";
import { invalidateServiceCaches } from "@/lib/cache/invalidate";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const user = await GetDBUser();
  return user?.role === "ADMIN" ? user : null;
}

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const normalize = (value: string) => value.trim().toLowerCase();

const serviceIdSchema = z.string().trim().min(1).max(100);

async function revalidateServices() {
  revalidatePath("/[locale]/services", "page");
  revalidatePath("/[locale]/admin-dashboard/services", "page");
  await invalidateServiceCaches();
}

export async function getAdminServicesAction(): Promise<AdminServicesPayload | null> {
  if (!(await requireAdmin())) return null;

  try {
    return await getOrSet(
      cacheKeys.admin.servicesList,
      CACHE_TTL.adminServicesList,
      loadAdminServicesPayload,
    );
  } catch (error) {
    console.error("getAdminServicesAction failed", error);
    return null;
  }
}

async function loadAdminServicesPayload(): Promise<AdminServicesPayload> {
  const [services, orderCounts] = await Promise.all([
      prisma.service.findMany({
        orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          description: true,
          details: true,
          features: true,
          options: true,
          idealFor: true,
          imageUrl: true,
          pricingMethod: true,
          basePrice: true,
          minPrice: true,
          maxPrice: true,
          priceUnit: true,
          displayOrder: true,
          isActive: true,
          isFavorite: true,
        },
      }),
      prisma.order.groupBy({
        by: ["service"],
        _count: { _all: true },
      }),
    ]);

    const countByService = new Map<string, number>();
    for (const entry of orderCounts) {
      const key = normalize(entry.service);
      countByService.set(key, (countByService.get(key) ?? 0) + entry._count._all);
    }

    const servicesWithCounts: AdminService[] = services.map((service) => ({
      ...service,
      pricingMethod: service.pricingMethod as AdminService["pricingMethod"],
      basePrice: Number(service.basePrice),
      minPrice: service.minPrice === null ? null : Number(service.minPrice),
      maxPrice: service.maxPrice === null ? null : Number(service.maxPrice),
      orderCount:
        countByService.get(normalize(service.name)) ??
        countByService.get(normalize(service.slug)) ??
        0,
    }));

    const popular = servicesWithCounts.reduce<AdminService | null>(
      (best, service) =>
        !best || service.orderCount > best.orderCount ? service : best,
      null,
    );

    return {
      services: servicesWithCounts,
      categories: [...new Set(services.map((service) => service.category))].sort(
        (a, b) => a.localeCompare(b),
      ),
      stats: {
        total: servicesWithCounts.length,
        active: servicesWithCounts.filter((service) => service.isActive).length,
        inactive: servicesWithCounts.filter((service) => !service.isActive)
          .length,
        popularName:
          popular && popular.orderCount > 0 ? popular.name : "No orders yet",
        popularOrders: popular?.orderCount ?? 0,
      },
    };
}

export async function saveAdminServiceAction(raw: unknown, id?: string) {
  if (!(await requireAdmin()))
    return { success: false as const, error: "Admin access required." };

  if (id !== undefined && !serviceIdSchema.safeParse(id).success)
    return { success: false as const, error: "Invalid service." };

  const parsed = serviceInputSchema.safeParse(raw);
  if (!parsed.success)
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Check the service details.",
    };

  const input = parsed.data;
  const slug = toSlug(input.name);
  if (!slug)
    return {
      success: false as const,
      error: "Service name must contain at least one letter or number.",
    };

  try {
    const duplicate = await prisma.service.findFirst({
      where: { slug, ...(id ? { NOT: { id } } : {}) },
      select: { id: true },
    });
    if (duplicate)
      return {
        success: false as const,
        error: "A service with this name already exists.",
      };

    const data = {
      name: input.name,
      slug,
      category: input.category,
      description: input.description,
      details: input.details || null,
      features: input.features,
      options: input.options,
      idealFor: input.idealFor,
      imageUrl: input.imageUrl || null,
      pricingMethod: input.pricingMethod,
      basePrice: input.basePrice,
      minPrice:
        input.minPrice === "" || input.minPrice === undefined
          ? null
          : Number(input.minPrice),
      maxPrice:
        input.maxPrice === "" || input.maxPrice === undefined
          ? null
          : Number(input.maxPrice),
      priceUnit: input.priceUnit,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
      isFavorite: input.isFavorite,
    };

    if (id) await prisma.service.update({ where: { id }, data });
    else await prisma.service.create({ data });

    await revalidateServices();
    return { success: true as const };
  } catch (error) {
    console.error("saveAdminServiceAction failed", error);
    return {
      success: false as const,
      error: "Could not save this service. Please try again.",
    };
  }
}

export async function toggleAdminServiceAction(id: string, isActive: boolean) {
  if (!(await requireAdmin()))
    return { success: false as const, error: "Admin access required." };
  if (!serviceIdSchema.safeParse(id).success)
    return { success: false as const, error: "Invalid service." };

  try {
    await prisma.service.update({ where: { id }, data: { isActive } });
    await revalidateServices();
    return { success: true as const };
  } catch (error) {
    console.error("toggleAdminServiceAction failed", error);
    return {
      success: false as const,
      error: "Could not update service availability.",
    };
  }
}

export async function deleteAdminServiceAction(id: string) {
  if (!(await requireAdmin()))
    return { success: false as const, error: "Admin access required." };
  if (!serviceIdSchema.safeParse(id).success)
    return { success: false as const, error: "Invalid service." };

  try {
    const service = await prisma.service.findUnique({
      where: { id },
      select: { name: true },
    });
    if (!service)
      return { success: false as const, error: "Service not found." };

    await prisma.service.delete({ where: { id } });
    await revalidateServices();
    return { success: true as const };
  } catch (error) {
    console.error("deleteAdminServiceAction failed", error);
    return {
      success: false as const,
      error: "Could not delete this service. Please try again.",
    };
  }
}
