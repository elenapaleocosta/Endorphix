import { Children, useState, type ReactNode } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useShallow } from "zustand/react/shallow";
import {
  Colors,
  FALLBACK_LOCATION_LABEL,
  MACRO_REALMS,
  MAX_RADIUS_KM,
  RADIUS_OPTIONS_KM,
  SPORTS,
} from "@/constants";
import { generateDestinationActionPackages } from "@/lib/geo-services";
import { haptics } from "@/lib/haptics";
import { useNearbyFacilities } from "@/hooks/useFacilities";
import { useDiscoverStore } from "@/store/discover.store";
import { useLocationStore } from "@/store/location.store";
import { FacilityCard, FacilityCardSkeleton } from "@/components/FacilityCard";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Eyebrow,
  PageHeader,
  Screen,
  SectionHeader,
  SegmentedControl,
  Tag,
  TextField,
  WIDE_BREAKPOINT,
} from "@/components/ui";
import type { SearchMode, TourDay } from "@/types";

const MODES: { value: SearchMode; label: string; hint: string }[] = [
  { value: "sport-first", label: "Sport first", hint: `Venues within ${MAX_RADIUS_KM} km` },
  { value: "destination-first", label: "Destination first", hint: "Multi-day trips" },
];

const STAY_OPTIONS = [1, 2, 3, 5, 7];

export default function DiscoverScreen() {
  const searchMode = useDiscoverStore((s) => s.searchMode);
  const setSearchMode = useDiscoverStore((s) => s.setSearchMode);

  return (
    <Screen width="wide" inTabs>
      <PageHeader eyebrow="endorphix" title="Discover" />
      <SegmentedControl
        accessibilityLabel="Search mode"
        options={MODES}
        value={searchMode}
        onChange={setSearchMode}
      />
      <View className="mt-6">{searchMode === "sport-first" ? <SportFirst /> : <DestinationFirst />}</View>
    </Screen>
  );
}

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="mb-5 gap-2">
      <Eyebrow>{label}</Eyebrow>
      {children}
    </View>
  );
}

function SportFirst() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const userLocation = useLocationStore((s) => s.userLocation);
  const locationStatus = useLocationStore((s) => s.status);
  const { selectedRealm, selectedSport, radiusKm, toggleRealm, toggleSport, setRadiusKm, clearFilters } =
    useDiscoverStore(
      useShallow((s) => ({
        selectedRealm: s.selectedRealm,
        selectedSport: s.selectedSport,
        radiusKm: s.radiusKm,
        toggleRealm: s.toggleRealm,
        toggleSport: s.toggleSport,
        setRadiusKm: s.setRadiusKm,
        clearFilters: s.clearFilters,
      })),
    );

  const filter = selectedSport ?? selectedRealm ?? undefined;
  const { data: facilities, isPending, isError, refetch } = useNearbyFacilities(userLocation, filter, radiusKm);

  const sports = selectedRealm ? SPORTS.filter((s) => s.realm === selectedRealm) : SPORTS;
  const hasFilters = Boolean(selectedRealm || selectedSport) || radiusKm !== MAX_RADIUS_KM;

  const sportChips = sports.map((sport) => (
    <Chip
      key={sport.id}
      label={sport.label}
      selected={selectedSport === sport.id}
      onPress={() => toggleSport(sport.id)}
    />
  ));

  let results: ReactNode;
  if (isPending) {
    results = (
      <ResultsGrid>
        {Array.from({ length: 6 }, (_, i) => (
          <FacilityCardSkeleton key={i} />
        ))}
      </ResultsGrid>
    );
  } else if (isError) {
    results = <ErrorState title="Couldn't load venues" onRetry={() => refetch()} />;
  } else if (!facilities?.length) {
    results = (
      <EmptyState
        title="No venues match these filters"
        message="Try a wider radius or a different realm."
        actionLabel={hasFilters ? "Clear filters" : undefined}
        onAction={hasFilters ? clearFilters : undefined}
      />
    );
  } else {
    results = (
      <ResultsGrid>
        {facilities.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            onPress={() => router.push(`/facility/${facility.id}`)}
          />
        ))}
      </ResultsGrid>
    );
  }

  return (
    <>
      <FilterGroup label="Realm">
        <View className="flex-row gap-2">
          {MACRO_REALMS.map((realm) => (
            <Chip
              key={realm.id}
              grow
              label={realm.label}
              sublabel={realm.descriptor}
              dotColor={realm.accent}
              selected={selectedRealm === realm.id}
              onPress={() => toggleRealm(realm.id)}
            />
          ))}
        </View>
      </FilterGroup>

      <FilterGroup label="Sport">
        {width >= WIDE_BREAKPOINT ? (
          <View className="flex-row flex-wrap gap-2">{sportChips}</View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {sportChips}
          </ScrollView>
        )}
      </FilterGroup>

      <FilterGroup label="Radius">
        <View className="flex-row flex-wrap gap-2">
          {RADIUS_OPTIONS_KM.map((km) => (
            <Chip
              key={km}
              label={`${km} km`}
              selected={radiusKm === km}
              onPress={() => setRadiusKm(km)}
            />
          ))}
        </View>
      </FilterGroup>

      <SectionHeader
        title={facilities && !isPending ? `${facilities.length} venues within ${radiusKm} km` : `Venues within ${radiusKm} km`}
        action={hasFilters ? <Button label="Clear filters" variant="link" onPress={clearFilters} /> : null}
      />

      {locationStatus === "fallback" ? (
        <View className="mb-3 flex-row items-center gap-2">
          <Ionicons name="location-outline" size={16} color={Colors.inkMuted} />
          <Text className="min-w-0 flex-1 text-sm text-ink-muted">
            Your location is unavailable, so we're showing venues near {FALLBACK_LOCATION_LABEL}.
          </Text>
        </View>
      ) : null}

      {results}
    </>
  );
}

function ResultsGrid({ children }: { children: ReactNode }) {
  return (
    <View className="-mx-2 flex-row flex-wrap">
      {Children.map(children, (child) => (
        <View className="w-full p-2 sm:w-1/2 lg:w-1/3">{child}</View>
      ))}
    </View>
  );
}

function DestinationFirst() {
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
    <>
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
          returnKeyType="go"
          onSubmitEditing={buildPlan}
        />
        <View className="gap-2">
          <Text className="text-sm font-semibold text-ink">Length of stay</Text>
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
          <SectionHeader title={`${tourPlan.days}-day plan · ${tourPlan.destination}`} />
          <Text className="-mt-1 mb-2 text-sm text-ink-muted">Sessions are drawn from endorphix partner venues.</Text>
          <View className="-mx-2 flex-row flex-wrap">
            {tourPlan.tour_days.map((day) => (
              <View key={day.day} className="w-full p-2 md:w-1/2">
                <TourDayCard day={day} />
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </>
  );
}

function TourDayCard({ day }: { day: TourDay }) {
  const router = useRouter();
  return (
    <Card>
      <Eyebrow tone="olive">Day {day.day}</Eyebrow>
      <Text className="mt-1 text-lg font-bold text-ink">{day.theme}</Text>
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
            className="rounded-xl border border-line bg-paper p-3 active:opacity-80"
          >
            <View className="flex-row items-start justify-between gap-2">
              <Text className="min-w-0 flex-1 text-sm font-bold text-ink">{activity.title}</Text>
              <Tag label={activity.intensity} tone={activity.intensity === "Recovery" ? "neutral" : "terracotta"} />
            </View>
            <Text className="mt-1 text-sm leading-5 text-ink-muted">{activity.description}</Text>
            <View className="mt-2 flex-row items-center gap-1">
              <Text numberOfLines={1} className="min-w-0 flex-1 text-sm font-semibold text-olive">
                {activity.facility.name}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.olive} />
            </View>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}
