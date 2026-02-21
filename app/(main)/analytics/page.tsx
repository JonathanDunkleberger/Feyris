"use client";

import { Film, Clock, Target, Star, Layers, Calendar, Zap, BarChart3 } from "lucide-react";
import { MEDIA_TYPES, type MediaType } from "@/lib/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";

// ─── Demo data ────────────────────────────────────────────────────────────

const HOURS_BY_TYPE = [
  { month: "Jan", anime: 28, game: 42, book: 12, tv: 8, film: 6 },
  { month: "Feb", anime: 35, game: 38, book: 15, tv: 10, film: 4 },
  { month: "Mar", anime: 40, game: 30, book: 18, tv: 14, film: 10 },
  { month: "Apr", anime: 32, game: 45, book: 10, tv: 6, film: 8 },
  { month: "May", anime: 25, game: 20, book: 22, tv: 12, film: 5 },
  { month: "Jun", anime: 38, game: 35, book: 8, tv: 15, film: 7 },
  { month: "Jul", anime: 30, game: 50, book: 14, tv: 9, film: 3 },
  { month: "Aug", anime: 22, game: 28, book: 20, tv: 11, film: 6 },
  { month: "Sep", anime: 33, game: 32, book: 16, tv: 13, film: 9 },
  { month: "Oct", anime: 45, game: 25, book: 10, tv: 8, film: 4 },
  { month: "Nov", anime: 28, game: 40, book: 12, tv: 7, film: 11 },
  { month: "Dec", anime: 36, game: 33, book: 14, tv: 10, film: 5 },
];

const COMPLETION_FUNNEL = [
  { status: "Planning", count: 45, color: "#7b9ec9" },
  { status: "In Progress", count: 12, color: "#c8a44e" },
  { status: "On Hold", count: 8, color: "#c97b9e" },
  { status: "Completed", count: 42, color: "#5cb85c" },
  { status: "Dropped", count: 5, color: "#d4a574" },
];

const RATING_DIST = [
  { rating: "1", count: 0 },
  { rating: "2", count: 1 },
  { rating: "3", count: 2 },
  { rating: "4", count: 3 },
  { rating: "5", count: 5 },
  { rating: "6", count: 8 },
  { rating: "7", count: 14 },
  { rating: "8", count: 18 },
  { rating: "9", count: 12 },
  { rating: "10", count: 6 },
];

const GENRE_RADAR = [
  { genre: "Sci-Fi", value: 85 },
  { genre: "Fantasy", value: 72 },
  { genre: "Action", value: 68 },
  { genre: "RPG", value: 90 },
  { genre: "Drama", value: 55 },
  { genre: "Horror", value: 30 },
  { genre: "Romance", value: 25 },
  { genre: "Comedy", value: 45 },
];

const DAILY_HEATMAP = Array.from({ length: 52 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => ({
    week: w,
    day: d,
    hours: Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0,
  }))
).flat();

const TIME_OF_DAY = [
  { hour: "6am", hours: 2 },
  { hour: "9am", hours: 4 },
  { hour: "12pm", hours: 8 },
  { hour: "3pm", hours: 6 },
  { hour: "6pm", hours: 14 },
  { hour: "9pm", hours: 22 },
  { hour: "12am", hours: 12 },
  { hour: "3am", hours: 3 },
];

const COMPLETION_TIME = [
  { type: "Anime", avgDays: 8 },
  { type: "Game", avgDays: 21 },
  { type: "Book", avgDays: 14 },
  { type: "TV", avgDays: 12 },
  { type: "Film", avgDays: 1 },
  { type: "Manga", avgDays: 5 },
];

// ─── Helpers ────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  anime: "#7b9ec9",
  game: "#c8a44e",
  book: "#a0c4a8",
  tv: "#c97b9e",
  film: "#d4a574",
  manga: "#b088c9",
};

const chartCard =
  "rounded-xl border border-white/[0.025] p-5 bg-gradient-to-br from-[rgba(18,18,24,0.85)] to-[rgba(12,12,18,0.92)]";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0e0e14] px-3 py-2 text-[11px] shadow-xl">
      <div className="mb-1 font-semibold text-cream">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-cream/50">{p.dataKey}:</span>
          <span className="font-bold text-cream">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Heatmap Component ──────────────────────────────────────────────────

function DailyHeatmap() {
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const maxH = Math.max(...DAILY_HEATMAP.map((d) => d.hours), 1);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-px" style={{ minWidth: 580 }}>
        <div className="flex flex-col gap-px pr-1">
          {dayLabels.map((l, i) => (
            <div key={i} className="flex h-[10px] w-3 items-center justify-end text-[7px] text-cream/20">
              {i % 2 === 1 ? l : ""}
            </div>
          ))}
        </div>
        {Array.from({ length: 52 }, (_, w) => (
          <div key={w} className="flex flex-col gap-px">
            {Array.from({ length: 7 }, (_, d) => {
              const cell = DAILY_HEATMAP.find(
                (c) => c.week === w && c.day === d
              );
              const h = cell?.hours || 0;
              const intensity = h / maxH;
              return (
                <div
                  key={d}
                  className="h-[10px] w-[10px] rounded-[2px]"
                  style={{
                    background:
                      h === 0
                        ? "rgba(255,255,255,0.02)"
                        : `rgba(200,164,78,${0.15 + intensity * 0.75})`,
                  }}
                  title={`${h}h`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Summary Stats ──────────────────────────────────────────────────────

const SUMMARY = [
  { label: "Total Hours", value: "847", icon: Clock, color: "#c8a44e" },
  { label: "Titles Completed", value: "42", icon: Target, color: "#5cb85c" },
  { label: "Avg Rating", value: "8.3", icon: Star, color: "#d4a574" },
  { label: "Genres Explored", value: "14", icon: Layers, color: "#7b9ec9" },
];

// ─── Page ───────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  return (
    <div className="animate-fadeIn pt-3.5">
      <h1 className="mb-[18px] text-2xl font-extrabold tracking-tight text-cream">
        Analytics
      </h1>

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {SUMMARY.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={chartCard}>
              <Icon size={15} style={{ color: s.color }} className="mb-1.5" />
              <div className="text-[9px] font-bold uppercase tracking-[1px] text-cream/25">
                {s.label}
              </div>
              <div
                className="text-[28px] font-black"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* 1 — Hours by Type (stacked area) */}
        <div className={`${chartCard} col-span-1 lg:col-span-2`}>
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 size={14} className="text-gold" />
            <h3 className="text-[13px] font-bold text-cream">
              Hours by Type
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={HOURS_BY_TYPE}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "rgba(224,218,206,0.3)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(224,218,206,0.2)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconSize={8}
                wrapperStyle={{ fontSize: 10, color: "rgba(224,218,206,0.4)" }}
              />
              {Object.entries(TYPE_COLORS).map(([key, color]) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={color}
                  fill={color}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 2 — Completion Funnel */}
        <div className={chartCard}>
          <div className="mb-3 flex items-center gap-2">
            <Target size={14} className="text-type-book" />
            <h3 className="text-[13px] font-bold text-cream">
              Library Status
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={COMPLETION_FUNNEL} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "rgba(224,218,206,0.2)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="status"
                tick={{ fill: "rgba(224,218,206,0.4)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {COMPLETION_FUNNEL.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3 — Rating Distribution */}
        <div className={chartCard}>
          <div className="mb-3 flex items-center gap-2">
            <Star size={14} className="text-gold" />
            <h3 className="text-[13px] font-bold text-cream">
              Rating Distribution
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={RATING_DIST}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="rating"
                tick={{ fill: "rgba(224,218,206,0.3)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(224,218,206,0.2)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={25}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {RATING_DIST.map((_, i) => (
                  <Cell
                    key={i}
                    fill={`rgba(200,164,78,${0.3 + (i / 10) * 0.7})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 4 — Genre Radar */}
        <div className={chartCard}>
          <div className="mb-3 flex items-center gap-2">
            <Layers size={14} className="text-type-anime" />
            <h3 className="text-[13px] font-bold text-cream">Genre Profile</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={GENRE_RADAR} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis
                dataKey="genre"
                tick={{ fill: "rgba(224,218,206,0.4)", fontSize: 10 }}
              />
              <Radar
                dataKey="value"
                stroke="#c8a44e"
                fill="#c8a44e"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 5 — Time of Day */}
        <div className={chartCard}>
          <div className="mb-3 flex items-center gap-2">
            <Clock size={14} className="text-type-tv" />
            <h3 className="text-[13px] font-bold text-cream">
              Time of Day
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={TIME_OF_DAY}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="hour"
                tick={{ fill: "rgba(224,218,206,0.3)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(224,218,206,0.2)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={25}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hours" radius={[3, 3, 0, 0]}>
                {TIME_OF_DAY.map((_, i) => (
                  <Cell key={i} fill="rgba(201,123,158,0.6)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 6 — Daily Heatmap (full width) */}
        <div className={`${chartCard} col-span-1 lg:col-span-2`}>
          <div className="mb-3 flex items-center gap-2">
            <Calendar size={14} className="text-gold" />
            <h3 className="text-[13px] font-bold text-cream">
              Daily Activity
            </h3>
          </div>
          <DailyHeatmap />
          <div className="mt-2 flex items-center justify-end gap-1 text-[9px] text-cream/20">
            <span>Less</span>
            {[0.08, 0.25, 0.5, 0.75, 0.95].map((o) => (
              <div
                key={o}
                className="h-[10px] w-[10px] rounded-[2px]"
                style={{ background: `rgba(200,164,78,${o})` }}
              />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* 7 — Avg Completion Time */}
        <div className={`${chartCard} col-span-1 lg:col-span-2`}>
          <div className="mb-3 flex items-center gap-2">
            <Zap size={14} className="text-type-film" />
            <h3 className="text-[13px] font-bold text-cream">
              Avg Days to Complete
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={COMPLETION_TIME}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis
                dataKey="type"
                tick={{ fill: "rgba(224,218,206,0.3)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "rgba(224,218,206,0.2)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={30}
                label={{
                  value: "days",
                  position: "insideTopLeft",
                  offset: -5,
                  style: { fill: "rgba(224,218,206,0.15)", fontSize: 9 },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgDays" radius={[4, 4, 0, 0]}>
                {COMPLETION_TIME.map((entry) => (
                  <Cell
                    key={entry.type}
                    fill={TYPE_COLORS[entry.type.toLowerCase()] || "#c8a44e"}
                    fillOpacity={0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
