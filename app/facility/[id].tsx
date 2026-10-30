import { useState, type ReactNode } from "react";
import { Image, Linking, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors, REALM_BY_ID } from "@/constants";
import { formatDistance, sportLabel, sportToActivityType, toIsoDate } from "@/utils";
import { haptics } from "@/lib/haptics";
import { openDirections } from "@/lib/maps";
import { goBackOr } from "@/lib/navigation";
import { FacilityNotFoundError, useFacilityDetail } from "@/hooks/useFacilities";
import { useBookingStore } from "@/store/booking.store";
import { TimetableCard } from "@/components/TimetableCard";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Eyebrow,
  IconButton,
  Screen,
  SectionHeader,
  Skeleton,
  Tag,
} from "@/components/ui";
import type { Facility } from "@/types";

const SLOTS = [
  { start: "07:30", end: "08:30", label: "Court 1" },
  { start: "14:00", end: "15:00", label: "Court 2" },
  { start: "16:30", end: "17:30", label: "Court 1" },
  { start: "18:00", end: "19:00", label: "Court 3" },
];

export default function FacilityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: facility, isPending, isError, error, refetch } = useFacilityDetail(id);

  const goBack = () => goBackOr(router, "/(tabs)/discover");

  let body: ReactNode;
  if (isPending) {
    body = (
      <View className="gap-4">
        <Skeleton className="h-56 w-full rounded-2xl" square />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-40 w-full rounded-2xl" square />
      </View>
    );
  } else if (isError && error instanceof FacilityNotFoundError) {
    body = (
      <EmptyState
        icon="location-outline"
        title="Venue not found"
        message="It may have been removed or is no longer listed."
        actionLabel="Back to Discover"
        onAction={() => router.replace("/(tabs)/discover")}
      />
    );
  } else if (isError) {
    body = <ErrorState title="Couldn't load this venue" onRetry={() => refetch()} />;
  } else {
    body = facility ? <FacilityDetail facility={facility} /> : null;
  }

  return (
    <Screen>
      <IconButton icon="arrow-back" accessibilityLabel="Back" onPress={goBack} className="mb-4" />
      {body}
    </Screen>
  );
}

function FacilityDetail({ facility }: { facility: Facility }) {
  const realm = REALM_BY_ID[facility.macro_realm ?? "land"];
  const distance = formatDistance(facility.distance_meters);
  const rated = facility.review_count > 0;

  return (
    <>
      {facility.images[0] ? (
        <Image
          source={{ uri: facility.images[0] }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          className="mb-5 h-56 w-full rounded-2xl bg-line"
        />
      ) : null}

      <View className="flex-row flex-wrap gap-2">
        <Tag label={realm.label} dotColor={realm.accent} />
        {facility.primary_sports.map((sport) => (
          <Tag key={sport} label={sportLabel(sport)} />
        ))}
      </View>

      <Text accessibilityRole="header" className="mt-3 text-3xl font-display text-ink">
        {facility.name}
      </Text>
      <Text className="mt-1 text-base text-ink-muted">
        {[facility.address, distance ? `${distance} away` : null].filter(Boolean).join(" · ")}
      </Text>
      {rated ? (
        <View className="mt-2 flex-row items-center gap-1">
          <Ionicons name="star" size={14} color={Colors.olive} />
          <Text className="text-sm font-semibold text-ink">
            {facility.rating.toFixed(1)} · {facility.review_count} reviews
          </Text>
        </View>
      ) : null}

      <View className="mt-5 flex-row flex-wrap gap-2">
        <Button label="Directions" icon="navigate-outline" size="sm" onPress={() => openDirections(facility)} />
        {facility.phone ? (
          <Button
            label="Call"
            icon="call-outline"
            size="sm"
            variant="secondary"
            onPress={() => Linking.openURL(`tel:${facility.phone}`)}
          />
        ) : null}
        {facility.website ? (
          <Button
            label="Website"
            icon="open-outline"
            size="sm"
            variant="secondary"
            onPress={() => Linking.openURL(facility.website!)}
          />
        ) : null}
      </View>

      {facility.description ? (
        <View className="mt-8">
          <SectionHeader title="About" />
          <Text className="text-base leading-6 text-ink">{facility.description}</Text>
        </View>
      ) : null}

      {facility.expand_activities?.length ? (
        <View className="mt-8">
          <SectionHeader title="Expand your energy" />
          <View className="gap-3">
            {facility.expand_activities.map((activity) => (
              <Card key={activity.id}>
                <View className="flex-row items-start justify-between gap-3">
                  <Text className="min-w-0 flex-1 text-base font-bold text-ink">{activity.title}</Text>
                  <Tag label={`${activity.durationMinutes} min`} />
                </View>
                <Text className="mt-1 text-sm leading-5 text-ink-muted">{activity.description}</Text>
              </Card>
            ))}
          </View>
        </View>
      ) : null}

      <View className="mt-8">
        <SectionHeader title="Book a slot" />
        <BookingPanel facility={facility} />
      </View>

      <View className="mt-8">
        <SectionHeader title="Opening hours" />
        <TimetableCard timetable={facility.timetable} />
      </View>
    </>
  );
}

function BookingPanel({ facility }: { facility: Facility }) {
  const createBooking = useBookingStore((s) => s.createBooking);
  const completeSession = useBookingStore((s) => s.completeSession);
  const [sport, setSport] = useState(facility.primary_sports[0] ?? "other");
  const [slotIndex, setSlotIndex] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const booking = useBookingStore((s) => s.bookings.find((b) => b.id === bookingId));

  if (booking) {
    return (
      <Card accent className="gap-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name="checkmark-circle" size={20} color={Colors.olive} />
          <Text className="text-base font-bold text-ink">Slot confirmed</Text>
        </View>
        <Text className="text-sm leading-5 text-ink-muted">
          {booking.activity_name}, today {booking.start_time}–{booking.end_time} ({booking.court_or_slot}). Thirty
          minutes after your session we'll ask how high your endorphins are.
        </Text>
        {booking.status === "confirmed" ? (
          <Button
            label="Preview the 30-min check-in"
            icon="time-outline"
            variant="secondary"
            size="sm"
            accessibilityHint="Demo: marks the session finished and shows the check-in banner now"
            onPress={() => completeSession(booking.id)}
          />
        ) : null}
      </Card>
    );
  }

  const reserve = () => {
    const slot = SLOTS[slotIndex];
    const created = createBooking({
      facility_id: facility.id,
      facility_name: facility.name,
      activity_name: sportLabel(sport),
      activity_type: sportToActivityType(sport),
      sport_category: sport,
      court_or_slot: slot.label,
      date: toIsoDate(new Date()),
      start_time: slot.start,
      end_time: slot.end,
    });
    haptics.success();
    setBookingId(created.id);
  };

  return (
    <Card className="gap-4">
      {facility.primary_sports.length > 1 ? (
        <View className="gap-2">
          <Eyebrow>Sport</Eyebrow>
          <View className="flex-row flex-wrap gap-2">
            {facility.primary_sports.map((option) => (
              <Chip key={option} label={sportLabel(option)} selected={sport === option} onPress={() => setSport(option)} />
            ))}
          </View>
        </View>
      ) : null}

      <View accessibilityRole="radiogroup" accessibilityLabel="Time slot" className="gap-2">
        <Eyebrow>Today</Eyebrow>
        {SLOTS.map((slot, i) => {
          const selected = i === slotIndex;
          return (
            <Pressable
              key={`${slot.start}-${slot.label}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${slot.start} to ${slot.end}, ${slot.label}`}
              onPress={() => {
                haptics.selection();
                setSlotIndex(i);
              }}
              className={`min-h-12 flex-row items-center justify-between rounded-xl border px-4 py-3 ${
                selected ? "border-olive bg-olive" : "border-line bg-paper"
              }`}
            >
              <Text className={`text-base font-bold ${selected ? "text-chalk" : "text-ink"}`}>
                {slot.start} – {slot.end}
              </Text>
              <Text className={`text-sm ${selected ? "text-chalk" : "text-ink-muted"}`}>{slot.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Button label="Reserve slot" icon="calendar-outline" onPress={reserve} />
    </Card>
  );
}
