export type ChatAttachment = {
  url: string;
  key: string;
  name: string;
  type: string;
  size: number;
  uploadedBy?: string;
};

const ATTACHMENT_PREFIX = "[[chat-attachment:v1]]";

export function encodeChatMessage(text: string, attachment?: ChatAttachment) {
  if (!attachment) return text;
  return `${ATTACHMENT_PREFIX}${JSON.stringify({ text, attachment })}`;
}

export function decodeChatMessage(value: string): { text: string; attachment?: ChatAttachment } {
  if (!value.startsWith(ATTACHMENT_PREFIX)) return { text: value };
  try {
    const parsed = JSON.parse(value.slice(ATTACHMENT_PREFIX.length));
    if (typeof parsed?.attachment?.url !== "string" || typeof parsed?.attachment?.name !== "string") {
      return { text: value };
    }
    return {
      text: typeof parsed.text === "string" ? parsed.text : "",
      attachment: parsed.attachment as ChatAttachment,
    };
  } catch {
    return { text: value };
  }
}

export function isImageAttachment(attachment: ChatAttachment) {
  return attachment.type.startsWith("image/");
}
