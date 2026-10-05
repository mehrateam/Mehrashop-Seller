"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartData = [
  { label: "فروردین", revenue: 4200 },
  { label: "اردیبهشت", revenue: 5100 },
  { label: "خرداد", revenue: 4800 },
  { label: "تیر", revenue: 6200 },
  { label: "مرداد", revenue: 5800 },
  { label: "شهریور", revenue: 7100 },
]

const chartConfig = {
  revenue: {
    label: "فروش",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function RevenueChart({
  data,
}: {
  data?: { label: string; revenue: number }[]
}) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
      <AreaChart accessibilityLayer data={data ?? chartData} margin={{ left: 8, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          tick={{ fontSize: 11 }}
        />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area
          dataKey="revenue"
          type="natural"
          fill="url(#fillRevenue)"
          stroke="var(--color-revenue)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
