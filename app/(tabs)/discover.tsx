import { Children, type ReactNode } from "react";
import { Text, View } from "react-native";
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
import { useNearbyFacilities } from "@/hooks/useFacilities";
import { useDiscoverStore } from "@/store/discover.store";
import { useLocationStore } from "@/store/location.store";
import { FacilityCard, FacilityCardSkeleton } from "@/components/FacilityCard";
import {
  Button,
  Chip,
  EmptyState,
  ErrorState,
  Eyebrow,
  PageHeader,
  Screen,
  SectionHeader,
  Select,
} from "@/components/ui";

/** Sport first: venues near you, filtered by realm, sport and radius. Trip planning lives in the Travel tab. */
export default function DiscoverScreen() {
  return (
    <Screen width="wide" inTabs>
      <PageHeader eyebrow="endorphix" title="Discover" subtitle={`Venues within ${MAX_RADIUS_KM} km of you.`} />
      <SportFirst />
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
  const userLocation = useLocationStore((s) => s.userLocation);
  const locationStatus = useLocationStore((s) => s.status);
  const { selectedRealm, selectedSport, radiusKm, toggleRealm, setSport, setRadiusKm, clearFilters } =
    useDiscoverStore(
      useShallow((s) => ({
        selectedRealm: s.selectedRealm,
        selectedSport: s.selectedSport,
        radiusKm: s.radiusKm,
        toggleRealm: s.toggleRealm,
        setSport: s.setSport,
        setRadiusKm: s.setRadiusKm,
        clearFilters: s.clearFilters,
      })),
    );

  const filter = selectedSport ?? selectedRealm ?? undefined;
  const { data: facilities, isPending, isError, refetch } = useNearbyFacilities(userLocation, filter, radiusKm);

  const sports = selectedRealm ? SPORTS.filter((s) => s.realm === selectedRealm) : SPORTS;
  const hasFilters = Boolean(selectedRealm || selectedSport) || radiusKm !== MAX_RADIUS_KM;

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
        <Select
          accessibilityLabel="Sport"
          placeholder="Any sport"
          options={sports.map((sport) => ({ value: sport.id, label: sport.label }))}
          value={selectedSport}
          onChange={setSport}
        />
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
          <Ionicons name="location-outline" size={16} color={Colors.fgMuted} />
          <Text className="min-w-0 flex-1 text-sm text-fg-muted">
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
