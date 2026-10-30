import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ENERGY_SCALE_MAX, ENERGY_SCALE_MIN } from "@/constants";
import { energyBand } from "@/utils";
import { haptics } from "@/lib/haptics";
import { errorMessage } from "@/lib/validation";
import { goBackOr } from "@/lib/navigation";
import { useLogEnergy } from "@/hooks/useEnergy";
import { useBookingStore } from "@/store/booking.store";
import { Button, Card, EmptyState, Eyebrow, IconButton, PageHeader, Screen, TextField } from "@/components/ui";

const SEGMENTS = Array.from({ length: 10 }, (_, i) => (i + 1) * 10);
const clampScore = (n: number) => Math.min(ENERGY_SCALE_MAX, Math.max(ENERGY_SCALE_MIN, n));

export default function EnergyModal() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const booking = useBookingStore((s) => (bookingId ? s.bookings.find((b) => b.id === bookingId) : undefined));
  const markEnergyLogged = useBookingStore((s) => s.markEnergyLogged);
  const { mutate: logEnergy, isPending } = useLogEnergy();

  const [score, setScore] = useState(75);
  const [notes, setNotes] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const band = energyBand(score);

  const close = () => goBackOr(router, "/(tabs)/profile");
  const adjust = (next: number) => {
    haptics.selection();
    setScore(clampScore(next));
  };

  const save = () => {
    setSaveError(null);
    logEnergy(
      {
        activity_type: booking?.activity_type ?? "other",
        activity_title: booking?.activity_name ?? "Spontaneous session",
        energy_score: score,
        facility_id: booking?.facility_id,
        facility_name: booking?.facility_name,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          if (booking) markEnergyLogged(booking.id, score);
          haptics.success();
          close();
        },
        onError: (err) => {
          haptics.error();
          setSaveError(errorMessage(err, "Couldn't save your entry. Please try again."));
        },
      },
    );
  };

  const header = (
    <PageHeader
      eyebrow="After-activity check-in"
      eyebrowTone="terracotta"
      title="The Endorphin Bar"
      accessory={<IconButton icon="close" accessibilityLabel="Close" onPress={close} />}
    />
  );

  if (bookingId && booking?.status === "energy_logged") {
    return (
      <Screen width="narrow" noTopInset={Platform.OS === "ios"}>
        {header}
        <EmptyState
          icon="checkmark-circle-outline"
          title="Already rated"
          message={`You logged ${booking.logged_energy_score}/100 for this session.`}
          actionLabel="Close"
          onAction={close}
        />
      </Screen>
    );
  }

  return (
    <Screen width="narrow" noTopInset={Platform.OS === "ios"}>
      {header}

      {booking ? (
        <Card tone="paper" className="mb-5">
          <Eyebrow tone="olive">Session finished</Eyebrow>
          <Text className="mt-1 text-base font-bold text-ink">{booking.facility_name}</Text>
          <Text className="text-sm text-ink-muted">
            {booking.activity_name} · {booking.start_time}–{booking.end_time} · {booking.court_or_slot}
          </Text>
        </Card>
      ) : null}

      <Text className="mb-5 text-base leading-6 text-ink-muted">
        Half an hour after moving, your heart rate settles and endorphins peak. How high do you feel, from 1 to 100?
      </Text>

      <Card className="gap-5">
        <View className="flex-row items-center justify-between gap-3">
          <IconButton icon="remove" accessibilityLabel="Decrease by 1" onPress={() => adjust(score - 1)} />
          <View
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel="Endorphin high"
            accessibilityValue={{ min: ENERGY_SCALE_MIN, max: ENERGY_SCALE_MAX, now: score, text: `${score}, ${band.label}` }}
            accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
            onAccessibilityAction={(e) => adjust(score + (e.nativeEvent.actionName === "increment" ? 5 : -5))}
            className="min-w-0 flex-1 items-center"
          >
            <Text className="text-6xl font-display text-ink">{score}</Text>
            <View className="mt-1 flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full" style={{ backgroundColor: band.color }} />
              <Text className="text-sm font-bold text-ink">{band.label}</Text>
            </View>
          </View>
          <IconButton icon="add" accessibilityLabel="Increase by 1" onPress={() => adjust(score + 1)} />
        </View>

        <View className="flex-row gap-1">
          {SEGMENTS.map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={`Set to ${value}`}
              onPress={() => adjust(value)}
              hitSlop={{ top: 8, bottom: 8 }}
              className="h-8 flex-1 rounded-md bg-line"
              style={value <= score ? { backgroundColor: band.color } : undefined}
            />
          ))}
        </View>

        <Text className="text-center text-sm text-ink-muted">{band.description}</Text>
      </Card>

      <View className="mt-5 gap-4">
        <TextField
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="How did your body feel?"
          multiline
        />
        {saveError ? (
          <Text accessibilityRole="alert" className="text-sm font-medium text-terracotta">
            {saveError}
          </Text>
        ) : null}
        <Button label="Save entry" onPress={save} loading={isPending} />
      </View>
    </Screen>
  );
}
