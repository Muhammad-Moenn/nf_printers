type OrderStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";
const statusStyles = {
  pending: "bg-yellow-500/10 text-yellow-400",
  in_progress: "bg-blue-500/10 text-blue-400",
  completed: "bg-green-500/10 text-green-400",
  cancelled: "bg-red-500/10 text-red-400",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
}
