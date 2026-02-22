import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Package,
  FileText,
  CheckCircle,
  Wallet,
} from "lucide-react"

const iconMap = {
  package: Package,
  "file-text": FileText,
  "check-circle": CheckCircle,
  wallet: Wallet,
}


export interface CardData {
  icon: keyof typeof iconMap;
  title: string;
  value: string | number;
  description: string;
}

export function SectionCards({cards}: {cards: CardData[]}) {

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 pb-10">
      {cards.map((card, i) => {
  const Icon = iconMap[card.icon] || Package

  return (
    <Card key={i} className="@container/card w-full bg-transparent flex flex-col gap-4 cursor-pointer hover:scale-[1.04] transition-all duration-300 dark:bg-gray-900" >
      <CardHeader className="relative">
        {/* Title */}
        <CardDescription className="flex items-center gap-2 text-gray-800 font-medium text-[16]">
          {Icon && <div className="w-8 h-8 rounded-sm flex justify-center items-center bg-blue-200/[0.3]"> <Icon className="h-4 w-4 text-blue-500" /></div>}
          {card.title}
        </CardDescription>

        {/* Value */}
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {card.value}
        </CardTitle>
      </CardHeader>

      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="text-gray-500 dark:text-gray-200">{card.description}</div>
        {/* <div className="text-muted-foreground">Updated just now</div> */}
      </CardFooter>
    </Card>
  )
})}

     
      
    </div>
  )
}
