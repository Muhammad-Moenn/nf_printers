"use client";

import { AlertTriangle, CheckCircle2, Clock, Users } from "lucide-react";
import type { AdminStats } from "@/app/schemas/admin-dashboard-schema";

function PanelShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 p-4 shadow dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)]">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="stat-label mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}

export function AdminCustomerActivityPanel({ stats }: { stats: AdminStats }) {
  const repeatSignal =
    stats.completedOrders > 0
      ? Math.round((stats.completedOrders / Math.max(stats.totalOrders, 1)) * 100)
      : 0;

  const metrics = [
    {
      label: "Customers",
      value: stats.totalCustomers,
      detail: "Registered customer accounts",
      icon: Users,
      color: "text-primary-text",
    },
    {
      label: "Employees",
      value: stats.totalEmployees,
      detail: "Staff accounts",
      icon: Users,
      color: "text-violet-text",
    },
    {
      label: "Completed Rate",
      value: `${repeatSignal}%`,
      detail: "Completed from all orders",
      icon: CheckCircle2,
      color: "text-success-text",
    },
    {
      label: "Open Orders",
      value: stats.pendingOrders + stats.processingOrders + stats.inProgressOrders,
      detail: "Pending, processing, or in progress",
      icon: Clock,
      color: "text-warning-text",
    },
  ];

  return (
    <PanelShell
      title="Customer Activity"
      description="Live account and order activity"
    >
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-border-strong/70 bg-surface-4/50 p-4 shadow-sm dark:border-[var(--input)] dark:bg-[var(--surface-3)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </div>
            <p className="stat-value text-xl">{metric.value}</p>
            <p className="stat-label mt-1">{metric.label}</p>
            <p className="mt-2 text-xs text-muted-foreground">{metric.detail}</p>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

export function AdminAttentionPanel({ stats }: { stats: AdminStats }) {
  const alerts = [
    {
      message: `${stats.pendingOrders} orders waiting to be processed`,
      severity: stats.pendingOrders > 0 ? "warning" : "neutral",
    },
    {
      message: `${stats.processingOrders + stats.inProgressOrders} active orders in production`,
      severity: "neutral",
    },
    {
      message: `${stats.cancelledOrders} cancelled orders recorded`,
      severity: stats.cancelledOrders > 0 ? "destructive" : "neutral",
    },
  ];

  const severityStyles: Record<string, string> = {
    warning: "border-warning-border bg-warning-soft text-warning-text dark:border-warning/60 dark:bg-warning/30 dark:text-warning-soft-foreground",
    destructive:
      "border-destructive-border bg-destructive-soft text-destructive-text dark:border-destructive/60 dark:bg-destructive/30 dark:text-destructive-soft-foreground",
    neutral:
      "border-border-strong bg-muted text-foreground dark:border-[var(--input)] dark:bg-[var(--surface-3)] dark:text-neutral-300",
  };

  return (
    <PanelShell title="Needs Attention" description="Real order signals">
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.message}
            className={`flex items-start gap-3 rounded-lg border p-3 ${severityStyles[alert.severity]}`}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p className="text-sm font-medium">{alert.message}</p>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}
