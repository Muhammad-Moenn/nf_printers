import { fetchCardsDataAndAllOrders } from '@/app/actions/order-action';
import ReorderTable from '@/components/reorder-table'
import { Order } from '@/types/order';
import React from 'react'

async function  ReorderPage() {

   const {allOrders}=await fetchCardsDataAndAllOrders();
  return (
    <div>
       {/* <SectionCards cards={cards}/> */}
       <div className='w-full py-8 '>
        <h3 className= 'text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-200 '>Reorder</h3>
         <ReorderTable ordersData={allOrders}/>
       </div>
    </div>
  )
}

export default ReorderPage
