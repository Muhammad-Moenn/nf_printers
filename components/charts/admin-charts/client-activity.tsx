import { Users, UserPlus, UserCheck, FileText } from "lucide-react";

const metrics = [
  { label: "New Clients", value: "24", icon: UserPlus, change: "+8", color: "text-green-500" },
  { label: "Active Clients", value: "187", icon: Users, change: "+3%", color: "text-blue-500" },
  { label: "Returning", value: "142", icon: UserCheck, change: "+12%", color: "text-orange-400" },
  { label: "Quote Requests", value: "31", icon: FileText, change: "+5", color: "text-orange-400" },
];

const ClientActivity = () => {
  return (
    <div className="w-full  flex-col bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
              dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] justify-center items-center border-2 border-gray-200 dark:border-gray-600/70 rounded-xl overflow-hidden p-4  shadow  ">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Client Activity</h2>
        <p className="stat-label mt-1">Platform usage this month</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg bg-slate-200/50 dark:bg-gray-800/90 border-1 border-slate-300/70 shadow-sm invert-0 dark:border-gray-600/70 p-4">
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
