import React, { useMemo } from "react";
import { View, Text, Dimensions, Platform } from "react-native";
import Svg, {
  Path,
  Circle,
  Line,
  Text as SvgText,
} from "react-native-svg";
import { Colors } from "@/constants";
import type { EnergyWaveDataPoint } from "@/types";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_WIDTH = Math.max(SCREEN_W - 48, 280);
const CHART_HEIGHT = 160;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 30;
const PADDING_HORIZONTAL = 24;

interface EnergyWaveChartProps {
  data: EnergyWaveDataPoint[];
  activeStreak?: number;
}

export function EnergyWaveChart({ data, activeStreak = 7 }: EnergyWaveChartProps) {
  if (!data || data.length === 0) {
    return (
      <View
        style={{
          height: CHART_HEIGHT,
          backgroundColor: Colors.sand,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.sandDark,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Text style={{ color: Colors.espressoMuted, fontSize: 13, fontWeight: "600" }}>
          Begin your daily movement to generate your first endorphin wave.
        </Text>
      </View>
    );
  }

  // Calculate coordinates for SVG curve
  const { pathD, fillD, points, peakPoint, averageScore } = useMemo(() => {
    const usableW = CHART_WIDTH - PADDING_HORIZONTAL * 2;
    const usableH = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    const pts = data.map((d, index) => {
      const x =
        PADDING_HORIZONTAL +
        (index / Math.max(data.length - 1, 1)) * usableW;
      const normalizedY = (d.score - 0) / 100;
      const y = PADDING_TOP + (1 - normalizedY) * usableH;
      return { x, y, score: d.score, label: d.dayLabel || `D${index + 1}` };
    });

    // Compute smooth cubic bezier path
    let curveD = "";
    if (pts.length === 1) {
      curveD = `M ${pts[0].x - 20} ${pts[0].y} L ${pts[0].x + 20} ${pts[0].y}`;
    } else {
      curveD = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const curr = pts[i];
        const next = pts[i + 1];
        const cpX1 = curr.x + (next.x - curr.x) / 2.5;
        const cpY1 = curr.y;
        const cpX2 = next.x - (next.x - curr.x) / 2.5;
        const cpY2 = next.y;
        curveD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
      }
    }

    const lastX = pts[pts.length - 1].x;
    const firstX = pts[0].x;
    const bottomY = CHART_HEIGHT - PADDING_BOTTOM;
    const areaD = `${curveD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    const peak = pts.reduce((max, p) => (p.score > max.score ? p : max), pts[0]);
    const avg = Math.round(
      data.reduce((sum, item) => sum + item.score, 0) / Math.max(data.length, 1)
    );

    return { pathD: curveD, fillD: areaD, points: pts, peakPoint: peak, averageScore: avg };
  }, [data]);

  return (
    <View
      style={{
        backgroundColor: Colors.sand,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: Colors.sandDark,
        padding: 16,
        overflow: "hidden",
      }}
    >
      {/* Top Header Row with Streak & Metric Pill */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <View>
          <Text
            style={{
              color: Colors.espressoFaint,
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 2,
            }}
          >
            ENDORPHIN HIGH WAVE
          </Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginTop: 2 }}>
            <Text
              style={{
                color: Colors.espresso,
                fontSize: 22,
                fontWeight: "800",
                letterSpacing: -0.5,
              }}
            >
              {averageScore}
            </Text>
            <Text style={{ color: Colors.espressoMuted, fontSize: 11, fontWeight: "600" }}>
              / 100 AVG SOMATIC INDEX
            </Text>
          </View>
        </View>

        {/* Active Streak Badge */}
        <View
          style={{
            backgroundColor: Colors.olive,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Text style={{ color: Colors.chalk, fontSize: 11, fontWeight: "800", letterSpacing: 0.8 }}>
            ✦ {activeStreak}-DAY STREAK
          </Text>
        </View>
      </View>

      {/* SVG Mathematical Curve with Precision Somatic Cursor */}
      <View
        className="cursor-energy-wave"
        style={[
          { alignSelf: "center" },
          Platform.OS === "web" && ({
            cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Ccircle cx='12' cy='12' r='4.5' stroke='%235A6738' stroke-width='1.5' fill='%235A6738' fill-opacity='0.18'/%3E%3Cline x1='12' y1='2' x2='12' y2='6' stroke='%235A6738' stroke-width='1.5' stroke-linecap='round'/%3E%3Cline x1='12' y1='18' x2='12' y2='22' stroke='%235A6738' stroke-width='1.5' stroke-linecap='round'/%3E%3Cline x1='2' y1='12' x2='6' y2='12' stroke='%235A6738' stroke-width='1.5' stroke-linecap='round'/%3E%3Cline x1='18' y1='12' x2='22' y2='12' stroke='%235A6738' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E") 12 12, crosshair`,
          } as any),
        ]}
      >
        <Svg width={CHART_WIDTH - 32} height={CHART_HEIGHT}>
          {/* Reference Level Grid Lines (25, 50, 75) */}
          {[25, 50, 75].map((lvl) => {
            const usableH = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
            const y = PADDING_TOP + (1 - lvl / 100) * usableH;
            return (
              <Line
                key={lvl}
                x1={PADDING_HORIZONTAL}
                y1={y}
                x2={CHART_WIDTH - PADDING_HORIZONTAL}
                y2={y}
                stroke={Colors.sandDark}
                strokeWidth={1}
                strokeDasharray="4, 4"
              />
            );
          })}

          {/* Shaded Area Fill - Matte tint */}
          <Path d={fillD} fill={Colors.olive + "15"} />

          {/* Smooth Undulating Bezier Wave Stroke - Solid Matte */}
          <Path
            d={pathD}
            fill="none"
            stroke={Colors.olive}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Data Markers */}
          {points.map((p, idx) => {
            const isPeak = p === peakPoint;
            const isLatest = idx === points.length - 1;
            const pointColor = isPeak ? Colors.terracotta : isLatest ? Colors.olive : Colors.espresso;

            return (
              <React.Fragment key={idx}>
                <Circle
                  cx={p.x}
                  cy={p.y}
                  r={isPeak ? 5.5 : 3.5}
                  fill={pointColor}
                  stroke={Colors.chalk}
                  strokeWidth={isPeak ? 2 : 1.5}
                />
                {/* Day Labels below chart */}
                <SvgText
                  x={p.x}
                  y={CHART_HEIGHT - 8}
                  fontSize={9}
                  fontWeight="700"
                  fill={isLatest ? Colors.olive : Colors.espressoMuted}
                  textAnchor="middle"
                >
                  {p.label}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Peak Score Indicator Pill */}
          {peakPoint && (
            <SvgText
              x={peakPoint.x}
              y={Math.max(peakPoint.y - 9, 14)}
              fontSize={10}
              fontWeight="800"
              fill={Colors.terracotta}
              textAnchor="middle"
            >
              {peakPoint.score} PEAK
            </SvgText>
          )}
        </Svg>
      </View>

      {/* Footer State Classification */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopWidth: 1,
          borderTopColor: Colors.sandDark,
          paddingTop: 10,
          marginTop: 4,
        }}
      >
        <Text style={{ color: Colors.espressoMuted, fontSize: 11, fontWeight: "600" }}>
          Current State:{" "}
          <Text style={{ color: Colors.olive, fontWeight: "800" }}>
            {averageScore >= 85 ? "Peak Vitality High" : averageScore >= 70 ? "Active Flow State" : "Grounded"}
          </Text>
        </Text>
        <Text style={{ color: Colors.camel, fontSize: 11, fontWeight: "700" }}>
          Consecutive Flow
        </Text>
      </View>
    </View>
  );
}
