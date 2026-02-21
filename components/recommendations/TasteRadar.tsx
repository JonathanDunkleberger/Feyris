"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface TasteRadarProps {
  data: { dimension: string; value: number }[];
}

export function TasteRadar({ data }: TasteRadarProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/[0.04] p-5"
      style={{ background: "linear-gradient(135deg, rgba(18,18,24,0.9), rgba(12,12,18,0.95))" }}
    >
      <h3 className="mb-3 text-center text-[13px] font-bold text-cream">Your Taste Profile</h3>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid
            stroke="rgba(200,164,78,0.08)"
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "rgba(240,235,224,0.35)", fontSize: 10 }}
          />
          <PolarRadiusAxis
            tick={false}
            axisLine={false}
            domain={[0, 10]}
          />
          <Radar
            name="Taste"
            dataKey="value"
            stroke="#c8a44e"
            fill="#c8a44e"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
