"use server";
import { clerkClient } from "@clerk/nextjs/server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isDynamicServerError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    (error as { digest?: unknown }).digest === "DYNAMIC_SERVER_USAGE"
  );
}

// Kept as the shared database-user accessor used throughout existing actions.
export const GetDBUser = async () => {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error("Session lookup failed:", error);
    return null;
  }
};

// update the user name 

export async function updateProfileAction(formData: FormData) {
  const user = await GetDBUser();
  if (!user) throw new Error("Unauthorized");

  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();

  if (!firstName || firstName.length < 1 || firstName.length > 80) {
    return { error: "Enter a first name (up to 80 characters)." };
  }

  if (!lastName || lastName.length < 1 || lastName.length > 80) {
    return { error: "Enter a last name (up to 80 characters)." };
  }

  try {
    if (user.clerkUserId) {
      const client = await clerkClient();
      await client.users.updateUser(user.clerkUserId, { firstName, lastName });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { firstName, lastName },
    });
  } catch (error) {
    console.error("updateProfileAction error:", error);
    return { error: "Unable to save your profile right now. Please try again." };
  }

  return { success: "Profile updated successfully" };
}

export async function updateEmailPreferencesAction(input: {
  emailNotifications: boolean;
  marketingEmails: boolean;
}) {
  const user = await GetDBUser();
  if (!user) return { error: "Please sign in to update your preferences." };
  if (
    typeof input?.emailNotifications !== "boolean" ||
    typeof input?.marketingEmails !== "boolean"
  ) return { error: "Invalid preference values." };

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailNotifications: input.emailNotifications,
        marketingEmails: input.marketingEmails,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("updateEmailPreferencesAction error:", error);
    return { error: "Unable to save this preference. Please try again." };
  }
}

