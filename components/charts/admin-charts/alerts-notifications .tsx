import { AlertTriangle, Clock, CreditCard, Package } from "lucide-react";

const alerts = [
  { icon: Package, message: "Low stock: A4 paper (12 reams left)", severity: "warning", time: "10 min ago" },
  { icon: Clock, message: "Order ORD-4815 delayed by 2 days", severity: "destructive", time: "25 min ago" },
  { icon: AlertTriangle, message: "3 pending quote approvals", severity: "warning", time: "1 hr ago" },
  { icon: CreditCard, message: "Failed payment from Alex Turner", severity: "destructive", time: "2 hrs ago" },
];

const severityStyles: Record<string, string> = {
  warning: "bg-warning/10 text-warning border-warning/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
};

const AlertsNotifications = () => {
  return (
    <div className="w-full  flex-col bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
              dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] justify-center items-center border-2 border-gray-200 dark:border-gray-600/70 rounded-xl overflow-hidden p-4  shadow  ">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Alerts</h2>
        <p className="stat-label mt-1">Items needing attention</p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <div key={i} className={`flex items-start gap-3 rounded-lg border p-3 ${severityStyles[alert.severity]}`}>
            <alert.icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{alert.message}</p>
              <p className="text-xs text-muted-foreground">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsNotifications;
