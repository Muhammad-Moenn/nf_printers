import { GetDBUser } from "@/app/actions/user_action";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ designId: string }> }
) {
  const user = await GetDBUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { designId } = await params;
  const design = await prisma.designs.findFirst({
    where: { id: designId, userId: user.id },
    select: { url: true, key: true },
  });
  if (!design) return NextResponse.json({ error: "Design not found" }, { status: 404 });

  try {
    const fileUrl = new URL(design.url);
    if (fileUrl.protocol !== "https:" ||
      !(fileUrl.hostname === "utfs.io" || fileUrl.hostname.endsWith(".ufs.sh"))) {
      return NextResponse.json({ error: "Invalid design file URL" }, { status: 400 });
    }
    const fileResponse = await fetch(design.url, { cache: "no-store" });
    if (!fileResponse.ok || !fileResponse.body) {
      return NextResponse.json({ error: "Unable to download this design" }, { status: 502 });
    }

    const requestedName = new URL(request.url).searchParams.get("name");
    const keyName = design.key.split("/").pop() || "design-file";
    const fileName = (requestedName || keyName).replace(/[\\/\r\n]/g, "_");
    return new Response(fileResponse.body, {
      headers: {
        "Content-Type": fileResponse.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to download this design" }, { status: 502 });
  }
}
