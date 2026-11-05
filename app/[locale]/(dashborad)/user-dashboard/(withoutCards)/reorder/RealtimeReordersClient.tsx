"use client";
import { fetchCardsDataAndAllOrders } from '@/app/actions/order-action';
import ReorderTable from '@/components/reorder-table'
import { supabase } from '@/lib/supabaseClient';
import { Check, FileText, Folder, ImageIcon, RefreshCcw } from 'lucide-react';
import React, { useEffect, useState } from 'react'

function RealtimeReordersClient({ordersData}: {ordersData:any[]}) {
  const [orders, setOrders] = useState(ordersData);
  const refetch = async () => {
  const res = await fetch("/api/orders/realtime");
  const data = await res.json();

  setOrders(data.allOrders);
};
  
   useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Order", // <-- IMPORTANT
        },
        () => {
          refetch();
        }
      ).subscribe();
      
  
    return () => {
      channel.unsubscribe();
    };
  }, []);
  return (
    <div>
           {/* <SectionCards cards={cards}/> */}
           <div className='w-full  '>
             <header className="relative isolate -mx-4 overflow-hidden rounded-b-lg border-b border-primary-border/70 bg-gradient-to-r from-[var(--surface-2)] via-[var(--surface-2)] to-[var(--primary-soft)] px-5 py-6 sm:-mx-6 sm:px-8 lg:-mx-8">
                  <svg aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 h-full w-full" viewBox="0 0 1200 190" preserveAspectRatio="none">
                    <path d="M0 118C180 40 286 185 492 97S850 34 1200 94V0H0Z" fill="var(--on-color)" fillOpacity=".48" />
                    <path d="M525 180C680 52 788 35 924 89s191 64 276-32v133H525Z" fill="var(--primary-border)" fillOpacity=".36" />
                  </svg>
                  <div className="relative flex min-h-20 items-center gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary-soft/80 text-[var(--primary)]"><RefreshCcw className="h-7 w-7" strokeWidth={2.3} /></span>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-[var(--heading)] sm:text-[28px]">Reorder</h1>
                      <p className="mt-1 text-sm text-muted-foreground">Manage your reorder requests and track their status.</p>
                    </div>
                    
                  </div>
                </header>
             <ReorderTable ordersData={orders}/>
           </div>
        </div>
  )
}

export default RealtimeReordersClient
