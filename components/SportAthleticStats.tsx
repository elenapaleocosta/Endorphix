import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Colors } from "@/constants";
import { useResponsive } from "@/hooks/useResponsive";
import type { Booking, SportCategory } from "@/types";

interface SportAthleticStatsProps {
  bookings: Booking[];
  selectedSport?: SportCategory | null;
  onSelectSport?: (sport: SportCategory | null) => void;
}

type Timeframe = "today" | "week" | "month" | "6months" | "all";

// Base athletic value weightings for athleticism index
const SPORT_VALUATION: Record<
  string,
  {
    icon: string;
    label: string;
    aerobicScore: number; // 0 - 100
    strengthScore: number;
    agilityScore: number;
    enduranceScore: number;
    athleticValueRating: number; // 0 - 100
  }
> = {
  football: {
    icon: "⚽",
    label: "Soccer / Football",
    aerobicScore: 92,
    strengthScore: 78,
    agilityScore: 96,
    enduranceScore: 91,
    athleticValueRating: 94,
  },
  basketball: {
    icon: "🏀",
    label: "Basketball",
    aerobicScore: 90,
    strengthScore: 82,
    agilityScore: 94,
    enduranceScore: 88,
    athleticValueRating: 91,
  },
  volleyball: {
    icon: "🏐",
    label: "Volleyball",
    aerobicScore: 80,
    strengthScore: 79,
    agilityScore: 92,
    enduranceScore: 76,
    athleticValueRating: 84,
  },
  tennis: {
    icon: "🎾",
    label: "Tennis",
    aerobicScore: 88,
    strengthScore: 75,
    agilityScore: 93,
    enduranceScore: 89,
    athleticValueRating: 89,
  },
  swimming: {
    icon: "🏊",
    label: "Swimming",
    aerobicScore: 97,
    strengthScore: 91,
    agilityScore: 72,
    enduranceScore: 98,
    athleticValueRating: 96,
  },
  hiking: {
    icon: "🥾",
    label: "Hiking",
    aerobicScore: 86,
    strengthScore: 84,
    agilityScore: 74,
    enduranceScore: 95,
    athleticValueRating: 88,
  },
  running: {
    icon: "🏃",
    label: "Running",
    aerobicScore: 96,
    strengthScore: 74,
    agilityScore: 79,
    enduranceScore: 96,
    athleticValueRating: 92,
  },
  cycling: {
    icon: "🚴",
    label: "Cycling",
    aerobicScore: 93,
    strengthScore: 84,
    agilityScore: 70,
    enduranceScore: 95,
    athleticValueRating: 90,
  },
  climbing: {
    icon: "🧗",
    label: "Climbing",
    aerobicScore: 76,
    strengthScore: 96,
    agilityScore: 90,
    enduranceScore: 87,
    athleticValueRating: 93,
  },
  padel: {
    icon: "🏓",
    label: "Padel",
    aerobicScore: 84,
    strengthScore: 70,
    agilityScore: 91,
    enduranceScore: 83,
    athleticValueRating: 82,
  },
  surfing: {
    icon: "🏄",
    label: "Surfing",
    aerobicScore: 88,
    strengthScore: 86,
    agilityScore: 92,
    enduranceScore: 86,
    athleticValueRating: 91,
  },
  gym: {
    icon: "🏋️",
    label: "Athletic Gym",
    aerobicScore: 75,
    strengthScore: 98,
    agilityScore: 70,
    enduranceScore: 80,
    athleticValueRating: 85,
  },
  boxing: {
    icon: "🥊",
    label: "Boxing",
    aerobicScore: 95,
    strengthScore: 88,
    agilityScore: 96,
    enduranceScore: 92,
    athleticValueRating: 95,
  },
  rowing: {
    icon: "🚣",
    label: "Rowing",
    aerobicScore: 96,
    strengthScore: 93,
    agilityScore: 70,
    enduranceScore: 97,
    athleticValueRating: 94,
  },
  yoga: {
    icon: "🧘",
    label: "Yoga",
    aerobicScore: 68,
    strengthScore: 78,
    agilityScore: 86,
    enduranceScore: 72,
    athleticValueRating: 77,
  },
  pilates: {
    icon: "🤸",
    label: "Pilates",
    aerobicScore: 70,
    strengthScore: 80,
    agilityScore: 85,
    enduranceScore: 75,
    athleticValueRating: 79,
  },
  crossfit: {
    icon: "⚡",
    label: "CrossFit",
    aerobicScore: 94,
    strengthScore: 96,
    agilityScore: 88,
    enduranceScore: 93,
    athleticValueRating: 95,
  },
};

const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "6months", label: "6 Months" },
  { id: "all", label: "Generally" },
];

export function SportAthleticStats({
  bookings,
  selectedSport,
  onSelectSport,
}: SportAthleticStatsProps) {
  const { isWide } = useResponsive();
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>("all");

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const ONE_WEEK = 7 * ONE_DAY;
  const ONE_MONTH = 30 * ONE_DAY;
  const SIX_MONTHS = 180 * ONE_DAY;

  // Function to filter bookings by timeframe
  const filterByTime = (b: Booking, timeframe: Timeframe) => {
    const bookingTime = new Date(b.created_at).getTime();
    const diff = now - bookingTime;

    switch (timeframe) {
      case "today":
        return diff <= ONE_DAY;
      case "week":
        return diff <= ONE_WEEK;
      case "month":
        return diff <= ONE_MONTH;
      case "6months":
        return diff <= SIX_MONTHS;
      case "all":
      default:
        return true;
    }
  };

  // Map bookings to sport category
  const getSportCategory = (b: Booking): string => {
    if (b.sport_category) return b.sport_category;
    if (b.activity_type === "tennis") return "tennis";
    if (b.activity_type === "swim") return "swimming";
    if (b.activity_type === "run") return "running";
    if (b.activity_type === "cycle") return "cycling";
    if (b.activity_type === "climb") return "climbing";
    if (b.activity_type === "hike") return "hiking";
    if (b.activity_type === "soccer") return "football";
    if (b.activity_type === "basketball") return "basketball";
    if (b.activity_type === "yoga") return "yoga";
    return "tennis";
  };

  // Count orders per sport for current timeframe
  const countsPerSport: Record<string, number> = {};
  const currentFilteredBookings = bookings.filter((b) =>
    filterByTime(b, activeTimeframe)
  );

  currentFilteredBookings.forEach((b) => {
    const sp = getSportCategory(b);
    countsPerSport[sp] = (countsPerSport[sp] || 0) + 1;
  });

  // Calculate stats for all available sports in valuation
  const sportsStats = Object.keys(SPORT_VALUATION).map((key) => {
    const val = SPORT_VALUATION[key];
    const orderCount = countsPerSport[key] || 0;

    // Detailed counts across all time horizons for modal/tooltip view
    const countToday = bookings.filter(
      (b) => getSportCategory(b) === key && filterByTime(b, "today")
    ).length;
    const countWeek = bookings.filter(
      (b) => getSportCategory(b) === key && filterByTime(b, "week")
    ).length;
    const countMonth = bookings.filter(
      (b) => getSportCategory(b) === key && filterByTime(b, "month")
    ).length;
    const count6Months = bookings.filter(
      (b) => getSportCategory(b) === key && filterByTime(b, "6months")
    ).length;
    const countAll = bookings.filter(
      (b) => getSportCategory(b) === key && filterByTime(b, "all")
    ).length;

    // Athletic Value score incorporates base physical stimulus + user engagement frequency bonus
    const engagementBonus = Math.min(orderCount * 4, 12);
    const dynamicAthleticValue = Math.min(
      val.athleticValueRating + engagementBonus,
      100
    );

    return {
      sportKey: key as SportCategory,
      ...val,
      orderCount,
      countToday,
      countWeek,
      countMonth,
      count6Months,
      countAll,
      dynamicAthleticValue,
    };
  });

  // Sort by athletic value or active bookings
  sportsStats.sort((a, b) => {
    if (b.orderCount !== a.orderCount) {
      return b.orderCount - a.orderCount;
    }
    return b.dynamicAthleticValue - a.dynamicAthleticValue;
  });

  // Top MVP sport for athleticism
  const topSport = sportsStats[0];

  return (
    <View
      style={{
        backgroundColor: Colors.sand,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: Colors.sandDark,
        marginBottom: 20,
      }}
    >
      {/* Header */}
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
              letterSpacing: 1.5,
            }}
          >
            ORDER METRICS & ATHLETIC VALUATION
          </Text>
          <Text
            style={{
              color: Colors.espresso,
              fontSize: 17,
              fontWeight: "800",
              letterSpacing: -0.4,
              marginTop: 2,
            }}
          >
            Athletic Task Bar & Sport Orders
          </Text>
        </View>

        {/* Total badge */}
        <View
          style={{
            backgroundColor: Colors.olive,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: Colors.chalk, fontSize: 11, fontWeight: "800" }}>
            {bookings.length} RESERVATIONS
          </Text>
        </View>
      </View>

      <Text
        style={{
          color: Colors.espressoMuted,
          fontSize: 12.5,
          lineHeight: 17,
          marginBottom: 14,
        }}
      >
        Track frequency of orders across timeframes and determine which sport provides the highest conditioning value for your athleticism.
      </Text>

      {/* Timeframe selector pill bar */}
      <View style={{ marginBottom: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6 }}
        >
          {TIMEFRAMES.map((tf) => {
            const isSelected = activeTimeframe === tf.id;
            return (
              <TouchableOpacity
                key={tf.id}
                onPress={() => setActiveTimeframe(tf.id)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: isSelected ? Colors.espresso : Colors.softChalk,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: isSelected ? Colors.espresso : Colors.sandDark,
                }}
              >
                <Text
                  style={{
                    color: isSelected ? Colors.chalk : Colors.espresso,
                    fontSize: 11,
                    fontWeight: isSelected ? "800" : "600",
                  }}
                >
                  {tf.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Top Athleticism Highlight Card */}
      {topSport && (
        <View
          style={{
            backgroundColor: Colors.softChalk,
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: Colors.sandDark,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 18 }}>🏆</Text>
              <Text
                style={{
                  color: Colors.olive,
                  fontSize: 11,
                  fontWeight: "800",
                  letterSpacing: 1,
                }}
              >
                MOST VALUABLE SPORT FOR ATHLETICISM
              </Text>
            </View>
            <View
              style={{
                backgroundColor: Colors.olive + "18",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: Colors.olive + "44",
              }}
            >
              <Text style={{ color: Colors.olive, fontSize: 11, fontWeight: "800" }}>
                {topSport.dynamicAthleticValue}/100 SCORE
              </Text>
            </View>
          </View>

          <Text style={{ color: Colors.espresso, fontSize: 16, fontWeight: "800" }}>
            {topSport.icon} {topSport.label}
          </Text>
          <Text
            style={{
              color: Colors.espressoMuted,
              fontSize: 12,
              lineHeight: 16,
              marginTop: 3,
            }}
          >
            Based on cardiovascular load, fast-twitch motor units & your active bookings ({topSport.orderCount} orders in this timeframe).
          </Text>

          {/* Athletic Performance Progress Bar */}
          <View style={{ marginTop: 10 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <Text style={{ color: Colors.espressoMuted, fontSize: 10, fontWeight: "700" }}>
                Athletic Conditioning Load
              </Text>
              <Text style={{ color: Colors.espresso, fontSize: 10, fontWeight: "800" }}>
                {topSport.dynamicAthleticValue}%
              </Text>
            </View>
            <View
              style={{
                height: 7,
                backgroundColor: Colors.sandDark,
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${topSport.dynamicAthleticValue}%`,
                  height: "100%",
                  backgroundColor: Colors.olive,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        </View>
      )}

      {/* Task Bar & Sport Breakdown List */}
      <Text
        style={{
          color: Colors.espressoMuted,
          fontSize: 11,
          fontWeight: "800",
          letterSpacing: 1.2,
          marginBottom: 10,
        }}
      >
        INDIVIDUAL SPORT ORDERS & TASK METRICS
      </Text>

      <View style={{ flexDirection: isWide ? "row" : "column", flexWrap: "wrap", justifyContent: "space-between", gap: 10 }}>
        {sportsStats.slice(0, 8).map((item) => {
          const isSelected = selectedSport === item.sportKey;
          return (
            <TouchableOpacity
              key={item.sportKey}
              onPress={() => onSelectSport?.(item.sportKey)}
              activeOpacity={0.8}
              style={{
                backgroundColor: isSelected ? Colors.olive + "14" : Colors.softChalk,
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: isSelected ? Colors.olive : Colors.sandDark,
                width: isWide ? "48.8%" : "100%",
              }}
            >
              {/* Row 1: Sport Name and Order Counts Across Intervals */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                  <Text
                    style={{
                      color: Colors.espresso,
                      fontSize: 13.5,
                      fontWeight: "800",
                    }}
                  >
                    {item.label}
                  </Text>
                </View>

                {/* Orders counter badge */}
                <View
                  style={{
                    backgroundColor: item.orderCount > 0 ? Colors.terracotta : Colors.sandDark,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: Colors.chalk, fontSize: 10, fontWeight: "800" }}>
                    {item.orderCount} {item.orderCount === 1 ? "ORDER" : "ORDERS"}
                  </Text>
                </View>
              </View>

              {/* Timeframe mini-statistics breakdown */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  backgroundColor: Colors.sand,
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 5,
                  marginBottom: 8,
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: Colors.espressoFaint, fontSize: 9, fontWeight: "700" }}>
                    Today
                  </Text>
                  <Text style={{ color: Colors.espresso, fontSize: 11, fontWeight: "800" }}>
                    {item.countToday}
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: Colors.espressoFaint, fontSize: 9, fontWeight: "700" }}>
                    Week
                  </Text>
                  <Text style={{ color: Colors.espresso, fontSize: 11, fontWeight: "800" }}>
                    {item.countWeek}
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: Colors.espressoFaint, fontSize: 9, fontWeight: "700" }}>
                    Month
                  </Text>
                  <Text style={{ color: Colors.espresso, fontSize: 11, fontWeight: "800" }}>
                    {item.countMonth}
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: Colors.espressoFaint, fontSize: 9, fontWeight: "700" }}>
                    6 Months
                  </Text>
                  <Text style={{ color: Colors.espresso, fontSize: 11, fontWeight: "800" }}>
                    {item.count6Months}
                  </Text>
                </View>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: Colors.espressoFaint, fontSize: 9, fontWeight: "700" }}>
                    Generally
                  </Text>
                  <Text style={{ color: Colors.espresso, fontSize: 11, fontWeight: "800" }}>
                    {item.countAll}
                  </Text>
                </View>
              </View>

              {/* Task Bar Conditioning Meter */}
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 3,
                  }}
                >
                  <Text style={{ color: Colors.espressoMuted, fontSize: 9.5, fontWeight: "700" }}>
                    Athletic Value Index
                  </Text>
                  <Text style={{ color: Colors.olive, fontSize: 9.5, fontWeight: "800" }}>
                    {item.dynamicAthleticValue} / 100
                  </Text>
                </View>
                <View
                  style={{
                    height: 5,
                    backgroundColor: Colors.sandDark,
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${item.dynamicAthleticValue}%`,
                      height: "100%",
                      backgroundColor:
                        item.dynamicAthleticValue >= 90
                          ? Colors.terracotta
                          : item.dynamicAthleticValue >= 80
                          ? Colors.olive
                          : Colors.camel,
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
