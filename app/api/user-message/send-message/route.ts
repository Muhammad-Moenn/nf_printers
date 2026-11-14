import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateAdminMessageCaches } from "@/lib/cache/invalidate";
import { GetDBUser } from "@/app/actions/user_action";
import { isUserUploadOwner } from "@/lib/auth";
import { encodeChatMessage, type ChatAttachment } from "@/lib/chat-message";

export async function POST(req: Request) {
  try {
    const dbUser = await GetDBUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, attachment } = await req.json() as { text?: string; attachment?: ChatAttachment };
    const messageText = typeof text === "string" ? text.trim() : "";
    let validatedAttachment: ChatAttachment | undefined;

    if (attachment !== undefined) {
      if (!attachment || typeof attachment.url !== "string" || typeof attachment.key !== "string" ||
          typeof attachment.name !== "string" || typeof attachment.type !== "string" ||
          typeof attachment.size !== "number" || attachment.size < 1 || attachment.size > 10 * 1024 * 1024 ||
          !(await isUserUploadOwner(attachment.uploadedBy, dbUser.id))) {
        return NextResponse.json({ error: "Invalid attachment" }, { status: 400 });
      }
      let attachmentUrl: URL;
      try { attachmentUrl = new URL(attachment.url); }
      catch { return NextResponse.json({ error: "Invalid attachment URL" }, { status: 400 }); }
      const trustedHost = attachmentUrl.protocol === "https:" &&
        (attachmentUrl.hostname === "utfs.io" || attachmentUrl.hostname.endsWith(".ufs.sh"));
      const allowedType = [
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "application/pdf",
        "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain", "text/csv", "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ].includes(attachment.type);
      if (!trustedHost || !allowedType || attachment.name.length > 255 || attachment.key.length > 200) {
        return NextResponse.json({ error: "Unsupported attachment" }, { status: 400 });
      }
      validatedAttachment = {
        url: attachmentUrl.toString(), key: attachment.key, name: attachment.name,
        type: attachment.type, size: attachment.size,
      };
    }

    if (!messageText && !validatedAttachment) {
      return NextResponse.json(
        { error: "Message or attachment required" },
        { status: 400 }
      );
    }
    if (messageText.length > 5000) {
      return NextResponse.json({ error: "Message is too long" }, { status: 400 });
    }

    // Use the authenticated database user directly; avoid a second user lookup
    // and loading the full conversation history for a send operation.
    const conversation = await prisma.conversation.upsert({
      where: { userId: dbUser.id },
      update: {},
      create: { userId: dbUser.id, adminId: process.env.ADMIN_ID },
      select: { id: true },
    });
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: dbUser.id,  
        text: encodeChatMessage(messageText, validatedAttachment),
        receiverId: process.env.ADMIN_ID!,

      },
    });
    await invalidateAdminMessageCaches();
    return NextResponse.json(message, {
      headers: { "Cache-Control": "no-store" },
    });


  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
