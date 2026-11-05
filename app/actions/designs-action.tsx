"use server";

import { prisma } from "@/lib/prisma";
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
    createdAt?: Date;
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

  try {
    const designs = await prisma.designs.findMany({
      where: {
        userId: dbUser.id,
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
    });
    const orders = await prisma.order.findMany({
      where: { userId: dbUser.id },
      select: { designs: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const knownKeys = new Set(designs.map((design) => design.key));
    const metadataByKey = new Map<string, { name?: string; type?: string; size?: number }>();
    const legacyDesigns: Design[] = [];

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
        if (knownKeys.has(item.key)) continue;

        const created = await prisma.designs.create({
          data: {
            url: item.url,
            key: item.key,
            size: typeof item.size === "number" ? item.size : null,
            userId: dbUser.id,
            createdAt: order.createdAt,
          },
          select: { id: true, url: true, key: true, size: true, userId: true, createdAt: true },
        });
        knownKeys.add(item.key);
        legacyDesigns.push({ ...created, ...metadataByKey.get(item.key) });
      }
    }

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
  return { success: true };
}
