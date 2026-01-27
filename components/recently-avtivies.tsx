"use client";

import CustomTable, { Column } from "@/components/custom-table";
import { OrderStatus } from "@/components/order-table";
import { StatusBadge } from "@/components/status-badge";

type Activity = (typeof recentActivities)[number];

export const recentActivities = [
  {
    id: "ORD-1023",
    type: "Order",
    title: "Business Cards Printing",
    status: "in_progress",
    date: "Today",
  },
  {
    id: "QTE-451",
    type: "Quote",
    title: "Flyers (A5)",
    status: "pending",
    date: "Yesterday",
  },
  {
    id: "ORD-1021",
    type: "Order",
    title: "Brochures",
    status: "completed",
    date: "2 days ago",
  },
  {
    id: "PAY-332",
    type: "Payment",
    title: "Invoice Payment",
    status: "completed",
    date: "3 days ago",
  },
  {
    id: "ORD-1019",
    type: "Order",
    title: "Poster Printing",
    status: "in_progress",
    date: "4 days ago",
  },
];

const columns: Column<Activity>[] = [
  { key: "id", label: "ID" },
  { key: "type", label: "Type" },
  { key: "title", label: "Title" },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (value) => <StatusBadge status={value as OrderStatus} />,
  },
  { key: "date", label: "Date", sortable: true ,hideOnMobile:true},
  // { key: "actions", label: "Actions" },
];
export default function RecentActivities() {
  return (
    <div>
      
      <h4 className="text-[20px] lg:text-[22px] font-medium text-gray-800 dark:text-gray-200 text-left  p-6 py-5 -pt-10">
        Recently Activities
      </h4>
      <CustomTable data={recentActivities} columns={columns} />
    </div>
  );
}
