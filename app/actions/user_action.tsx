"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function AddUserToDB() {
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const existingUser = await prisma.user.findUnique({
  where: { clerkUserId: user.id },
});

if (existingUser) {
  await prisma.user.update({
    where: { clerkUserId: user.id },
    data: {
      email,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      avatarUrl: user.imageUrl ?? "",
    },
  });
} else {
  await prisma.user.create({
    data: {
      clerkUserId: user.id,
      email,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      avatarUrl: user.imageUrl ?? "",
    },
  });
}


  return { success: true };
}
// get the current user from DB
export const GetDBUser= async ()=>{
  const user = await currentUser();
  if (!user) throw new Error("User not logged in");
const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: user.id },
  });
  if(dbUser){
    return dbUser;

  }else{ throw new Error("User not found in DB");}
}