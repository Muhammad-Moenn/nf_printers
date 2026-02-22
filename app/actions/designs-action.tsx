"use server";

import { prisma } from "@/lib/prisma";
import { GetDBUser } from "./user_action";


export type Design = {
  id?: string;
    url: string;
    key: string;
    size?: number | null;
    userId?: string;
    createdAt?: Date;
};

export async function saveDesign(design: Design) {
  const dbUser = await GetDBUser();
  if (!dbUser) throw new Error("User not found");

  try {
     const existingDesign = await prisma.designs.findFirst({
    where: { userId: dbUser.id, key: design.key },
  });
    if (!existingDesign) {
      await prisma.designs.create({
      data: {
        url: design.url,
        key: design.key,
        size: design.size,
        userId: dbUser.id,
      },
    });

    return { success: true };
    }
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
    });

    return designs;
  } catch (error) {
    console.error("Failed to get designs:", error);
    throw new Error("Failed to get designs");
  }
}


// delete th design
export async function deleteDesign(design: Design) {
  const dbUser = await GetDBUser();
  if (!dbUser) throw new Error("User not found");

  // Delete design only if it belongs to the user
  const deleted = await prisma.designs.deleteMany({
    where: {
      id: design.id,
      userId: dbUser.id,
    },
  });

 if (deleted.count === 0) {
    throw new Error("Design not found or you do not have permission to delete it");
  }
  

  return { success: true };
}