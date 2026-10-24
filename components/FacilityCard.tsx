import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/constants";
import type { Facility } from "@/types";

interface FacilityCardProps {
  facility: Facility;
  onPress: () => void;
}

const REALM_THEMES: Record<string, { label: string; color: string; bg: string }> = {
  water: {
    label: "WATER",
    color: Colors.camel,
    bg: Colors.camel + "22",
  },
  land: {
    label: "LAND",
    color: Colors.olive,
    bg: Colors.olive + "22",
  },
  mountain: {
    label: "MOUNTAIN",
    color: Colors.terracotta,
    bg: Colors.terracotta + "22",
  },
};

export function FacilityCard({ facility, onPress }: FacilityCardProps) {
  const realm = facility.macro_realm || "land";
  const realmTheme = REALM_THEMES[realm] || REALM_THEMES.land;
  const imageUrl =
    facility.images?.[0] ||
    "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={{
        backgroundColor: Colors.sand,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.sandDark,
        marginBottom: 14,
        cursor: "pointer" as any,
        overflow: "hidden",
      }}
    >
      {/* Facility Picture */}
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: "100%",
          height: 140,
          borderRadius: 10,
          backgroundColor: Colors.sandDark,
          marginBottom: 12,
        }}
        resizeMode="cover"
      />

      {/* Badges Row: Realm Badge & Rating Badge */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          width: "100%",
        }}
      >
        {/* Realm Badge */}
        <View
          style={{
            backgroundColor: realmTheme.bg,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            alignSelf: "flex-start",
          }}
        >
          <Text
            style={{
              color: realmTheme.color,
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 1.2,
            }}
          >
            {realmTheme.label}
          </Text>
        </View>

        {/* Rating Badge (Self-contained, bounded to prevent overflow) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors.olive,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            flexShrink: 0,
          }}
        >
          <Text
            style={{
              color: Colors.chalk,
              fontSize: 11,
              fontWeight: "800",
              letterSpacing: 0.3,
            }}
          >
            ★ {facility.rating ? facility.rating.toFixed(1) : "5.0"}
          </Text>
        </View>
      </View>

      {/* Facility Name */}
      <Text
        style={{
          color: Colors.espresso,
          fontSize: 16,
          fontWeight: "800",
          letterSpacing: -0.2,
          lineHeight: 22,
          marginBottom: 4,
        }}
        numberOfLines={2}
      >
        {facility.name}
      </Text>

      {/* Facility Address + Distance */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 2,
        }}
      >
        <Text
          style={{
            color: Colors.espressoMuted,
            fontSize: 12,
            lineHeight: 16,
            flex: 1,
            marginRight: 8,
          }}
          numberOfLines={1}
        >
          {facility.address}
        </Text>
        {facility.distance_meters !== undefined && (
          <Text
            style={{
              color: Colors.espressoFaint,
              fontSize: 11,
              fontWeight: "600",
              flexShrink: 0,
            }}
          >
            {(facility.distance_meters / 1000).toFixed(1)} km
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
