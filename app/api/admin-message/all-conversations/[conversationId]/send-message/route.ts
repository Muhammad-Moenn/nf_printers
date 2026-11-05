// app/api/admin/conversations/[conversationId]/send/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GetDBUser } from "@/app/actions/user_action";
import { isUserUploadOwner } from "@/lib/auth";
import { encodeChatMessage, type ChatAttachment } from "@/lib/chat-message";

interface Params {
  params: Promise<{ conversationId: string }>;
}

export async function POST(req: Request, { params }: Params) {
  const dbUser = await GetDBUser();
  if (!dbUser || dbUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { conversationId } = await params;
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
    return NextResponse.json({ error: "Message or attachment required" }, { status: 400 });
  }
  if (messageText.length > 5000) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400 });
  }
 const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  // 2️⃣ Receiver is the customer (since admin is sender)
  const receiverId = conversation.userId;

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: dbUser.id,
      text: encodeChatMessage(messageText, validatedAttachment),
      receiverId,
    },
  });

  return NextResponse.json(message);
}
