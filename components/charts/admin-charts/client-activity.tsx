import { Users, UserPlus, UserCheck, FileText } from "lucide-react";

const metrics = [
  { label: "New Clients", value: "24", icon: UserPlus, change: "+8", color: "text-success-text" },
  { label: "Active Clients", value: "187", icon: Users, change: "+3%", color: "text-primary-text" },
  { label: "Returning", value: "142", icon: UserCheck, change: "+12%", color: "text-accent-soft-foreground" },
  { label: "Quote Requests", value: "31", icon: FileText, change: "+5", color: "text-accent-soft-foreground" },
];

const ClientActivity = () => {
  return (
    <div className="w-full  flex-col bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90
              dark:from-[var(--surface-1)] dark:via-surface-2/90 dark:to-[var(--surface-3)] justify-center items-center border-2 border-border dark:border-border/70 rounded-lg overflow-hidden p-4  shadow  ">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Client Activity</h2>
        <p className="stat-label mt-1">Platform usage this month</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg bg-surface-4/50 dark:bg-neutral-800/90 border-1 border-border-strong/70 shadow-sm invert-0 dark:border-border/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <m.icon className={`h-5 w-5 ${m.color}`} />
              <span className={`text-xs font-medium ${m.color}`}>{m.change}</span>
            </div>
            <p className="stat-value text-xl">{m.value}</p>
            <p className="stat-label mt-1">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientActivity;
