import { useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors, MAX_RADIUS_KM, REALM_BY_ID, SPARK_MIN_RATING } from "@/constants";
import { formatDistance, sportLabel } from "@/utils";
import { haptics } from "@/lib/haptics";
import { openDirections } from "@/lib/maps";
import { useSparkFacilities } from "@/hooks/useFacilities";
import { useLocationStore } from "@/store/location.store";
import { Button, Card, EmptyState, ErrorState, Eyebrow, PageHeader, Screen, Tag } from "@/components/ui";
import type { Facility } from "@/types";

export default function SparkScreen() {
  const userLocation = useLocationStore((s) => s.userLocation);
  const { data: venues, isPending, isError, isFetching, refetch } = useSparkFacilities(userLocation);
  const [index, setIndex] = useState<number | null>(null);

  const venue = index !== null && venues?.length ? venues[index % venues.length] : undefined;

  const roll = async () => {
    haptics.impact();
    if (!venues?.length) return;
    const next = index === null ? 0 : index + 1;
    // Reshuffle once every venue has been shown.
    if (next > 0 && next % venues.length === 0) await refetch();
    setIndex(next);
  };

  let body: ReactNode = null;
  if (isError) {
    body = <ErrorState title="Couldn't reach the Spark engine" onRetry={() => refetch()} />;
  } else if (venues && !venues.length) {
    body = (
      <EmptyState
        icon="flash-outline"
        title={`No ${SPARK_MIN_RATING}★ venues within ${MAX_RADIUS_KM} km`}
        message="Try Discover to browse every venue nearby."
      />
    );
  } else if (venue) {
    body = <SparkResult venue={venue} />;
  }

  return (
    <Screen inTabs>
      <PageHeader
        eyebrow="Spontaneous action"
        eyebrowTone="terracotta"
        title="The Spark"
        subtitle={`One tap surfaces a top-rated venue (${SPARK_MIN_RATING}★ and up) within ${MAX_RADIUS_KM} km. Stop deciding, start moving.`}
      />

      <Button
        variant="spark"
        icon="flash"
        label={venue ? "Roll again" : "Surprise me"}
        loading={isPending || isFetching}
        disabled={isError || !venues?.length}
        onPress={roll}
        size="lg"
      />

      <View className="mt-6">{body}</View>
    </Screen>
  );
}

function SparkResult({ venue }: { venue: Facility }) {
  const router = useRouter();
  const realm = REALM_BY_ID[venue.macro_realm ?? "land"];
  const distance = formatDistance(venue.distance_meters);
  const recovery = venue.expand_activities?.[0];

  return (
    <MotiView
      key={venue.id}
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 250 }}
    >
      <Card accent>
        <View className="flex-row items-center justify-between gap-2">
          <Tag label="Spark pick" tone="terracotta" />
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={14} color={Colors.olive} />
            <Text className="text-base font-bold text-ink">{venue.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text accessibilityRole="header" className="mt-3 text-2xl font-extrabold text-ink">
          {venue.name}
        </Text>
        {venue.description ? (
          <Text className="mt-2 text-base leading-6 text-ink-muted">{venue.description}</Text>
        ) : null}

        <View className="mt-3 flex-row flex-wrap gap-2">
          <Tag label={realm.label} dotColor={realm.accent} />
          {venue.primary_sports.map((sport) => (
            <Tag key={sport} label={sportLabel(sport)} />
          ))}
        </View>

        <Text className="mt-3 text-sm text-ink-muted">
          {[venue.address, distance ? `${distance} away` : null].filter(Boolean).join(" · ")}
        </Text>

        {recovery ? (
          <View className="mt-4 rounded-xl border border-line bg-paper p-3">
            <Eyebrow tone="olive">On-site recovery</Eyebrow>
            <Text className="mt-1 text-sm font-semibold text-ink">
              {recovery.title} · {recovery.durationMinutes} min
            </Text>
          </View>
        ) : null}

        <View className="mt-5 gap-3 sm:flex-row">
          <Button
            label="View & book"
            icon="calendar-outline"
            onPress={() => router.push(`/facility/${venue.id}`)}
            className="sm:flex-1"
          />
          <Button
            label="Directions"
            icon="navigate-outline"
            variant="secondary"
            onPress={() => openDirections(venue)}
            className="sm:flex-1"
          />
        </View>
      </Card>
    </MotiView>
  );
}
