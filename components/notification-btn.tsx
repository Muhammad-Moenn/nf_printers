"use client";

import { BellRing } from "lucide-react";
import Link from "next/link";

import { useRealtimeTables } from "@/lib/realtime-bus";
import { useUnseenMessageCount } from "@/lib/query/hooks/use-messages";

export default function NotificationButton({ dbUser }: any) {
  const { data: notification = 0, refetch } = useUnseenMessageCount(
    dbUser?.id,
    dbUser?.role
  );

  // The admin inbox listens to Message events on this same bus, so the bell and
  // inbox share one channel. The bus ref-counts listeners and only tears the
  // channel down when the last subscriber unmounts.
  useRealtimeTables(
    "messages-realtime",
    ["Message"] as const,
    () => {
      void refetch();
    },
    { enabled: Boolean(dbUser?.id) }
  );

  if (!dbUser) return null;
  return (
    <Link href={
    dbUser.role === "ADMIN"
      ? "/admin-dashboard/admin-inbox"
      : "/user-dashboard/user-inbox"
  }
   className="relative group cursor-pointer z-10">

  <BellRing className="w-5 h-5" />

  {notification > 0 && (
    <span
      className={`
        absolute -top-[3px] right-[0px] group-hover:-top-2 group-hover:-right-[4px]
        p-[3px] w-2 h-2 group-hover:w-[16px] group-hover:h-[16px] 
        flex items-center justify-center
        rounded-full bg-destructive
        text-on-color font-medium text-[9px]
        z-10
        group-hover:flex
        before:content-['']  
      `}
    >
      {/* number hidden by default */}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
        {notification > 9 ? "9+" : notification}
      </span>
    </span>
  )}
</Link>
  );
}
