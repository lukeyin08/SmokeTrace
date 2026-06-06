"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  fontSize: 12,
} as const;

const axisProps = {
  tick: { fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

export interface DayPoint {
  date: string;
  count: number;
  avgIntensity: number;
  avgStress: number;
}

export interface CountPoint {
  label: string;
  count: number;
}

const BAR_COLORS = [
  "hsl(var(--primary))",
  "hsl(173 64% 50%)",
  "hsl(190 70% 50%)",
  "hsl(152 56% 45%)",
  "hsl(38 92% 55%)",
  "hsl(210 70% 55%)",
];

export function CravingsOverTimeChart({ data }: { data: DayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="cravingsArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
        />
        <XAxis dataKey="date" {...axisProps} />
        <YAxis allowDecimals={false} width={28} {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="count"
          name="Cravings"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#cravingsArea)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StressVsCravingsChart({ data }: { data: DayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
        />
        <XAxis dataKey="date" {...axisProps} />
        <YAxis domain={[0, 10]} width={28} {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar
          dataKey="avgStress"
          name="Avg stress"
          fill="hsl(38 92% 60%)"
          radius={[4, 4, 0, 0]}
          barSize={14}
        />
        <Line
          type="monotone"
          dataKey="avgIntensity"
          name="Avg craving"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function SmokingOverTimeChart({ data }: { data: CountPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--border))"
        />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis allowDecimals={false} width={28} {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar
          dataKey="count"
          name="Cigarettes"
          fill="hsl(var(--destructive))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalCountChart({ data }: { data: CountPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 42)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
      >
        <XAxis type="number" allowDecimals={false} hide />
        <YAxis
          type="category"
          dataKey="label"
          width={120}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "transparent" }} />
        <Bar dataKey="count" name="Count" radius={[0, 6, 6, 0]} barSize={20}>
          {data.map((_, i) => (
            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
