import Link from "next/link";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, Label } from "recharts";
import {
  IconPackage,
  IconFileText,
  IconCheck,
  IconWallet,
  IconUsers,
  IconUserCog,
  IconShoppingCart,
  IconClock,
  IconCircleX,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { CheckCircle2, ChevronRight, Clock3, Hourglass } from "lucide-react";
import DonutCardChart from "./charts/section-cards-charts";

const iconMap = {
  package: IconPackage,
  "file-text": IconFileText,
  "check-circle": IconCheck,
  wallet: IconWallet,

  // Admin Dashboard Icons
  users: IconUsers,
  "user-cog": IconUserCog,
  "shopping-cart": IconShoppingCart,
  clock: IconClock,
  "x-circle": IconCircleX,
  "currency-dollar": IconCurrencyDollar,
} as const;

export interface CardData {
  icon: keyof typeof iconMap;
  title: string;
  value: string | number;
  description: string;
  is_chart?: boolean;
  shortLabel?: string;
  href?: string;
  color?: string;
  total_order?: number;
  current_monthPaid?:number;
  current_weekPaid?:number
}

function withAlpha(color: string, alpha: number) {
  return `color-mix(in oklab, ${color} ${alpha * 100}%, transparent)`;
}
export function SectionCards({
  cards,
  cardClassName,
}: {
  cards: CardData[];
  cardClassName?: string;
}) {
  return (
    <>
      {cards.map((card, i) => {
        const Icon = iconMap[card.icon];
        const value = Number(card.value);
        const FooterIcon =
          card.title === "Pending Quotes"
            ? Hourglass
            : card.title === "Completed Orders"
              ? CheckCircle2
              : Clock3;
        const cardContent = (
          <Card
            className={`@container/card flex h-full min-h-[168px] w-full flex-col justify-between gap-3 overflow-hidden border-border/80 bg-card px-3 py-4 shadow-sm transition-all duration-200 dark:border-on-color/10 dark:bg-card sm:px-4 ${cardClassName ?? ""} ${
              card.href ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""
            }`}
          >
            <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 p-0">
              <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                {Icon && (
                  <div
                    style={{
                      backgroundColor: withAlpha(card?.color ?? "var(--primary)", 0.2),
                    }}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10"
                  >
                    <Icon style={{ color: card.color }} className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <CardDescription className="line-clamp-2 text-[13px] font-semibold leading-tight text-foreground dark:text-neutral-100 sm:text-sm">
                    {card.title}
                  </CardDescription>
                  <CardTitle className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-1 text-lg font-bold leading-tight tabular-nums sm:text-xl @[260px]/card:text-[22px]">
                    <span className="break-words">{card.value}</span>
                    {card.shortLabel && (
                      <span className="text-xs font-medium text-muted-foreground dark:text-neutral-400">
                        {card.shortLabel}
                      </span>
                    )}
                  </CardTitle>
                </div>
              </div>
              {card.is_chart ? (
                <div className="flex-shrink-0">
                  <DonutCardChart
                    total={card.total_order ?? 0}
                    value={value}
                    color={card.color}
                    size={64}
                  />
                </div>
              ) : card.href ? (
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-text dark:bg-primary/10 dark:text-primary-soft-foreground">
                  <ChevronRight className="h-4 w-4" />
                </span>
              ) : null}
            </CardHeader>

            <CardFooter
              className={`flex min-w-0 ${
                card.title === "Total Paid"
                  ? "flex-col items-start gap-1"
                  : "flex-row items-center gap-2"
              } border-t border-primary-border px-0 pb-0 text-[13px] leading-[1.15rem] dark:border-on-color/10 [.border-t]:pt-3 sm:text-sm`}
            >
              {card.title !== "Total Paid" && (
                <FooterIcon
                  className={`h-4 w-4 shrink-0 ${
                    card.title === "Pending Quotes"
                      ? "text-warning-text"
                      : card.title === "Completed Orders"
                        ? "text-success-text"
                        : "text-primary-text"
                  }`}
                />
              )}
              <div className="min-w-0 break-words text-muted-foreground dark:text-neutral-300">
                {card.description}
              </div>
              {card.title === "Total Paid" && (
                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground dark:text-neutral-300">
                  <span>
                    Current Week{" "}
                    <span className="font-medium text-muted-foreground dark:text-neutral-300">
                      : Rs {card.current_weekPaid}
                    </span>
                  </span>
                  <span>
                    Current Month{" "}
                    <span className="font-medium text-muted-foreground dark:text-neutral-300">
                      : Rs {card.current_monthPaid}
                    </span>
                  </span>
                </div>
              )}
            </CardFooter>
          </Card>
        );

        if (card.href) {
          return (
            <Link key={i} href={card.href} className="block h-full">
              {cardContent}
            </Link>
          );
        }

        return <div key={i} className="h-full">{cardContent}</div>;
      })}
    </>
  );
}

type Props = {
  value: number; // percentage (0–100)
  color?: string; // dynamic color
  size?: number;
};

export default function DonutProgressChart({
  value,
  color = "var(--primary)",
  size = 200,
}: Props) {
  const data = [
    { name: "progress", value: value },
    { name: "remaining", value: 100 - value },
  ];

  return (
    <div style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
          innerRadius="70%"
          outerRadius="90%"
          stroke="none"
        >
          <Cell fill={color} />
          <Cell fill="var(--border)" />
          <Label
            value={`${value}%`}
            position="center"
            style={{ fontSize: 20, fontWeight: 600 }}
          />
        </Pie>
      </PieChart>
    </div>
  );
}
