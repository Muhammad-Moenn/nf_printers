"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Send } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboardMessages({ user }: { user: any }) {
  const [isClient, setIsClient] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newmessage, setNewMessage] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load all conversations
  useEffect(() => {
    async function fetchConversations() {
      const res = await fetch("/api/admin-message/all-conversations");
      const data = await res.json();
      setConversations(data);

      if (data.length > 0) {
        setActiveConversationId(data[0].id);
        await fetch(
          `/api/admin-message/all-conversations/${data[0].id}/mark-seen`,
          { method: "POST" }
        );

      }
    }

    fetchConversations();
  }, []);

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
          console.log("Event:", payload.eventType);

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

              bottomRef.current?.scrollIntoView({ behavior: "smooth" });

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
            const updatedMessage = payload.new as any;

            // Only update if the updated message is in the active conversation
            // if (updatedMessage.conversationId !== activeConversationId) return;
            setMessages((prev) => [
              // First update old messages
              ...prev.map((msg) => ({
                ...msg,
                seen: msg.seen === false ? true : msg.seen,
              })),

             
            ]);
          }
        }
      )
      .subscribe();

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

  async function sendMessage() {
    if (!text.trim() || !activeConversationId) return;

    setLoading(true);

    const res = await fetch(

      `/api/admin-message/all-conversations/${activeConversationId}/send-message`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }
    );
    if (!res.ok) {
      throw new Error("Failed to send message");
    }

    const newMessage = await res.json(); // <-- get actual data

    setMessages((prev) => {
      // prevent duplicate messages
      if (prev.some((m) => m.id === newMessage.id)) return prev;
      return [...prev, newMessage];
    });

    setText("");
    setLoading(false);
    // ❌ No refetch needed — realtime handles it
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
  if (!isClient) return null;

  return (
    <div className="h-full w-full p-6 bg-gray-100">
      <div className="grid grid-cols-12 gap-4 h-[90%] max-h-[90%]">
        {/* Sidebar */}
        <Card className="col-span-4 flex flex-col h-full bg-white dark:bg-gray-800">
          <CardContent className="p-2 flex flex-col gap-2 h-full">
            <Input
              placeholder="Search conversations..."
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <ScrollArea className="flex-1 min-h-0 mt-2">
              {conversations.map((conv) => {
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer 
                    ${
                      activeConversationId === conv.id
                        ? "bg-gray-200 dark:bg-gray-700"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={conv.user?.avatarUrl || ""} />
                      <AvatarFallback>
                        {conv.user?.firstName?.charAt(0) ||
                          conv.user?.email.charAt(0)}

                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col w-full">
                      <p className="font-medium line-clamp-1">
                        {conv.user?.firstName} {conv.user?.lastName}
                      </p>
                      <p className="text-sm opacity-60 line-clamp-1">
                        {conv?.messages?.[0]?.text}

                      </p>
                    </div>
                    {conv._count?.messages > 0 && (
                      <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {conv._count?.messages}

                      </span>
                    )}
                  </div>
                );
              })}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-8 flex flex-col h-full bg-white dark:bg-gray-800">
          <CardContent className="flex flex-col h-full p-0">
            {/* Header */}
            <div className="p-4 border-b border-gray-300 dark:border-gray-700">
              <p className="font-semibold">
                {activeConversation?.user.firstName}{" "}
                {activeConversation?.user.lastName}
              </p>
              <p className="text-sm opacity-60">
                {activeConversation?.user.email}
              </p>
            </div>

            {/* Messages */}
            {/* <ScrollArea className="flex-1 min-h-0 px-4 py-4 space-y-4 bg-gray-50 dark:bg-gray-950 scroll-y-auto max-h-[60vh]">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === activeConversation?.user.id ? "justify-start" : "justify-end"}`}
                >
                  <div className={`p-4 rounded-2xl max-w-md shadow ${msg.senderId === activeConversation?.user.id ? "bg-gray-200 dark:bg-gray-700" : "bg-blue-600 text-white"}`}>
                    <p>{msg.text}</p>
                    <span className="text-xs opacity-60 block mt-1">{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </ScrollArea> */}
            <div className="min-h-[70vh]  overflow-y-auto px-3 sm:px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-950">
              {messages?.map((msg) => {

                const date = formatTime(msg.createdAt);
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
                            ? "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white"
                            : "dark:bg-gray-300 bg-gray-800 dark:text-gray-900 text-white"
                        }`}
                      >
                        <p className="text-[16px]">{msg.text}</p>

                        <span
                          className={`text-[10px] opacity-70 flex block  ml-auto justify-end gap-1 text-right ${
                            msg.senderId === user.userId
                              ? "text-gray-600 dark:text-gray-200"
                              : "text-gray-200 dark:text-gray-800"
                          }`}
                        >
                          {date}
                          {msg.senderId === user.userId && (
                            <Check
                              className={`w-4 h-4  ${

                                msg.seen ? "text-blue-600" : ""
                              }`}
                            />
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }) || null}

              <div ref={bottomRef} />
            </div>
            {/* Input */}
            <div className="p-4 border-t flex gap-3 border-gray-300 dark:border-gray-700">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Button onClick={sendMessage} disabled={loading}>
                {" "}
                <Send size={18} />{" "}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
