"use server";

import { prisma } from "@/lib/prisma";
import { invalidateUserDesignCaches } from "@/lib/cache/invalidate";
import { CACHE_TTL, cacheKeys } from "@/lib/cache/keys";
import { getOrSet } from "@/lib/cache/store";
import { GetDBUser } from "./user_action";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

function isUploadThingUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === "utfs.io" || url.hostname.endsWith(".ufs.sh"));
  } catch {
    return false;
  }
}


export type Design = {
  id?: string;
    url: string;
    key: string;
    size?: number | null;
    name?: string | null;
    type?: string | null;
    userId?: string;
    createdAt?: Date | string;
};

export async function saveDesign(design: Design) {
  const dbUser = await GetDBUser();
  if (!dbUser) throw new Error("User not found");
  if (!design.key || !isUploadThingUrl(design.url)) {
    throw new Error("Invalid uploaded design reference");
  }

  try {
    const existingDesign = await prisma.designs.findFirst({
      where: { userId: dbUser.id, key: design.key },
      select: { id: true },
    });
    if (existingDesign) {
      await prisma.designs.update({
        where: { id: existingDesign.id },
        data: { url: design.url, size: design.size },
      });
    } else {
      await prisma.designs.create({
        data: {
        url: design.url,
        key: design.key,
        size: design.size,
        userId: dbUser.id,
        },
      });
    }
    await prisma.uploadedFile.deleteMany({ where: { key: design.key, userId: dbUser.id } }).catch((error) => {
      console.error("Temporary upload record cleanup failed:", error);
    });
    await invalidateUserDesignCaches(dbUser.id);
    return { success: true };
  } catch (error) {
    console.error("Error saving design:", error);
    throw new Error("Failed to save design");
  }
}


// get all designs for a user
export async function getUserDesigns() {
  const dbUser = await GetDBUser();
  if (!dbUser) throw new Error("User not found");

  return getOrSet(
    cacheKeys.user.designs(dbUser.id),
    CACHE_TTL.userDesigns,
    () => loadUserDesigns(dbUser.id)
  );
}

async function loadUserDesigns(userId: string) {
  try {
    const [designs, orders] = await Promise.all([
      prisma.designs.findMany({
        where: {
          userId,
        },

        orderBy: {
          createdAt: "desc", // latest designs first
        },
        select: {
          id: true,
          url: true,
          key: true,
          size: true,
          userId: true,
          createdAt: true,
        },
      }),
      prisma.order.findMany({
        where: { userId },
        select: { designs: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const knownKeys = new Set(designs.map((design) => design.key));
    const metadataByKey = new Map<string, { name?: string; type?: string; size?: number }>();
    const legacyByKey = new Map<
      string,
      { url: string; key: string; size: number | null; userId: string; createdAt: Date }
    >();

    for (const order of orders) {
      if (!Array.isArray(order.designs)) continue;
      for (const value of order.designs) {
        if (!value || typeof value !== "object" || Array.isArray(value)) continue;
        const item = value as Record<string, unknown>;
        if (typeof item.url !== "string" || typeof item.key !== "string" || !isUploadThingUrl(item.url)) continue;
        if (!metadataByKey.has(item.key)) {
          metadataByKey.set(item.key, {
            name: typeof item.name === "string" ? item.name : undefined,
            type: typeof item.type === "string" ? item.type : undefined,
            size: typeof item.size === "number" ? item.size : undefined,
          });
        }
        if (knownKeys.has(item.key) || legacyByKey.has(item.key)) continue;

        legacyByKey.set(item.key, {
          url: item.url,
          key: item.key,
          size: typeof item.size === "number" ? item.size : null,
          userId,
          createdAt: order.createdAt,
        });
      }
    }

    const legacyKeys = Array.from(legacyByKey.keys());

    if (legacyKeys.length) {
      await prisma.designs.createMany({
        data: Array.from(legacyByKey.values()),
      });
    }

    const legacyDesigns = legacyKeys.length
      ? (
          await prisma.designs.findMany({
            where: { userId, key: { in: legacyKeys } },
            select: { id: true, url: true, key: true, size: true, userId: true, createdAt: true },
          })
        ).map((design) => ({ ...design, ...metadataByKey.get(design.key) }))
      : [];

    return [
      ...designs.map((design) => ({ ...design, ...metadataByKey.get(design.key) })),
      ...legacyDesigns,
    ].sort((left, right) => (right.createdAt?.getTime() ?? 0) - (left.createdAt?.getTime() ?? 0));
  } catch (error) {
    console.error("Failed to get designs:", error);
    throw new Error("Failed to get designs");
  }
}


// delete th design
export async function deleteDesign(design: Design) {
  const dbUser = await GetDBUser();
  if (!dbUser) throw new Error("User not found");

  const ownedDesign = await prisma.designs.findFirst({
    where: { id: design.id, userId: dbUser.id },
    select: { id: true, key: true },
  });
  if (!ownedDesign || ownedDesign.key !== design.key) {
    throw new Error("Design not found or you do not have permission to delete it");
  }

  // Keep files attached to past orders in storage even when removed from the design library.
  const orders = await prisma.order.findMany({
    where: { userId: dbUser.id },
    select: { designs: true },
  });
  const referencedByOrder = orders.some((order) =>
    Array.isArray(order.designs) && order.designs.some((item) =>
      item && typeof item === "object" && !Array.isArray(item) &&
      (item as Record<string, unknown>).key === ownedDesign.key
    )
  );
  if (!referencedByOrder) {
    const deletedFile = await utapi.deleteFiles(ownedDesign.key);
    if (!deletedFile.success) throw new Error("Unable to delete the stored design file");
  }
  await prisma.designs.delete({ where: { id: ownedDesign.id } });
  await invalidateUserDesignCaches(dbUser.id);
  return { success: true };
}
