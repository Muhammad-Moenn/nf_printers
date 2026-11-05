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
    <div className="flex items-center justify-center overflow-hidden rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 p-6 shadow transition-shadow hover:shadow-md dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)]">
      <div className="flex items-center justify-between w-full">
        <div className="">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 font-heading text-3xl font-bold text-foreground">
            {value}
          </p>
          {trend && (
            <p
              className={`mt-1 text-xs font-medium ${trendUp ? "text-success" : "text-destructive"}`}
            >
              {trend}
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/15 text-accent hover:bg-accent/25 dark:bg-accent/15 dark:text-accent-soft-foreground dark:hover:bg-accent/25">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
