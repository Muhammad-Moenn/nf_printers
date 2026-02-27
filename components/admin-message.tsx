"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

const staticConversations = [
  {
    id: 1,
    name: "Alexander Jameson",
    online: true,
    avatar: "https://i.pravatar.cc/150?img=5",
    messages: [
      {
        id: 1,
        sender: "other",
        text: "Hello! I'm a manager that's here to help.",
        time: "10:37 AM",
      },
      {
        id: 2,
        sender: "me",
        text: "Looks good 👍 I want to sign up for a viewing.",
        time: "12:25 PM",
      },
    ],
  },
  {
    id: 2,
    name: "Sarah Wilson",
    online: false,
    avatar: "https://i.pravatar.cc/150?img=6",
    messages: [
      {
        id: 1,
        sender: "other",
        text: "Is the apartment still available?",
        time: "09:15 AM",
      },
    ],
  },
];

export default function AdminDashboardMessages({ user }: { user: any }) {
  const [darkMode, setDarkMode] = useState(false);
  const [conversations, setConversations] = useState(staticConversations);
  const [activeId, setActiveId] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = React.useRef<HTMLDivElement | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const updated = conversations.map((conv) => {
      if (conv.id === activeId) {
        return {
          ...conv,
          messages: [
            ...conv.messages,
            {
              id: conv.messages.length + 1,
              sender: "me",
              text: newMessage,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ],
        };
      }
      return conv;
    });

    setConversations(updated);
    setNewMessage("");
  };

  async function fetchMessages() {
    const res = await fetch("/api/user-message/get-message");
    const data = await res.json();
    setMessages(data);
    console.log("Fetched messages:", data);
  }

  async function SendMessage() {
    if (!text.trim()) return;
    setLoading(true);

    // setMessages((prev) => [...prev, {text:text,senderId: user.id,createdAt: new Date().toISOString(),seen:false}]);
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
    <div
      className={`h-screen w-full p-6 transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="grid grid-cols-12 gap-6 h-[90%]">
        {/* Sidebar */}
        <Card
          className={`col-span-4 rounded-2xl shadow-md flex flex-col ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <CardContent className="p-4 flex flex-col gap-4 h-full">
            <Input
              placeholder="Search conversations..."
              className={darkMode ? "bg-gray-700 border-gray-600" : ""}
            />

            <ScrollArea className="flex-1 pr-2">
              {conversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveId(conv.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                    activeId === conv.id
                      ? darkMode
                        ? "bg-gray-700"
                        : "bg-gray-200"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={conv.avatar} />
                    <AvatarFallback>{conv.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{conv.name}</p>
                    <p className="text-sm opacity-60 truncate">
                      {conv.messages[conv.messages.length - 1]?.text}
                    </p>
                  </div>
                  {conv.online && (
                    <span className="h-2 w-2 bg-green-500 rounded-full" />
                  )}
                </motion.div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card
          className={`col-span-8 rounded-2xl shadow-md flex flex-col ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <CardContent className="flex flex-col h-full p-0">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-300 dark:border-gray-700">
              <Avatar>
                <AvatarImage src={activeConversation?.avatar} />
                <AvatarFallback>
                  {activeConversation?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{activeConversation?.name}</p>
                <p
                  className={`text-sm ${
                    activeConversation?.online ? "text-green-500" : "opacity-60"
                  }`}
                >
                  {activeConversation?.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6 space-y-4">
              {activeConversation?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl max-w-md shadow-sm ${
                      msg.sender === "me"
                        ? darkMode
                          ? "bg-white text-black"
                          : "bg-black text-white"
                        : darkMode
                        ? "bg-gray-700"
                        : "bg-gray-100"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className="text-xs opacity-60 block mt-2">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              .
              <div ref={bottomRef} />
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-gray-300 dark:border-gray-700 flex items-center gap-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message..."
                className={`flex-1 ${
                  darkMode ? "bg-gray-700 border-gray-600" : ""
                }`}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <Button onClick={handleSend} className="rounded-full">
                <Send size={18} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
