"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, CheckCheck, FileText, Inbox, LoaderCircle, Paperclip, Search, Send, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { decodeChatMessage, isImageAttachment, type ChatAttachment } from "@/lib/chat-message";
import { useUploadThing } from "@/utils/uploadthing";

export default function AdminDashboardMessages({ user }: { user: any }) {
  const [isClient, setIsClient] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newmessage, setNewMessage] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onUploadError: (error) => setSendError(error.message || "File upload failed."),
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const refreshConversations = useCallback(async (selectFirst = false) => {
    try {
      const response = await fetch("/api/admin-message/all-conversations", {
        cache: "no-store",
      });
      if (!response.ok) return;

      const data = await response.json();
      if (!Array.isArray(data)) return;

      setConversations(data);
      setActiveConversationId((currentId) => {
        if (currentId && data.some((conversation) => conversation.id === currentId)) {
          return currentId;
        }
        return selectFirst ? data[0]?.id ?? null : null;
      });
    } catch (error) {
      console.error("Fetch conversations error:", error);
    }
  }, []);

  // Load all conversations
  useEffect(() => {
    void refreshConversations(true);
  }, [refreshConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConversationId) return;

    async function fetchMessages() {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/admin-message/all-conversations/${activeConversationId}`
        );
        if (!res.ok) return;

        const conversation = await res.json();

        // 🔹 Set messages correctly
        setMessages(conversation.messages ?? []);
        // 🔹 Mark seen
        await fetch(
          `/api/admin-message/all-conversations/${activeConversationId}/mark-seen`,
          { method: "POST" }
        );
        const lastmessage = conversation.messages.length;

        // 🔹 Reset unread count locally (no full refetch)
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === activeConversationId
              ? {
                  ...conv,
                  messages: conversation.messages?.length
                    ? [conversation.messages[lastmessage - 1]] // latest message preview
                    : [],
                  _count: { messages: 0 },
                }
              : conv
          )
        );
      } catch (err) {
        console.error("Fetch messages error:", err);
      } finally {
        setLoading(false);
      }

    }

    fetchMessages();
  }, [activeConversationId]);

  // Keep outgoing read receipts current even when Supabase Realtime is not
  // available in the deployment. This endpoint only returns id/seen pairs.
  useEffect(() => {
    if (!activeConversationId) return;
    let stopped = false;
    let requestInFlight = false;
    const refreshReadStatus = async () => {
      if (requestInFlight || document.visibilityState !== "visible") return;
      requestInFlight = true;
      try {
        const response = await fetch(
          `/api/admin-message/all-conversations/${activeConversationId}/read-status`,
          { cache: "no-store" },
        );
        if (!response.ok || stopped) return;
        const statuses = await response.json() as { id: string; seen: boolean }[];
        const statusById = new Map(statuses.map((message) => [message.id, message.seen]));
        setMessages((current) => current.map((message) => statusById.has(message.id)
          ? { ...message, seen: statusById.get(message.id)! }
          : message));
      } catch (error) {
        console.error("Refresh message read status error:", error);
      } finally {
        requestInFlight = false;
      }
    };
    void refreshReadStatus();
    const interval = window.setInterval(() => void refreshReadStatus(), 5000);
    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [activeConversationId]);

  // ✅ SUPABASE REALTIME SUBSCRIPTION
  // useEffect(() => {
  //   if (!activeConversationId) return;

  //   const channel = supabase
  //     .channel("messages-listener")
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "INSERT",
  //         schema: "public",
  //         table: "Message",
  //       },
  //       async (payload) => {
  //         try {
  //           setLoading(true);
  //           const latestMge = await getLatestMessageOverall();
  //           const conversationId = latestMge?.conversation.id;
  //           console.log("🔥 New message in conversation:", conversationId);
  //           // 🔹 Fetch latest message from your API
  //           const res = await fetch(
  //             `/api/admin-message/latest-message/${conversationId}`
  //           );

  //           if (!res.ok) return;

  //           const latestMessage = await res.json();

  //           // 🔹 Update sidebar conversations (badge + preview + move to top)
  //           setConversations((prev) => {
  //             const updated = prev.map((conv) => {
  //               if (conv.id !== conversationId) return conv;

  //               const isFromUser = latestMessage.senderId !== user.userId;

  //               return {
  //                 ...conv,
  //                 messages: [latestMessage], // update preview
  //                 _count: {
  //                   messages:
  //                     conversationId === activeConversationId
  //                       ? 0 // reset if open
  //                       : isFromUser
  //                       ? (conv._count?.messages ?? 0) + 1
  //                       : conv._count?.messages ?? 0,
  //                 },
  //                 updatedAt: new Date().toISOString(),
  //               };
  //             });

  //             // Move updated conversation to top
  //             return updated.sort(
  //               (a, b) =>
  //                 new Date(b.updatedAt).getTime() -
  //                 new Date(a.updatedAt).getTime()
  //             );
  //           });

  //           // 🔹 If active conversation → append message
  //           if (conversationId === activeConversationId) {
  //             setMessages((prev) => {
  //               if (prev.some((m) => m.id === latestMessage.id)) return prev;
  //               return [...prev, latestMessage];
  //             });

  //             // Mark as seen in DB
  //             await fetch(
  //               `/api/admin-message/all-conversations/${activeConversationId}/mark-seen`,
  //               { method: "POST" }
  //             );

  //             bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  //           }
  //         } catch (error) {
  //           console.error("Realtime error:", error);
  //         } finally {
  //           setLoading(false);
  //         }
  //       }
  //     )
  //     .subscribe();

  //   return () => {
  //     supabase.removeChannel(channel);
  //   };
  // }, [activeConversationId, user.userId]);

  useEffect(() => {
    const channel = supabase
      .channel("messages-listener")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Message" },
        async (payload) => {
          // console.log("Event:", payload.eventType);

          if (payload.eventType === "INSERT") {
            if (!activeConversationId) return;

            try {
              // 🔹 Fetch all conversations ONCE
              const res = await fetch("/api/admin-message/all-conversations");
              if (!res.ok) return;

              const updatedConversations = await res.json();

              // 🔹 Sort by latest message
              const sorted = [...updatedConversations].sort((a, b) => {
                const aTime = a.messages?.[0]?.createdAt ?? 0;
                const bTime = b.messages?.[0]?.createdAt ?? 0;
                return new Date(bTime).getTime() - new Date(aTime).getTime();
              });

              setConversations(sorted);

              // 🔹 Find active conversation from NEW data (not old state)
              const activeConv = sorted.find(
                (c: any) => c.id === activeConversationId
              );

              if (!activeConv) return;

              const latestMessage = activeConv.messages?.[0];
              if (!latestMessage) return;

              // 🔹 Append if not exists
              setMessages((prev) => {
                if (prev.some((m) => m.id === latestMessage.id)) return prev;
                return [...prev, latestMessage];
              });

              messagesContainerRef.current?.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: "smooth" });

              // 🔹 Mark seen only if from other user
              if (latestMessage.senderId !== user.userId) {
                await fetch(
                  `/api/admin-message/all-conversations/${activeConversationId}/mark-seen`,
                  { method: "POST" }
                );

                // 🔹 Update unread count locally instead of refetching again
                setConversations((prev) =>
                  prev.map((conv) =>
                    conv.id === activeConversationId
                      ? { ...conv, _count: { messages: 0 } }
                      : conv
                  )
                );
              }
            } catch (err) {
              console.error("Realtime error:", err);
            }
          }

          if (payload.eventType === "UPDATE") {
            if (!activeConversationId) return;
            const updatedMessage = payload.new as { id: string; conversationId: string; seen: boolean };
            if (updatedMessage.conversationId !== activeConversationId) return;
            setMessages((previous) => previous.map((message) => message.id === updatedMessage.id
              ? { ...message, seen: updatedMessage.seen }
              : message));
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void refreshConversations(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, user.userId]);

  //   useEffect(() => {
  //     const channel = supabase
  //       .channel("messages-listener")
  //       .on(
  //         "postgres_changes",
  //         { event: "INSERT", schema: "public", table: "Message" },
  //         async () => {
  //           try {
  //             setLoading(true);
  //             8;

  //             // 🔹 Step 1: Get latest updated conversation id
  //             const res = await fetch("/api/admin-message/latest-converstaion");
  //             if (!res.ok) return;
  //             const latestConversation = await res.json();
  //             const conversationId = latestConversation.id;
  //             console.log("🔥 New message in conversation:", conversationId);
  //             if (!conversationId) return;
  //             // 🔹 Step 2: Fetch only that conversation
  //             const convRes = await fetch(
  //               `/api/admin-message/all-conversations/${conversationId}`
  //             );
  //             if (!convRes.ok) return;
  //             const updatedConversation = await convRes.json();

  //             // 🔹 Step 3: Update conversation in sidebar list
  //           setConversations((prev) => {
  //   if (!updatedConversation?.id) return prev;

  //   const exists = prev.some((c) => c.id === updatedConversation.id);

  //   let newConversations;
  //   if (exists) {
  //     newConversations = prev.map((conv) => {
  //       if (conv.id !== updatedConversation.id) return conv;

  //       // compute new unread count
  //       const oldUnread = conv._count?.messages ?? 0;
  //       const latestMsg = updatedConversation.messages?.[0];
  //       const isFromOtherUser = latestMsg?.senderId !== user.userId;

  //       return {
  //         ...conv,
  //         ...updatedConversation,
  //         _count: {
  //           messages:
  //             conv.id === activeConversationId
  //               ? 0 // reset if active
  //               : isFromOtherUser
  //               ? oldUnread + 1
  //               : oldUnread,
  //         },
  //       };
  //     });
  //   } else {
  //     newConversations = [
  //       {
  //         ...updatedConversation,
  //         _count: {
  //           messages:
  //             updatedConversation.messages?.[0]?.senderId !== user.userId &&
  //             updatedConversation.id !== activeConversationId
  //               ? 1
  //               : 0,
  //         },
  //       },
  //       ...prev,
  //     ];
  //   }

  //   // remove duplicates
  //   const uniqueConversations = Array.from(
  //     new Map(newConversations.map((c) => [c.id, c])).values()
  //   );

  //   return uniqueConversations;
  // });

  //             // 🔹 Step 4: If active conversation, append latest message
  //             if (conversationId === activeConversationId) {
  //               // Ensure messages are sorted descending (latest first)
  //               const latestMessage = updatedConversation.messages?.[0];
  //               if (!latestMessage) return;

  //               setMessages((prev) => {
  //                 if (prev.some((m) => m.id === latestMessage.id)) return prev;
  //                 return [...prev, latestMessage];
  //               });

  //               bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  //               // 🔹 Mark as seen only if from other user
  //               if (latestMessage.senderId !== user.userId) {
  //                 await fetch(
  //                   `/api/admin-message/all-conversations/${activeConversationId}/mark-seen`,
  //                   { method: "POST" }
  //                 );
  //               }
  //             }
  //           } catch (err) {
  //             console.error("Realtime insert error:", err);
  //           } finally {
  //             setLoading(false);
  //           }
  //         }
  //       )
  //       .subscribe();

  //     return () => {
  //       supabase.removeChannel(channel);
  //     };
  //   }, [activeConversationId, user.userId]);


  useEffect(() => {
    if (!activeConversationId) return;

    const channel = supabase
      .channel("conversation-listener")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Conversation",
        },
        async (payload) => {
          // console.log("🔥 CHANGE DETECTED for conversation:", payload);

          try {
            setLoading(true);

            const res = await fetch(`/api/admin-message/latest-converstaion`);
            const data = await res.json();
            //  console.log("🔥latest conversation:", payload);
            setConversations((prev) => {
              if (prev.some((c) => c.id === data.id)) return prev;
              return [...prev, data];
            });
          } catch (error) {
            console.error("Fetch error:", error);
          } finally {
            setLoading(false);
          }
        }
      )
      .subscribe((status) => {
        // console.log("Subscription Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-new-conversation-listener")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Conversation",
        },
        () => {
          void refreshConversations(true);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          void refreshConversations(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshConversations]);

  async function sendMessage(attachment?: ChatAttachment) {
    const messageText = text.trim();
    if ((!messageText && !attachment) || !activeConversationId || loading) return;

    const optimisticId = `pending-${Date.now()}`;
    const optimisticMessage = {
      id: optimisticId, text: messageText, attachment, senderId: user.userId,
      createdAt: new Date().toISOString(), seen: false,
    };
    const targetConversationId = activeConversationId;
    setLoading(true);
    setSendError("");
    setText("");
    setMessages((previous) => [...previous, optimisticMessage]);

    try {
      const response = await fetch(`/api/admin-message/all-conversations/${targetConversationId}/send-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: messageText, attachment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send message.");
      setMessages((previous) => previous.some((message) => message.id === data.id)
        ? previous.filter((message) => message.id !== optimisticId)
        : previous.map((message) => message.id === optimisticId ? data : message));
    } catch (error) {
      setMessages((previous) => previous.filter((message) => message.id !== optimisticId));
      setText((current) => current || messageText);
      setSendError(error instanceof Error ? error.message : "Failed to send message.");
    } finally {
      setLoading(false);
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
      setSendError("Attach an image, PDF, Word, or spreadsheet file up to 10 MB.");
      return;
    }
    setSendError("");
    try {
      const uploaded = await startUpload([file]);
      const uploadedFile = uploaded?.[0];
      if (!uploadedFile) return;
      await sendMessage({
        url: uploadedFile.ufsUrl, key: uploadedFile.key, name: uploadedFile.name,
        type: uploadedFile.type, size: uploadedFile.size,
        uploadedBy: uploadedFile.serverData.uploadedBy,
      });
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "File upload failed.");
    }
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const visibleConversations = conversations.filter((conversation) => {
    const query = conversationSearch.trim().toLowerCase();
    if (!query) return true;

    return [
      conversation.user?.firstName,
      conversation.user?.lastName,
      conversation.user?.email,
      conversation.messages?.[0]?.text ? decodeChatMessage(conversation.messages[0].text).text : "",
    ].some((value) => value?.toLowerCase().includes(query));
  });

  async function deleteConversation(conversationId: string) {
    const conversation = conversations.find((item) => item.id === conversationId);
    const name = conversation?.user
      ? `${conversation.user.firstName ?? ""} ${conversation.user.lastName ?? ""}`.trim()
      : "this conversation";
    if (!window.confirm(`Delete the conversation with ${name || "this user"} and all its messages?`)) {
      return;
    }

    setDeletingConversationId(conversationId);
    try {
      const response = await fetch(
        `/api/admin-message/all-conversations/${conversationId}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error ?? "Unable to delete conversation.");
      }

      const remaining = conversations.filter((item) => item.id !== conversationId);
      setConversations(remaining);
      if (activeConversationId === conversationId) {
        setActiveConversationId(remaining[0]?.id ?? null);
        setMessages([]);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete conversation.");
    } finally {
      setDeletingConversationId(null);
    }
  }
  if (!isClient) return null;

  return (
    <div className="flex h-[calc(100dvh-5rem)] max-h-screen min-h-[500px] w-full min-w-0 flex-col p-3 sm:p-5 lg:p-6">
      <header className="mb-5 -mt-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary-text dark:bg-primary/15 dark:text-primary-soft-foreground">
          <Inbox className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground dark:text-neutral-100">Inbox</h1>
          <p className="text-sm text-muted-foreground dark:text-neutral-400">View and reply to customer conversations</p>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(140px,0.7fr)_minmax(260px,1.3fr)] gap-3 sm:gap-4 lg:grid-cols-12 lg:grid-rows-1">
        {/* Sidebar */}
        <Card className="flex min-h-0 flex-col overflow-hidden rounded-lg border-border bg-card p-0 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface-2)] lg:col-span-4">
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4 dark:border-[var(--border)] dark:bg-[var(--surface-3)]">
            <div>
              <h2 className="text-sm font-semibold text-foreground dark:text-neutral-100">Conversations</h2>
              <p className="mt-0.5 text-xs text-muted-foreground dark:text-neutral-400">{conversations.length} total</p>
            </div>
            <span className="rounded-badge bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary-text dark:bg-primary/15 dark:text-primary-soft-foreground">
              {conversations.reduce((count, conversation) => count + (conversation._count?.messages ?? 0), 0)} unread
            </span>
          </div>
          <CardContent className="flex h-full min-h-0 flex-col gap-2 p-3 sm:p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              value={conversationSearch}
              onChange={(event) => setConversationSearch(event.target.value)}
              placeholder="Search conversations..."
              className="h-9 border-border bg-card pl-9 text-sm dark:border-[var(--input)] dark:bg-[var(--surface-1)] dark:text-neutral-100 dark:placeholder:text-muted-foreground"
            />
            </div>
            <ScrollArea aria-label="Conversation list" className="mt-1 min-h-0 w-full flex-1">
              <div className="space-y-1">
              {visibleConversations.map((conv) => {
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors 
                    ${
                      activeConversationId === conv.id
                        ? "border-primary-border bg-primary-soft dark:border-primary/30 dark:bg-[var(--surface-4)]"
                        : "border-transparent hover:bg-surface-2 dark:hover:bg-[var(--surface-3)]"
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={conv.user?.avatarUrl || ""} />
                      <AvatarFallback className="bg-primary-soft font-semibold text-primary-text dark:bg-[var(--surface-4)] dark:text-primary-soft-foreground">
                        {conv.user?.firstName?.charAt(0) ||
                          conv.user?.email?.charAt(0)}

                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="line-clamp-1 text-sm font-semibold text-foreground dark:text-neutral-100">
                        {conv.user?.firstName} {conv.user?.lastName}
                      </p>
                      <p className="line-clamp-1 text-xs text-muted-foreground dark:text-neutral-400">
                        {conv?.messages?.[0]?.text
                          ? decodeChatMessage(conv.messages[0].text).text || (decodeChatMessage(conv.messages[0].text).attachment ? "Attachment" : "")
                          : ""}

                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {conv._count?.messages > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-badge bg-primary px-1.5 text-[10px] font-bold text-on-color">
                          {conv._count?.messages}
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={`Delete conversation with ${conv.user?.firstName ?? "user"}`}
                        title="Delete conversation"
                        disabled={deletingConversationId === conv.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          void deleteConversation(conv.id);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-destructive-soft hover:text-destructive-text disabled:opacity-50 dark:text-muted-foreground dark:hover:bg-destructive/10 dark:hover:text-destructive-soft-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {!visibleConversations.length && (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground dark:text-neutral-400">No conversations found.</p>
              )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex min-h-0 flex-col overflow-hidden rounded-lg border-border bg-card p-0 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface-2)] lg:col-span-8">
          <CardContent className="flex h-full min-h-0 flex-col p-0">
            {/* Header */}
            <div className="flex min-h-[72px] items-center gap-3 border-b border-border-subtle bg-card px-4 py-3 dark:border-[var(--border)] dark:bg-[var(--surface-3)] sm:px-5">
              {activeConversation && (
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activeConversation.user?.avatarUrl || ""} />
                  <AvatarFallback className="bg-primary-soft font-semibold text-primary-text dark:bg-[var(--surface-4)] dark:text-primary-soft-foreground">
                    {activeConversation.user?.firstName?.charAt(0) || activeConversation.user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground dark:text-neutral-100">
                {activeConversation?.user.firstName}{" "}
                {activeConversation?.user.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground dark:text-neutral-400">
                {activeConversation?.user.email}
              </p>
              </div>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} tabIndex={0} aria-label="Conversation messages" className="custom-scrollbar min-h-0 flex-1 space-y-4 touch-pan-y overflow-x-hidden overflow-y-auto overscroll-y-contain bg-surface-2/70 px-3 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:bg-[var(--surface-1)] sm:px-6">
              {!activeConversation && (
                <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary-text dark:bg-primary/15 dark:text-primary-soft-foreground">
                    <Inbox className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-foreground dark:text-neutral-200">Select a conversation</p>
                  <p className="mt-1 text-xs text-muted-foreground dark:text-neutral-400">Choose a customer from the list to view messages.</p>
                </div>
              )}
              {messages?.map((msg) => {

                const date = formatTime(msg.createdAt);
                const content = msg.attachment
                  ? { text: msg.text, attachment: msg.attachment }
                  : decodeChatMessage(msg.text);
                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === user.userId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div>
                      <div
                        className={`max-w-[85%] min-w-[150px] sm:max-w-md px-3 py-[8px] pb-1 sm:px-4 sm:pr-3 sm:py-[10px] sm:pb-1 rounded-lg text-xs sm:text-sm shadow-sm  ml-auto ${

                          msg.senderId === user.userId
                            ? "bg-primary text-on-color dark:bg-primary"
                            : "border border-border bg-card text-foreground dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-100"
                        }`}
                      >
                        {content.attachment && (isImageAttachment(content.attachment) ? (
                          <a href={content.attachment.url} target="_blank" rel="noreferrer" className="mb-2 block overflow-hidden rounded-lg">
                            <img src={content.attachment.url} alt={content.attachment.name} className="max-h-72 max-w-full rounded-lg object-contain" loading="lazy" />
                          </a>
                        ) : (
                          <a href={content.attachment.url} target="_blank" rel="noreferrer" className="mb-2 flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs underline-offset-2 hover:underline">
                            <FileText className="h-4 w-4 shrink-0" /><span className="truncate">{content.attachment.name}</span>
                          </a>
                        ))}
                        {content.text && <p className="whitespace-pre-wrap break-words text-[16px]">{content.text}</p>}

                        <span
                          className={`text-[10px] opacity-70 flex block  ml-auto justify-end gap-1 text-right ${
                            msg.senderId === user.userId
                              ? "text-primary-soft-foreground"
                              : "text-muted-foreground dark:text-neutral-400"
                          }`}
                        >
                          {date}
                          {msg.senderId === user.userId && (msg.seen
                            ? <CheckCheck className="h-4 w-4 text-primary-foreground" aria-label="Seen by user" />
                            : <Check className="h-4 w-4 text-primary-foreground/70" aria-label="Sent" />)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }) || null}

            </div>
            {/* Input */}
            <form onSubmit={(event) => { event.preventDefault(); void sendMessage(); }} className="border-t border-border-subtle bg-card p-3 dark:border-[var(--border)] dark:bg-[var(--surface-3)] sm:p-4">
              {sendError && <p role="alert" className="mb-2 text-xs text-destructive">{sendError}</p>}
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp,.avif,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,image/jpeg,image/png,image/gif,image/webp,image/avif,application/pdf" className="hidden" onChange={(event) => void handleFileSelected(event)} />
                <Button type="button" variant="outline" size="icon" aria-label="Attach an image or document" title="Attach an image or document" onClick={() => fileInputRef.current?.click()} disabled={loading || isUploading || !activeConversationId}>
                  {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                </Button>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message..."
                  disabled={isUploading}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
                  className="h-9 border-border bg-card dark:border-[var(--input)] dark:bg-[var(--surface-1)] dark:text-neutral-100 dark:placeholder:text-muted-foreground"
                />
                <Button type="submit" disabled={loading || isUploading || !text.trim()}>
                  {loading ? <LoaderCircle size={18} className="animate-spin" /> : <Send size={18} />}
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Images and documents up to 10 MB · Enter to send</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
