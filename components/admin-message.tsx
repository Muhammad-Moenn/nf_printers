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
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newmessage, setNewMessage] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

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
      setLoading(true);
      const res = await fetch(
        `/api/admin-message/all-conversations/${activeConversationId}`
      );
      const data = await res.json();
      setMessages(data);
      setLoading(false);

      await fetch(
        `/api/admin-message/all-conversations/${activeConversationId}/mark-seen`,
        { method: "POST" }
      );
      // const res2 = await fetch("/api/admin-message/all-conversations");
      //     if (!res2.ok) return;

      //     const updatedConversations = await res2.json();
      //     setConversations(updatedConversations);
           setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? { ...conv, _count: { messages: 0 }, messages: data }
            : conv
        )
      );
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
      { event: "INSERT", schema: "public", table: "Message" },
      async () => {
        try {
          setLoading(true);

          // 🔹 Refetch all conversations with updated _count
          const res = await fetch("/api/admin-message/all-conversations");
          if (!res.ok) return;

          const updatedConversations = await res.json();
          setConversations(updatedConversations);

          // 🔹 If active conversation, append the latest message
          const activeConv = updatedConversations.find(
            (c: any) => c.id === activeConversationId
          );
          if (!activeConv) return;

          const latestMessage = activeConv.messages[0];
          if (!latestMessage) return;

          // Append only if it's from the other user
          if (latestMessage.id && latestMessage.senderId !== user.userId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === latestMessage.id)) return prev;
              return [...prev, latestMessage];
            });

            bottomRef.current?.scrollIntoView({ behavior: "smooth" });

            // 🔹 Mark messages as seen, but no await in cleanup
            await fetch(
              `/api/admin-message/all-conversations/${activeConversationId}/mark-seen`,
              { method: "POST" }
            );
            const res = await fetch("/api/admin-message/all-conversations");
          if (!res.ok) return;

          const updatedConversations = await res.json();
          setConversations(updatedConversations);
          }
        } catch (err) {
          console.error("Realtime fetch error:", err);
        } finally {
          setLoading(false);
        }
      }
    )
    .subscribe();

  // 🔹 Synchronous cleanup
  return () => {
    supabase.removeChannel(channel);
  };
}, [activeConversationId, user.userId]);

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

    await fetch(
      `/api/admin-message/all-conversations/${activeConversationId}/send-message`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }
    );

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
                      <AvatarImage src={conv.user.avatarUrl || ""} />
                      <AvatarFallback>
                        {conv.user.firstName?.charAt(0) ||
                          conv.user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col w-full">
                      <p className="font-medium line-clamp-1">
                        {conv.user.firstName} {conv.user.lastName}
                      </p>
                      <p className="text-sm opacity-60 line-clamp-1">
                        {conv.messages[0]?.text}
                      </p>
                    </div>
                    {conv._count?.messages > 0 && (
                      <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {conv._count.messages}
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
              {messages.map((msg) => {
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
                        className={`max-w-[85%] min-w-[150px] sm:max-w-md px-3 py-[8px] pb-1 sm:px-5 sm:py-[10px] sm:pb-1 rounded-xl text-xs sm:text-sm shadow-sm break-words ml-auto ${
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
                              className={`w-3 h-3  ${
                                msg.seen ? "text-blue-600" : ""
                              }`}
                            />
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
