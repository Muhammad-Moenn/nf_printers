import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, Label, Line, ResponsiveContainer, LineChart } from "recharts";
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
import DonutCardChart from "./charts/section-cards-charts";
import { Span } from "next/dist/trace";
import { div } from "motion/react-client";

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
  color?: string;
  total_order?: number;
  current_monthPaid?:number;
  current_weekPaid?:number
}

export function SectionCards({ cards }: { cards: CardData[] }) {
  return (
    <>
      {cards.map((card, i) => {
        const Icon = iconMap[card.icon];
        const value = Number(card.value);
        return (
          <Card
            key={i}
            className="@container/card w-full bg-transparent flex flex-col gap-1 cursor-pointer hover:scale-[1.04] transition-all duration-300 dark:bg-gray-900"
          >
            <CardHeader className="relative">
              {/* Title */}
              <CardDescription className="flex items-center gap-2 text-gray-800 font-medium text-[16]">
                {Icon && (
                  <div className="w-8 h-8 rounded-sm flex justify-center items-center bg-blue-200/[0.3]">
                    {" "}
                    <Icon className="h-4 w-4 text-blue-500" />
                  </div>
                )}
                {card.title}
              </CardDescription>

              {/* Value */}
              <div className="flex  justify-between items-center w-full ">
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-4xl">
                  {card.value}{" "}
                  {card.shortLabel && (
                    <span className="text-[12px]">{card.shortLabel}</span>
                  )}
                </CardTitle>
                {card.is_chart && (
                  <div className="-mt-3 -mr-3">
                  <DonutCardChart
                    total={card.total_order ?? 0}
                    value={value}
                    color={card.color}
                  />
                  </div>
                )}
              </div>
            </CardHeader>

            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className={`text-gray-500 dark:text-gray-200 ${card.title==="Total Paid" && "mt-1"}`}>
                {card.description}
              </div>
              {card.title==="Total Paid" &&(<div className="text-slate-500/70 dark:text-slate-300/70 flex flex-col text-xs mt-2">
                <span>Current Week <span className="text-slate-600 font-medium dark:text-gray-300">: Rs {card.current_weekPaid}</span></span>
                <span>Current Month <span className="text-slate-600 font-medium dark:text-gray-300">: Rs {card.current_monthPaid}</span></span>
              </div>)}
              
            </CardFooter>
             
          </Card>
        );
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
  color = "#3B82F6",
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
          <Cell fill="#E5E7EB" />
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
