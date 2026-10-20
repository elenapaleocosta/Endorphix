import React from "react";
import { View, Text, Dimensions } from "react-native";
import { Colors } from "@/constants";
import type { EnergyWaveDataPoint } from "@/types";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_W - 48;
const CHART_HEIGHT = 140;

interface EnergyWaveChartProps {
  data: EnergyWaveDataPoint[];
}

export function EnergyWaveChart({ data }: EnergyWaveChartProps) {
  if (!data || data.length === 0) {
    return (
      <View
        style={{
          height: CHART_HEIGHT,
          backgroundColor: Colors.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: Colors.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: Colors.tertiary, fontSize: 13 }}>
          No energy data yet. Log your first session.
        </Text>
      </View>
    );
  }

  const maxScore = 100;
  const minScore = 0;
  const range = maxScore - minScore;

  // Build SVG path points
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - ((d.score - minScore) / range) * CHART_HEIGHT;
    return { x, y, score: d.score, activity: d.activity_type };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${acc} C ${cpX} ${prev.y} ${cpX} ${p.y} ${p.x} ${p.y}`;
  }, "");

  const fillD = `${pathD} L ${points[points.length - 1].x} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 16,
        overflow: "hidden",
      }}
    >
      {/* Horizontal grid lines */}
      {[25, 50, 75, 100].map((level) => {
        const y = CHART_HEIGHT - (level / 100) * CHART_HEIGHT;
        return (
          <View
            key={level}
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              top: y + 16,
              height: 1,
              backgroundColor: Colors.border,
            }}
          />
        );
      })}

      {/* SVG Chart — rendered as absolute bars for RN compatibility */}
      <View style={{ height: CHART_HEIGHT, flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
        {data.map((d, i) => {
          const barH = (d.score / 100) * CHART_HEIGHT;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: barH,
                borderRadius: 3,
                backgroundColor: Colors.glow + (d.score >= 70 ? "FF" : d.score >= 40 ? "AA" : "55"),
              }}
            />
          );
        })}
      </View>

      {/* Legend */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <Text style={{ color: Colors.tertiary, fontSize: 10 }}>
          {data.length}d ago
        </Text>
        <Text style={{ color: Colors.tertiary, fontSize: 10 }}>Today</Text>
      </View>
    </View>
  );
}
