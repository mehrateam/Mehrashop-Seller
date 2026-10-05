"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
    <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full">
      <AreaChart
        accessibilityLayer
        data={data ?? chartData}
        margin={{ top: 18, right: 4, left: 4, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          padding={{ left: 18, right: 18 }}
          tick={{ fontSize: 11 }}
        />
        <YAxis hide domain={[0, (max: number) => Math.max(max * 1.22, 1)]} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <Area
          dataKey="revenue"
          type="monotone"
          fill="url(#fillRevenue)"
          stroke="var(--color-revenue)"
          strokeWidth={2}
          baseValue={0}
          dot={{ r: 3, fill: "var(--color-revenue)", stroke: "var(--card)", strokeWidth: 2 }}
          activeDot={{ r: 4.5, stroke: "var(--card)", strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
