import { CheckCircle, Inbox, Settings, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    label: "Orders",
    href: "/admin-dashboard/orders",
    icon: ShoppingCart,
    color: "bg-warning/15 text-warning-text hover:bg-warning/25",
  },
  {
    label: "Review Orders",
    href: "/admin-dashboard/orders",
    icon: CheckCircle,
    color: "bg-success/15 text-success-text hover:bg-success/25",
  },
  {
    label: "Manage Users",
    href: "/admin-dashboard/users",
    icon: Users,
    color: "bg-primary/15 text-primary hover:bg-primary/25",
  },
  {
    label: "Open Inbox",
    href: "/admin-dashboard/admin-inbox",
    icon: Inbox,
    color: "bg-warning/15 text-warning-text hover:bg-warning/25",
  },
  {
    label: "Settings",
    href: "/admin-dashboard/settings",
    icon: Settings,
    color: "bg-destructive/15 text-destructive hover:bg-destructive/25",
  },
];

const QuickActions = () => {
  return (
    <div
      className="w-full  flex-col bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90
              dark:from-[var(--surface-1)] dark:via-surface-2/90 dark:to-[var(--surface-3)] justify-center items-center border-2 border-border dark:border-border/70 rounded-lg overflow-hidden p-4  shadow  "
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <p className="stat-label mt-1">Frequent tasks</p>
      </div>

      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${action.color}`}
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
