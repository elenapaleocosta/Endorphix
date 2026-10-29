import { Image, Pressable, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors, REALM_BY_ID } from "@/constants";
import { formatDistance } from "@/utils";
import { haptics } from "@/lib/haptics";
import { Skeleton, Tag } from "@/components/ui";
import type { Facility } from "@/types";

interface FacilityCardProps {
  facility: Facility;
  onPress: () => void;
}

export function FacilityCard({ facility, onPress }: FacilityCardProps) {
  const realm = REALM_BY_ID[facility.macro_realm ?? "land"];
  const distance = formatDistance(facility.distance_meters);
  const rated = facility.review_count > 0;
  const image = facility.images[0];

  const a11yLabel = [
    facility.name,
    realm.label,
    rated ? `rated ${facility.rating.toFixed(1)}` : null,
    distance ? `${distance} away` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityHint="Opens venue details"
      onPress={() => {
        haptics.tap();
        onPress();
      }}
      className="overflow-hidden rounded-2xl border border-line bg-sand active:opacity-90"
    >
      {image ? (
        <Image source={{ uri: image }} resizeMode="cover" className="h-36 w-full bg-line" />
      ) : (
        <View className="h-36 w-full items-center justify-center bg-line">
          <Ionicons name="image-outline" size={28} color={Colors.inkMuted} />
        </View>
      )}

      <View className="gap-2 p-4">
        <View className="flex-row items-center justify-between gap-2">
          <Tag label={realm.label} dotColor={realm.accent} />
          {rated ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={12} color={Colors.olive} />
              <Text className="text-sm font-bold text-ink">{facility.rating.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>

        <Text numberOfLines={2} className="text-lg font-bold leading-6 text-ink">
          {facility.name}
        </Text>

        <View className="flex-row items-center gap-3">
          <Text numberOfLines={1} className="min-w-0 flex-1 text-sm text-ink-muted">
            {facility.address || "Address not listed"}
          </Text>
          {distance ? <Text className="shrink-0 text-sm font-semibold text-ink">{distance}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

export function FacilityCardSkeleton() {
  return (
    <View className="overflow-hidden rounded-2xl border border-line bg-sand">
      <Skeleton square className="h-36 w-full" />
      <View className="gap-3 p-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </View>
    </View>
  );
}
