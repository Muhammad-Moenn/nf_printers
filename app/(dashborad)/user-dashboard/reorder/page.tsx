import { fetchCardsDataAndAllOrders } from '@/app/actions/order-action';
import ReorderTable from '@/components/reorder-table'
import { Order } from '@/types/order';
import React from 'react'

async function  ReorderPage() {

   const {allOrders}=await fetchCardsDataAndAllOrders();
   const normalizedOrders: any[] = allOrders.map((o) => ({
  ...o,
  designs: Array.isArray(o.designs) ? (o.designs as { url: string; key: string }[]) : [],
  finishingOptions: Array.isArray(o.finishingOptions) ? o.finishingOptions : [],
  paperType: o.paperType ?? "",
  size: o.size ?? "",
  colorMode: o.colorMode ?? "",
  sides: o.sides ?? "",
  gsm: o.gsm ?? "",
  requirements: o.requirements ?? "",
}));
  return (
    <div>
       {/* <SectionCards cards={cards}/> */}
       <div className='w-full py-8 '>
        <h3 className= 'text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-200 '>Reorder</h3>
         <ReorderTable ordersData={normalizedOrders}/>
       </div>
    </div>
  )
}

export default ReorderPage
