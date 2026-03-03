"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, Send } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function UserMessage({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  async function fetchMessages() {
    const res = await fetch("/api/user-message/get-message");
    const data = await res.json();
    setMessages(data);
    // console.log("Fetched messages:", data);
  }

  async function SendMessage() {
    if (!text.trim()) return;
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        text: text,
        senderId: user.userId, // use a different senderId to distinguish from actual messages
        createdAt: new Date().toISOString(),
        seen: false,
        id: user.id + "-" + Math.random().toString(36).substr(2, 9), // add a temporary unique id for React key
      },
    ]);
    const res = await fetch("/api/user-message/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Error:", data.error);
      return;
    }
    setText("");
    fetchMessages();
    setLoading(false);
  }

  useEffect(() => {
    fetchMessages();
    setText("");
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("messages-listener")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Message" },
        (payload) => {
          console.log("Event:", payload.eventType);

          if (payload.eventType === "INSERT") {
            fetchMessages();
          }

          if (payload.eventType === "UPDATE") {
            // fetchMessages();
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
  }, []);
  function formatTime(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-full w-full bg-gray-100 dark:bg-gray-950 transition-colors duration-300 flex items-center justify-center p-2 sm:p-4 md:p-6 md:py-0">
      <Card className="w-full h-full sm:h-[95vh] md:max-w-full rounded-none sm:rounded-3xl shadow-none sm:shadow-xl flex flex-col gap-0 bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center gap-3 p-3  border-b border-gray-200 dark:border-gray-800">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
              {user?.name}
            </p>
            <p className="text-xs sm:text-sm text-green-500">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-950">
          {messages.map((msg) => {
            const date = formatTime(msg.createdAt);
            return (
              <div
                key={msg.id}
                className={`flex ${
                  msg.senderId === user.userId ? "justify-end" : "justify-start"
                }`}
              >
                <div>
                  <div
                    className={`max-w-[85%] min-w-[150px] sm:max-w-md px-3 py-[8px] pb-1 sm:px-4 sm:pr-3 sm:py-[10px] sm:pb-1 rounded-lg text-xs sm:text-sm shadow-sm break-words ml-auto ${
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
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-2 sm:p-4 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2 sm:gap-3 bg-white dark:bg-gray-900">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 border-none focus-visible:ring-0 text-sm lg:py-5"
            onKeyDown={(e) => e.key === "Enter" && SendMessage()}
          />
          <Button
            onClick={SendMessage}
            className={`rounded-full h-9 w-9 sm:h-10 sm:w-10 p-0 bg-blue-600 hover:bg-blue-700  dark:bg-white dark:hover:bg-gray-200 ${
              loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
            disabled={loading}
          >
            <Send size={16} className="text-white dark:text-black" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
