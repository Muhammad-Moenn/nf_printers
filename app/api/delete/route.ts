import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();
export async function POST(req: Request) {
  const { key } = await req.json();

  if (!key) {
    return NextResponse.json({ error: "Missing file key" }, { status: 400 });
  }

  await utapi.deleteFiles(key);

  return NextResponse.json({ success: true });
}
