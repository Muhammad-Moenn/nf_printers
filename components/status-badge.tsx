type OrderStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  |"processing";
const statusStyles = {
  pending: "bg-warning/10 text-warning-soft-foreground",
  in_progress: "bg-primary/10 text-primary-soft-foreground",
  completed: "bg-success/10 text-success-soft-foreground",
  cancelled: "bg-destructive/10 text-destructive-soft-foreground",
  processing: "bg-warning/10 text-warning-soft-foreground"
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`px-3 py-1 rounded-badge text-xs font-medium ${statusStyles[status]}`}>
      {status.replace("_", " ").toUpperCase()}
    </span>
  );
}
