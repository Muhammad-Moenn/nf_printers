import { Plus, CheckCircle, Package, FileText, RotateCcw } from "lucide-react";

const actions = [
  {
    label: "Create Order",
    icon: Plus,
    color: "bg-amber-900/15 text-orange-400 hover:bg-amber-900/25",
  },
  {
    label: "Approve Quote",
    icon: CheckCircle,
    color: "bg-green-600/15 text-green-500 hover:bg-green-600/25",
  },
  {
    label: "Add Product",
    icon: Package,
    color: "bg-primary/15 text-primary hover:bg-primary/25",
  },
  {
    label: "Generate Invoice",
    icon: FileText,
    color: "bg-amber-900/15 text-orange-400 hover:bg-amber-900/25",
  },
  {
    label: "Restock Supplies",
    icon: RotateCcw,
    color: "bg-destructive/15 text-destructive hover:bg-destructive/25",
  },
];

const QuickActions = () => {
  return (
    <div
      className="w-full  flex-col bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
              dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] justify-center items-center border-2 border-gray-200 dark:border-gray-600/70 rounded-xl overflow-hidden p-4  shadow  "
    >
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <p className="stat-label mt-1">Frequent tasks</p>
      </div>

      <div className="flex flex-col gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${action.color}`}
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
