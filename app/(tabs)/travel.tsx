import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useShallow } from "zustand/react/shallow";
import { Colors, MAX_RADIUS_KM } from "@/constants";
import { generateDestinationActionPackages } from "@/lib/geo-services";
import { haptics } from "@/lib/haptics";
import { useDiscoverStore } from "@/store/discover.store";
import { Button, Card, Chip, Eyebrow, PageHeader, Screen, SectionHeader, Tag, TextField } from "@/components/ui";
import type { TourDay } from "@/types";

const STAY_OPTIONS = [1, 2, 3, 5, 7];

/** Destination first: pick a place and a length of stay, get a day-by-day plan of sessions. */
export default function TravelScreen() {
  const { destination, tourDays, tourPlan, setDestination, setTourDays, setTourPlan } = useDiscoverStore(
    useShallow((s) => ({
      destination: s.destination,
      tourDays: s.tourDays,
      tourPlan: s.tourPlan,
      setDestination: s.setDestination,
      setTourDays: s.setTourDays,
      setTourPlan: s.setTourPlan,
    })),
  );
  const [error, setError] = useState<string>();

  const buildPlan = () => {
    if (!destination.trim()) {
      setError("Enter a destination.");
      haptics.error();
      return;
    }
    setTourPlan(
      generateDestinationActionPackages(destination.trim(), tourDays, MAX_RADIUS_KM, ["land", "water", "mountain"]),
    );
    haptics.success();
  };

  return (
    <Screen width="wide" inTabs>
      <PageHeader eyebrow="endorphix" title="Travel" subtitle="Plan a session for every day of your trip." />

      <Card className="gap-5">
        <TextField
          label="Destination"
          value={destination}
          onChangeText={(value) => {
            setDestination(value);
            setError(undefined);
          }}
          error={error}
          placeholder="e.g. St. Moritz, Monaco, Mallorca"
          hint="Plans use sample venues for now, not venues at your destination."
          returnKeyType="go"
          onSubmitEditing={buildPlan}
        />
        <View className="gap-2">
          <Text className="text-sm font-semibold text-fg">Length of stay</Text>
          <View className="flex-row gap-2">
            {STAY_OPTIONS.map((days) => (
              <Chip
                key={days}
                grow
                label={`${days}d`}
                accessibilityLabel={`${days} ${days === 1 ? "day" : "days"}`}
                selected={tourDays === days}
                onPress={() => setTourDays(days)}
              />
            ))}
          </View>
        </View>
        <Button label="Build my itinerary" icon="map-outline" onPress={buildPlan} />
      </Card>

      {tourPlan ? (
        <View className="mt-8">
          <SectionHeader title={`${tourPlan.days}-day sample plan · ${tourPlan.destination}`} />
          {/* The generator doesn't look up venues by place yet, so say so rather than imply these are local. */}
          <View className="-mt-1 mb-2 flex-row items-start gap-2">
            <Tag label="Sample" tone="highlight" />
            <Text className="min-w-0 flex-1 text-sm text-fg-muted">
              endorphix can't search venues in {tourPlan.destination} yet, so this plan uses our curated sample venues
              to show how a {tourPlan.days}-day trip could look.
            </Text>
          </View>
          <View className="-mx-2 flex-row flex-wrap">
            {tourPlan.tour_days.map((day) => (
              <View key={day.day} className="w-full p-2 md:w-1/2">
                <TourDayCard day={day} />
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

function TourDayCard({ day }: { day: TourDay }) {
  const router = useRouter();
  return (
    <Card>
      <Eyebrow tone="accent">Day {day.day}</Eyebrow>
      <Text className="mt-1 text-lg font-bold text-fg">{day.theme}</Text>
      <View className="mt-3 gap-3">
        {day.activities.map((activity) => (
          <Pressable
            key={activity.title}
            accessibilityRole="button"
            accessibilityHint={`Opens ${activity.facility.name}`}
            onPress={() => {
              haptics.tap();
              router.push(`/facility/${activity.facility.id}`);
            }}
            className="rounded-xl border border-line bg-raised p-3 active:scale-[0.98]"
          >
            <View className="flex-row items-start justify-between gap-2">
              <Text className="min-w-0 flex-1 text-sm font-bold text-fg">{activity.title}</Text>
              <Tag label={activity.intensity} tone={activity.intensity === "Recovery" ? "neutral" : "highlight"} />
            </View>
            <Text className="mt-1 text-sm leading-5 text-fg-muted">{activity.description}</Text>
            <View className="mt-2 flex-row items-center gap-1">
              <Text numberOfLines={1} className="min-w-0 flex-1 text-sm font-semibold text-accent">
                {activity.facility.name}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.accent} />
            </View>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}
