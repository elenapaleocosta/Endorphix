import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Colors } from "@/constants";
import type { Facility } from "@/types";

interface FacilityCardProps {
  facility: Facility;
  onPress: () => void;
}

export function FacilityCard({ facility, onPress }: FacilityCardProps) {
  const isTopRated = facility.rating >= 4.5;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: isTopRated ? Colors.glow + "40" : Colors.border,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          {/* Sport Tags */}
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              marginBottom: 6,
              flexWrap: "wrap",
            }}
          >
            {facility.primary_sports.slice(0, 2).map((sport) => (
              <View
                key={sport}
                style={{
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                  borderRadius: 5,
                  backgroundColor: Colors.elevated,
                }}
              >
                <Text
                  style={{
                    color: Colors.spark,
                    fontSize: 9,
                    fontWeight: "700",
                    letterSpacing: 1.5,
                  }}
                >
                  {sport.toUpperCase()}
                </Text>
              </View>
            ))}
            {facility.is_live && (
              <View
                style={{
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                  borderRadius: 5,
                  backgroundColor: Colors.live + "22",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: Colors.live,
                  }}
                />
                <Text
                  style={{
                    color: Colors.live,
                    fontSize: 9,
                    fontWeight: "700",
                    letterSpacing: 1.5,
                  }}
                >
                  LIVE
                </Text>
              </View>
            )}
          </View>

          <Text
            style={{
              color: Colors.primary,
              fontSize: 16,
              fontWeight: "700",
              lineHeight: 22,
            }}
            numberOfLines={2}
          >
            {facility.name}
          </Text>
        </View>

        {/* Rating */}
        <View
          style={{
            backgroundColor: Colors.elevated,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
            alignItems: "center",
            marginLeft: 12,
          }}
        >
          <Text
            style={{ color: Colors.glow, fontSize: 16, fontWeight: "800" }}
          >
            {facility.rating.toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Address + Distance */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{ color: Colors.secondary, fontSize: 12, flex: 1 }}
          numberOfLines={1}
        >
          {facility.address}
        </Text>
        {facility.distance_meters !== undefined && (
          <Text
            style={{
              color: Colors.tertiary,
              fontSize: 11,
              marginLeft: 8,
              fontWeight: "600",
            }}
          >
            {(facility.distance_meters / 1000).toFixed(1)} km
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
