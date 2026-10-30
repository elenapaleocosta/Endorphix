import { useMemo, useState, Fragment } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import { Colors } from "@/constants";
import { energyBand } from "@/utils";
import { Card, EmptyState, ErrorState, Eyebrow, Skeleton } from "@/components/ui";
import type { EnergyWaveDataPoint } from "@/types";

const HEIGHT = 160;
const PAD_TOP = 22;
const PAD_BOTTOM = 26;
const PAD_X = 24;
const MIN_LABEL_SPACING = 56;

interface Point {
  x: number;
  y: number;
  score: number;
  label: string;
}

function buildGeometry(data: EnergyWaveDataPoint[], width: number) {
  const usableW = width - PAD_X * 2;
  const usableH = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const yFor = (score: number) => PAD_TOP + (1 - score / 100) * usableH;

  const points: Point[] = data.map((d, i) => ({
    x: data.length === 1 ? width / 2 : PAD_X + (i / (data.length - 1)) * usableW,
    y: yFor(d.score),
    score: d.score,
    label: d.dayLabel,
  }));

  // Cubic bézier spline with control offset (x[i+1] − x[i]) / 2.5.
  let line = "";
  if (points.length > 1) {
    line = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const dx = (b.x - a.x) / 2.5;
      line += ` C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
    }
  }
  const baseline = HEIGHT - PAD_BOTTOM;
  const area = line ? `${line} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z` : "";

  const peak = points.reduce((max, p) => (p.score > max.score ? p : max), points[0]);
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(1, Math.floor(width / MIN_LABEL_SPACING))));

  return { points, line, area, peak, labelEvery, gridY: [25, 50, 75].map(yFor) };
}

interface EnergyWaveChartProps {
  data: EnergyWaveDataPoint[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onLogFirst: () => void;
}

export function EnergyWaveChart({ data, isLoading, isError, onRetry, onLogFirst }: EnergyWaveChartProps) {
  const [width, setWidth] = useState(0);
  const points = useMemo(() => data ?? [], [data]);
  const geometry = useMemo(() => (width > 0 && points.length ? buildGeometry(points, width) : null), [points, width]);

  if (isLoading) return <Skeleton square className="h-64 w-full rounded-2xl" />;
  if (isError) return <ErrorState title="Couldn't load your energy wave" onRetry={onRetry} />;
  if (!points.length) {
    return (
      <EmptyState
        icon="pulse-outline"
        title="No energy logged in the last 30 days"
        message="Log how you feel after a session to start your wave."
        actionLabel="Log a session"
        onAction={onLogFirst}
      />
    );
  }

  const average = Math.round(points.reduce((sum, p) => sum + p.score, 0) / points.length);
  const band = energyBand(average);

  return (
    <Card>
      <Eyebrow>Endorphin wave · 30 days</Eyebrow>
      <View className="mt-1 flex-row flex-wrap items-baseline gap-x-2">
        <Text className="text-3xl font-display text-ink">{average}</Text>
        <Text className="text-sm text-ink-muted">average</Text>
        <View className="flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: band.color }} />
          <Text className="text-sm font-semibold text-ink">{band.label}</Text>
        </View>
      </View>

      <View
        className="mt-3"
        onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Energy wave of ${points.length} sessions. Average ${average}, peak ${Math.max(
          ...points.map((p) => p.score),
        )} out of 100.`}
      >
        {geometry ? (
          <Svg width={width} height={HEIGHT}>
            {geometry.gridY.map((y) => (
              <Line key={y} x1={PAD_X} x2={width - PAD_X} y1={y} y2={y} stroke={Colors.line} strokeDasharray="4 4" />
            ))}
            {geometry.area ? <Path d={geometry.area} fill={Colors.olive} fillOpacity={0.1} /> : null}
            {geometry.line ? (
              <Path d={geometry.line} fill="none" stroke={Colors.olive} strokeWidth={2.5} strokeLinecap="round" />
            ) : null}
            {geometry.points.map((p, i) => {
              const isPeak = p === geometry.peak;
              const isLast = i === geometry.points.length - 1;
              const showLabel = isLast || i % geometry.labelEvery === 0;
              return (
                <Fragment key={`${p.label}-${i}`}>
                  <Circle
                    cx={p.x}
                    cy={p.y}
                    r={isPeak ? 5 : 3.5}
                    fill={isPeak ? Colors.terracotta : Colors.olive}
                    stroke={Colors.sand}
                    strokeWidth={1.5}
                  />
                  {showLabel ? (
                    <SvgText x={p.x} y={HEIGHT - 6} fontSize={11} fill={Colors.inkMuted} textAnchor="middle">
                      {p.label}
                    </SvgText>
                  ) : null}
                </Fragment>
              );
            })}
            <SvgText
              x={geometry.peak.x}
              y={Math.max(geometry.peak.y - 10, 12)}
              fontSize={11}
              fontWeight="700"
              fill={Colors.terracotta}
              textAnchor="middle"
            >
              {`Peak ${geometry.peak.score}`}
            </SvgText>
          </Svg>
        ) : (
          <View style={{ height: HEIGHT }} />
        )}
      </View>
    </Card>
  );
}
