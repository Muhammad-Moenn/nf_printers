import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: StatCardProps) => {
  return (
    <div className="bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
              dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] justify-center items-center border border-gray-200 dark:border-gray-600/70 rounded-xl overflow-hidden  shadow    p-6 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 font-heading text-3xl font-bold text-foreground">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trendUp ? "text-success" : "text-destructive"}`}>
              {trend}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(36,90%,55%)]/15 text-[hsl(36,90%,55%)] hover:bg-amber-900/25">
          <Icon className="h-6 w-6 text-accent-500" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
