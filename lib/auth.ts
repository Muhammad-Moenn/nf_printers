import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import type { Prisma, User } from "@prisma/client";
import { cache } from "react";

import { prisma } from "@/lib/prisma";

export type ClerkProfile = {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  avatarUrl?: string | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}

async function ensureUserConversation(
  tx: Prisma.TransactionClient,
  userId: string,
) {
  const conversation = await tx.conversation.findUnique({ where: { userId } });
  if (!conversation) {
    await tx.conversation.create({ data: { userId } });
  }
}

/**
 * Idempotently associates a Clerk identity with the application user record.
 * The Clerk user ID is the source of truth; email is only used once to link a
 * pre-existing application record (including records created before Clerk sync).
 */
export async function syncUserFromClerk(
  profile: ClerkProfile,
): Promise<User | null> {
  const email = normalizeEmail(profile.email);
  const data = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    avatarUrl: profile.avatarUrl ?? null,
  };

  try {
    return await prisma.$transaction(async (tx) => {
      const byClerkId = await tx.user.findUnique({
        where: { clerkUserId: profile.id },
      });

      if (byClerkId) {
        return tx.user.update({
          where: { id: byClerkId.id },
          data: { ...data, email },
        });
      }

      const byEmail = await tx.user.findUnique({ where: { email } });
      if (byEmail) {
        if (byEmail.clerkUserId && byEmail.clerkUserId !== profile.id) {
          throw new Error("This email is already linked to another account.");
        }
        if (!profile.emailVerified) {
          throw new Error("A verified email address is required to link this account.");
        }
        const linked = await tx.user.update({
          where: { id: byEmail.id },
          data: { ...data, clerkUserId: profile.id },
        });
        await ensureUserConversation(tx, linked.id);
        return linked;
      }

      if (!profile.emailVerified) return null;

      const created = await tx.user.create({
        data: {
          ...data,
          clerkUserId: profile.id,
          email,
        },
      });
      await ensureUserConversation(tx, created.id);
      return created;
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const existing = await prisma.user.findUnique({
        where: { clerkUserId: profile.id },
      });
      if (existing) return existing;

      const byEmail = await prisma.user.findUnique({ where: { email } });
      if (byEmail && !byEmail.clerkUserId && profile.emailVerified) {
        return prisma.$transaction(async (tx) => {
          const linked = await tx.user.update({
            where: { id: byEmail.id },
            data: { ...data, clerkUserId: profile.id },
          });
          await ensureUserConversation(tx, linked.id);
          return linked;
        });
      }
    }
    throw error;
  }
}

/**
 * Removes or detaches the application record for a deleted Clerk user while
 * preserving business records (orders, designs, invoices) that must not be
 * destroyed by an authentication lifecycle event.
 */
export async function removeUserFromClerk(clerkUserId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });
  if (!user) return;

  try {
    await prisma.user.delete({ where: { id: user.id } });
  } catch {
    await prisma.user.update({
      where: { id: user.id },
      data: { clerkUserId: null },
    });
  }
}

function primaryEmail(clerkUser: Awaited<ReturnType<typeof currentUser>>) {
  if (!clerkUser) return null;
  const address =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId,
    ) ?? clerkUser.emailAddresses[0];
  if (!address) return null;
  return {
    email: address.emailAddress,
    verified: address.verification?.status === "verified",
  };
}

/**
 * Reads the authenticated Clerk user on the server and returns the matching
 * application record. Creates/synchronizes the record when the webhook has not
 * run yet (for example during local development or a webhook retry).
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (existing) return existing;

  const clerkUser = await currentUser();
  const email = primaryEmail(clerkUser);
  if (!clerkUser || !email) return null;

  return syncUserFromClerk({
    id: userId,
    email: email.email,
    emailVerified: email.verified,
    firstName: clerkUser.firstName ?? null,
    lastName: clerkUser.lastName ?? null,
    avatarUrl: clerkUser.imageUrl ?? null,
  });
});

export async function isUserUploadOwner(
  uploadedBy: string | null | undefined,
  userId: string,
) {
  if (!uploadedBy) return false;
  if (uploadedBy === userId) return true;
  const legacy = await prisma.user.findUnique({
    where: { id: userId },
    select: { clerkUserId: true },
  });
  return Boolean(legacy?.clerkUserId && uploadedBy === legacy.clerkUserId);
}
