import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useShallow } from "zustand/react/shallow";
import { Colors, MACRO_REALMS, MAX_RADIUS_KM, REALM_BY_ID } from "@/constants";
import { formatDistance, sportLabel } from "@/utils";
import { haptics } from "@/lib/haptics";
import { PlaceNotFoundError } from "@/lib/geocode";
import { canSwap, planTrip, swapDay } from "@/lib/trip";
import { useTripVenues } from "@/hooks/useFacilities";
import { useDiscoverStore } from "@/store/discover.store";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Eyebrow,
  IconButton,
  PageHeader,
  PressableScale,
  Screen,
  SectionHeader,
  SegmentedControl,
  Skeleton,
  Tag,
  TextField,
} from "@/components/ui";
import type { Facility } from "@/types";

const STAY_OPTIONS = ["1", "2", "3", "5", "7"] as const;
type StayValue = (typeof STAY_OPTIONS)[number];

/** Destination first: name a place and a length of stay, get one real venue per day near it. */
export default function TravelScreen() {
  const { destination, tourDays, trip, setDestination, setTourDays, setTrip } = useDiscoverStore(
    useShallow((s) => ({
      destination: s.destination,
      tourDays: s.tourDays,
      trip: s.trip,
      setDestination: s.setDestination,
      setTourDays: s.setTourDays,
      setTrip: s.setTrip,
    })),
  );
  const [inputError, setInputError] = useState<string>();
  const query = useTripVenues(trip?.destination ?? null);
  const notFound = query.error instanceof PlaceNotFoundError;

  const submit = () => {
    const place = destination.trim();
    if (!place) {
      setInputError("Enter a city or region.");
      haptics.error();
      return;
    }
    setInputError(undefined);
    setTrip({ destination: place, days: tourDays });
  };

  // One pulse per plan: success when venues arrive, error when the place or venues can't be found.
  useEffect(() => {
    if (query.isSuccess) {
      if (query.data.venues.length) haptics.success();
      else haptics.error();
    } else if (query.isError) {
      haptics.error();
    }
  }, [query.isSuccess, query.isError, query.data]);

  return (
    <Screen width="wide" inTabs>
      <PageHeader
        eyebrow="On the road"
        title="Travel"
        subtitle="Keep moving wherever you land. Name the place, and we'll line up a session for every day."
      />

      <Card className="gap-5">
        <TextField
          label="Where to?"
          value={destination}
          onChangeText={(value) => {
            setDestination(value);
            setInputError(undefined);
          }}
          error={inputError ?? (notFound ? `We couldn't find "${trip?.destination}". Try a city name.` : undefined)}
          placeholder="City or region, e.g. Palma, St. Moritz"
          autoCapitalize="words"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <View className="gap-2">
          <Text className="text-sm font-semibold text-fg">How many days</Text>
          <SegmentedControl<StayValue>
            accessibilityLabel="Length of stay"
            value={String(tourDays) as StayValue}
            onChange={(value) => setTourDays(Number(value))}
            options={STAY_OPTIONS.map((days) => ({
              value: days,
              label: days,
              hint: days === "1" ? "day" : "days",
              accessibilityLabel: `${days} ${days === "1" ? "day" : "days"}`,
            }))}
          />
        </View>
        <Button
          label="Plan my trip"
          icon="map-outline"
          haptic={false}
          loading={query.isFetching}
          onPress={submit}
        />
      </Card>

      <View className="mt-8">
        {!trip || notFound ? null : query.isPending || (query.isFetching && !query.data) ? (
          <TripSkeleton days={trip.days} />
        ) : query.isError ? (
          <ErrorState
            title="Couldn't plan this trip"
            message="Check your connection and try again."
            onRetry={() => query.refetch()}
          />
        ) : query.data && !query.data.venues.length ? (
          <EmptyState
            icon="map-outline"
            title={`No sports venues found near ${query.data.place.label}`}
            message={`OpenStreetMap had nothing within ${MAX_RADIUS_KM} km, or it's busy right now. Try again, or a bigger city nearby.`}
            actionLabel="Try again"
            onAction={() => query.refetch()}
          />
        ) : query.data ? (
          <TripPlan
            placeLabel={query.data.place.label}
            venues={query.data.venues}
            days={trip.days}
            sample={query.data.sample}
          />
        ) : null}
      </View>
    </Screen>
  );
}

function TripPlan({
  placeLabel,
  venues,
  days,
  sample,
}: {
  placeLabel: string;
  venues: Facility[];
  days: number;
  sample: boolean;
}) {
  const initial = useMemo(() => planTrip(venues, days), [venues, days]);
  const [picks, setPicks] = useState(initial);
  useEffect(() => setPicks(initial), [initial]);

  const byId = useMemo(() => new Map(venues.map((v) => [v.id, v])), [venues]);
  const mix = MACRO_REALMS.map((realm) => ({
    realm,
    count: venues.filter((v) => (v.macro_realm ?? "land") === realm.id).length,
  })).filter((m) => m.count > 0);

  return (
    <View>
      <SectionHeader title={placeLabel} />
      {sample ? (
        // Never pass sample venues off as local ones.
        <View className="-mt-1 mb-3 flex-row items-start gap-2">
          <Tag label="Sample" tone="highlight" />
          <Text className="min-w-0 flex-1 text-sm leading-5 text-fg-muted">
            Live venue data isn't answering right now, so this preview uses sample venues.
          </Text>
        </View>
      ) : null}
      <View className={`${sample ? "" : "-mt-2"} mb-4 flex-row flex-wrap items-center gap-x-3 gap-y-1`}>
        <Text className="text-sm text-fg-muted">
          {days} {days === 1 ? "day" : "days"} · {venues.length} {venues.length === 1 ? "venue" : "venues"} within{" "}
          {MAX_RADIUS_KM} km
        </Text>
        {mix.map((m) => (
          <View key={m.realm.id} className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: m.realm.accent }} />
            <Text className="text-sm text-fg-muted">
              {m.realm.label} {m.count}
            </Text>
          </View>
        ))}
      </View>

      <View className="-mx-1.5 flex-row flex-wrap">
        {picks.map((id, i) => {
          const venue = byId.get(id);
          if (!venue) return null;
          return (
            <View key={i} className="w-full p-1.5 md:w-1/2">
              <TripDayCard
                day={i + 1}
                venue={venue}
                placeLabel={placeLabel}
                onSwap={
                  canSwap(picks, i, venues)
                    ? () => {
                        haptics.selection();
                        setPicks((current) => swapDay(current, i, venues));
                      }
                    : undefined
                }
              />
            </View>
          );
        })}
      </View>

      {venues.length < days ? (
        <Text className="mt-2 text-sm text-fg-muted">
          Only {venues.length} {venues.length === 1 ? "venue" : "venues"} nearby, so some days repeat.
        </Text>
      ) : null}
      {sample ? null : (
        <Text className="mt-4 text-xs leading-5 text-fg-faint">
          Venue data © OpenStreetMap contributors. Check opening hours and booking before you go.
        </Text>
      )}
    </View>
  );
}

function TripDayCard({
  day,
  venue,
  placeLabel,
  onSwap,
}: {
  day: number;
  venue: Facility;
  placeLabel: string;
  onSwap?: () => void;
}) {
  const router = useRouter();
  const realm = REALM_BY_ID[venue.macro_realm ?? "land"];
  const distance = formatDistance(venue.distance_meters);
  const centre = placeLabel.split(",")[0];

  return (
    <Card>
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-2">
          <Eyebrow tone="accent">Day {day}</Eyebrow>
          <Tag label={realm.label} dotColor={realm.accent} />
        </View>
        {onSwap ? (
          <IconButton icon="shuffle" accessibilityLabel={`Swap the day ${day} venue`} haptic={false} onPress={onSwap} />
        ) : null}
      </View>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${venue.name}, open venue`}
        onPress={() => {
          haptics.tap();
          router.push(`/facility/${venue.id}`);
        }}
        className="mt-3 flex-row items-center gap-3"
      >
        <View className="min-w-0 flex-1">
          <Text numberOfLines={2} className="font-display-bold text-lg leading-6 text-fg">
            {venue.name}
          </Text>
          <Text numberOfLines={1} className="mt-1 text-sm text-fg-muted">
            {[venue.primary_sports.slice(0, 2).map(sportLabel).join(" · "), distance ? `${distance} from ${centre}` : null]
              .filter(Boolean)
              .join("  ·  ")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.fgMuted} />
      </PressableScale>
    </Card>
  );
}

function TripSkeleton({ days }: { days: number }) {
  return (
    <View accessibilityLabel="Finding venues" className="gap-3">
      <Skeleton className="h-6 w-48" />
      {Array.from({ length: Math.min(days, 3) }, (_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-2xl" />
      ))}
    </View>
  );
}
