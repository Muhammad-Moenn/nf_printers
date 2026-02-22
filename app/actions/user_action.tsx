"use server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function AddUserToDB() {
  const user = await currentUser();
  if (!user) return null;
  // console.log("user",user)
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
export const GetDBUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  try {
    return  await prisma.user.findUnique({
    where: { clerkUserId: user.id },
  });
  } catch (error) {
    // Database connection failed
    return null;
  }
};

// update the user name 

export async function updateProfileAction(formData: FormData) {
  const user = await GetDBUser();
  if (!user) throw new Error("Unauthorized");

  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();

  if (!firstName || firstName.length < 2) {
    return { error: "First name must be at least 2 characters" };
  }

  if (!lastName || lastName.length < 2) {
    return { error: "Last name must be at least 2 characters" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { firstName, lastName },
  });

  return { success: "Profile updated successfully" };
}

// update the password

// export async function changePasswordAction(formData: FormData) {
//   const user = await GetDBUser();
//   if (!user) throw new Error("User does not exist");

//   const currentPassword = String(formData.get("currentPassword") || "");
//   const newPassword = String(formData.get("newPassword") || "");
//   const confirmPassword = String(formData.get("confirmPassword") || "");

//   if (newPassword.length < 6) {
//     return { error: "New password must be at least 6 characters" };
//   }

//   if (newPassword !== confirmPassword) {
//     return { error: "New passwords do not match" };
//   }

//   // const valid = await bcrypt.compare(currentPassword, user.password);
//   // if (!valid) {
//   //   return { error: "Current password is incorrect" };
//   // }

//   // const hashed = await bcrypt.hash(newPassword, 10);

//   await prisma.user.update({
//     where: { id: user.id },
//     data: { password: newPassword },
//   });

//   return { success: "Password changed successfully" };
// }


