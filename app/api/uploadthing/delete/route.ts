import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { z } from "zod";
import { GetDBUser } from "@/app/actions/user_action";
import { prisma } from "@/lib/prisma";

export const utapi = new UTApi();
export async function POST(req: Request) {
  const user = await GetDBUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = z.object({ key: z.string().min(1).max(200) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Missing file key" }, { status: 400 });
  }

  const { key } = parsed.data;
  const temporaryUpload = await prisma.uploadedFile.findFirst({
    where: { key, userId: user.id },
  });
  const savedDesign = await prisma.designs.findFirst({
    where: { key, userId: user.id },
    select: { id: true },
  });
  if (!temporaryUpload && !savedDesign) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const orders = await prisma.order.findMany({ where: { userId: user.id }, select: { designs: true } });
  const referencedByOrder = orders.some((order) =>
    Array.isArray(order.designs) && order.designs.some((item) =>
      item && typeof item === "object" && !Array.isArray(item) &&
      (item as Record<string, unknown>).key === key
    )
  );
  if (referencedByOrder) {
    await prisma.uploadedFile.deleteMany({ where: { key, userId: user.id } });
    return NextResponse.json({ success: true });
  }

  await utapi.deleteFiles(key);
  await prisma.uploadedFile.deleteMany({ where: { key, userId: user.id } });
  if (savedDesign) await prisma.designs.deleteMany({ where: { key, userId: user.id } });

  return NextResponse.json({ success: true });
}
