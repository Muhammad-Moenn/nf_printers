"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Check, CheckCheck, FileText, Headset, LoaderCircle, MessageCircle, Paperclip, Send } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { decodeChatMessage, isImageAttachment, type ChatAttachment } from "@/lib/chat-message";
import { useUploadThing } from "@/utils/uploadthing";

type InboxMessage = {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  seen: boolean;
  attachment?: ChatAttachment;
};

type UserInfo = { name?: string; imageUrl?: string; userId: string };

export default function UserMessage({ user, conversationId, initialMessages = [] }: {
  user: UserInfo;
  conversationId: string;
  initialMessages?: InboxMessage[];
}) {
  const [messages, setMessages] = useState<InboxMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(initialMessages.length === 0);
  const [error, setError] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onUploadError: (uploadError) => setError(uploadError.message || "File upload failed. Please try again."),
  });
  const fetchingRef = useRef(false);

  const fetchMessages = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const response = await fetch("/api/user-message/get-message", { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load your messages.");
      const data = await response.json();
      if (Array.isArray(data)) {
        setMessages((current) => {
          const pending = current.filter((message) => message.id.startsWith("pending-"));
          const serverIds = new Set(data.map((message: InboxMessage) => message.id));
          const stillPending = pending.filter((message) => !data.some((serverMessage: InboxMessage) =>
            serverMessage.senderId === message.senderId &&
            serverMessage.text === message.text &&
            Math.abs(new Date(serverMessage.createdAt).getTime() - new Date(message.createdAt).getTime()) < 30_000
          ));
          const next = [...data, ...stillPending];
          if (next.length === current.length && next.every((message, index) => {
            const previous = current[index];
            return previous?.id === message.id && previous?.seen === message.seen && previous?.text === message.text;
          })) return current;
          return next;
        });
      }
      setError("");
    } catch {
      setError("We couldn’t load your messages. Please try again.");
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMessages();
    const channel = supabase
      .channel(`user-inbox-${conversationId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "Message",
        filter: `conversationId=eq.${conversationId}`,
      }, () => { void fetchMessages(); })
      .subscribe();

    // Realtime is the fast path. Poll while this tab is visible as a fallback
    // for deployments where Supabase Postgres Changes is not enabled.
    const poll = window.setInterval(() => {
      if (document.visibilityState === "visible") void fetchMessages();
    }, 3000);
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") void fetchMessages();
    };
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      window.clearInterval(poll);
      document.removeEventListener("visibilitychange", refreshOnFocus);
      void supabase.removeChannel(channel);
    };
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage(event?: FormEvent<HTMLFormElement>, attachment?: ChatAttachment) {
    event?.preventDefault();
    const trimmed = text.trim();
    if ((!trimmed && !attachment) || sending) return;

    const optimisticId = `pending-${Date.now()}`;
    const optimistic: InboxMessage = {
      id: optimisticId, text: trimmed, senderId: user.userId,
      createdAt: new Date().toISOString(), seen: false,
      attachment,
    };
    setSending(true);
    setError("");
    setText("");
    setMessages((current) => [...current, optimistic]);

    try {
      const response = await fetch("/api/user-message/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed, attachment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your message could not be sent.");
      setMessages((current) => current.map((message) => message.id === optimisticId ? data : message));
      inputRef.current?.focus();
    } catch (err) {
      setMessages((current) => current.filter((message) => message.id !== optimisticId));
      setText(trimmed);
      setError(err instanceof Error ? err.message : "Your message could not be sent.");
    } finally {
      setSending(false);
    }
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "application/pdf",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain", "text/csv", "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowedTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError("Attach an image, PDF, Word, or spreadsheet file up to 10 MB.");
      return;
    }
    setError("");
    try {
      const uploaded = await startUpload([file]);
      const uploadedFile = uploaded?.[0];
      if (!uploadedFile) return;
      await sendMessage(undefined, {
        url: uploadedFile.ufsUrl,
        key: uploadedFile.key,
        name: uploadedFile.name,
        type: uploadedFile.type,
        size: uploadedFile.size,
        uploadedBy: uploadedFile.serverData.uploadedBy,
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "File upload failed. Please try again.");
    }
  }

  const formatTime = (value: string) => new Intl.DateTimeFormat(undefined, {
    hour: "numeric", minute: "2-digit",
  }).format(new Date(value));
  const formatDay = (value: string) => new Intl.DateTimeFormat(undefined, {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  }).format(new Date(value));

  return (
    <section className="mx-auto flex h-[calc(100dvh-9.5rem)] w-full max-w-6xl min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:h-[min(780px,calc(100dvh-10rem))]">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Headset className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">Message to Admin</h1>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">Your messages go directly to our support team.</p>
          </div>
        </div>
        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Support
        </div>
      </header>

      <div
        ref={messagesContainerRef}
        tabIndex={0}
        aria-label="Conversation messages"
        className="custom-scrollbar min-h-0 flex-1 touch-pan-y overflow-x-hidden overflow-y-auto overscroll-y-contain bg-muted/30 px-3 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6 sm:py-6"
      >
        {loading ? (
          <div className="flex h-full min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" /> Loading conversation…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full min-h-56 flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><MessageCircle className="h-5 w-5" /></div>
            <p className="mt-3 text-sm font-medium text-foreground">Start a conversation</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">Send us a message and our team will get back to you here.</p>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
            {messages.map((message, index) => {
              const mine = message.senderId === user.userId;
              const prior = messages[index - 1];
              const dayChanged = !prior || new Date(prior.createdAt).toDateString() !== new Date(message.createdAt).toDateString();
              return <div key={message.id}>
                {dayChanged && <div className="mb-4 flex items-center gap-3"><span className="h-px flex-1 bg-border" /><span className="rounded-full bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm">{formatDay(message.createdAt)}</span><span className="h-px flex-1 bg-border" /></div>}
                <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                  {!mine && <div className="mb-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><Headset className="h-4 w-4" /></div>}
                  <div className={`max-w-[88%] sm:max-w-[75%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                    <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card text-foreground"}`}>
                      {(() => {
                        const content = message.attachment ? { text: message.text, attachment: message.attachment } : decodeChatMessage(message.text);
                        return <>
                          {content.attachment && (isImageAttachment(content.attachment) ? (
                            <a href={content.attachment.url} target="_blank" rel="noreferrer" className="mb-2 block overflow-hidden rounded-lg">
                              {/* Remote UploadThing URLs are user supplied chat content, so use a plain img element. */}
                              <img src={content.attachment.url} alt={content.attachment.name} className="max-h-72 max-w-full rounded-lg object-contain" loading="lazy" />
                            </a>
                          ) : (
                            <a href={content.attachment.url} target="_blank" rel="noreferrer" className={`mb-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs underline-offset-2 hover:underline ${mine ? "border-primary-foreground/20 bg-primary-foreground/10" : "border-border bg-muted"}`}>
                              <FileText className="h-4 w-4 shrink-0" /><span className="truncate">{content.attachment.name}</span>
                            </a>
                          ))}
                          {content.text && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{content.text}</p>}
                        </>;
                      })()}
                    </div>
                    <div className={`mt-1 flex items-center gap-1 text-[11px] text-muted-foreground ${mine ? "pr-1" : "pl-1"}`}>
                      <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
                      {mine && (message.seen ? <CheckCheck className="h-3.5 w-3.5 text-primary" aria-label="Seen" /> : <Check className="h-3.5 w-3.5" aria-label="Sent" />)}
                    </div>
                  </div>
                  {mine && <div className="mb-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{user.name?.trim().charAt(0).toUpperCase() || "Y"}</div>}
                </div>
              </div>;
            })}
          </div>
        )}
      </div>

      <form onSubmit={(event) => void sendMessage(event)} className="border-t border-border bg-card p-3 sm:p-4">
        {error && <p role="alert" className="mx-auto mb-2 max-w-4xl text-xs text-destructive">{error}</p>}
        <div className="mx-auto flex max-w-4xl items-end gap-2 rounded-2xl border border-input bg-background p-1.5 pl-3 shadow-sm focus-within:ring-2 focus-within:ring-ring/30">
          <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.avif,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,image/jpeg,image/png,image/gif,image/webp,image/avif,application/pdf" className="hidden" onChange={(event) => void handleFileSelected(event)} />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={sending || isUploading} aria-label="Attach an image or PDF" title="Attach image or PDF" className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50">
            {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
          </button>
          <textarea
            ref={inputRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }}
            placeholder="Type your message…"
            aria-label="Type your message"
            rows={1}
            maxLength={5000}
            disabled={isUploading}
            className="max-h-32 min-h-10 flex-1 resize-y bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" disabled={sending || isUploading || !text.trim()} aria-label="Send message" className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            {sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="mx-auto mt-2 max-w-4xl px-1 text-[11px] text-muted-foreground">Images and documents up to 10 MB · Enter to send · Shift + Enter for a new line</p>
      </form>
    </section>
  );
}
