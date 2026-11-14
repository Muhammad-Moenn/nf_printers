"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";

import { getCurrentUser } from "@/lib/auth";
import { CACHE_TTL, cacheKeys } from "@/lib/cache/keys";
import { cacheDelete, getOrSet } from "@/lib/cache/store";
import { invalidateAdminCustomerCaches } from "@/lib/cache/invalidate";
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

export type ProfileData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  emailNotifications: boolean;
  marketingEmails: boolean;
};

export async function getProfileAction(): Promise<ProfileData | null> {
  const { userId } = await auth();
  if (!userId) return null;

  return getOrSet<ProfileData | null>(
    cacheKeys.user.profile(userId),
    CACHE_TTL.userProfile,
    async () => {
      const user = await GetDBUser();
      if (!user) return null;

      return {
        id: user.id,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        emailNotifications: user.emailNotifications,
        marketingEmails: user.marketingEmails,
      };
    }
  );
}

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
    // Names are embedded in cached admin order rows and the latest-orders feed.
    const { userId: clerkUserId } = await auth();
    await Promise.all([
      invalidateAdminCustomerCaches(),
      clerkUserId
        ? cacheDelete(cacheKeys.user.profile(clerkUserId))
        : Promise.resolve(),
    ]);
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
    const { userId: clerkUserId } = await auth();
    if (clerkUserId) {
      await cacheDelete(cacheKeys.user.profile(clerkUserId));
    }
    return { success: true };
  } catch (error) {
    console.error("updateEmailPreferencesAction error:", error);
    return { error: "Unable to save this preference. Please try again." };
  }
}

