"use client";
import { fetchCardsDataAndAllOrders } from '@/app/actions/order-action';
import ReorderTable from '@/components/reorder-table'
import { supabase } from '@/lib/supabaseClient';
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
            <h3 className= 'text-2xl md:text-2xl font-semibold text-gray-900 dark:text-gray-200 px-6 py-4'>Reorder</h3>
             <ReorderTable ordersData={orders}/>
           </div>
        </div>
  )
}

export default RealtimeReordersClient
