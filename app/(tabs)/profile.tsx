import { useMemo, type ComponentProps } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors, MACRO_REALMS, SPORT_BY_ID } from "@/constants";
import { formatSessionDay } from "@/utils";
import { haptics } from "@/lib/haptics";
import { showAlert } from "@/lib/alert";
import { useEnergyLogs, useEnergyWave } from "@/hooks/useEnergy";
import { useAuthStore } from "@/store/auth.store";
import { useBookingStore } from "@/store/booking.store";
import { useOnboardingStore } from "@/store/onboarding.store";
import { EnergyWaveChart } from "@/components/EnergyWaveChart";
import { SportBreakdown } from "@/components/SportBreakdown";
import { Button, Card, Eyebrow, ListRow, Screen, SectionHeader } from "@/components/ui";
import type { Booking, MacroRealm, User } from "@/types";

type IconName = ComponentProps<typeof Ionicons>["name"];

const SETTINGS: { title: string; subtitle: string; href: Href; icon: IconName }[] = [
  { title: "Edit profile", subtitle: "Name, username, bio and photo", href: "/profile/edit", icon: "person-outline" },
  {
    title: "Notifications",
    subtitle: "Post-session check-ins, push and email",
    href: "/profile/notifications",
    icon: "notifications-outline",
  },
  {
    title: "Privacy & data",
    subtitle: "Visibility, data export and erasure",
    href: "/profile/privacy",
    icon: "shield-checkmark-outline",
  },
];

function displayName(user: User) {
  return user.display_name || [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username;
}

function realmMix(bookings: Booking[]) {
  const counts: Record<MacroRealm, number> = { water: 0, land: 0, mountain: 0 };
  for (const b of bookings) {
    if (b.sport_category && b.sport_category !== "other") counts[SPORT_BY_ID[b.sport_category].realm] += 1;
  }
  const total = counts.water + counts.land + counts.mountain;
  return total ? MACRO_REALMS.map((realm) => ({ ...realm, share: counts[realm.id] / total })) : [];
}

export default function PassportScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const resetFTUE = useOnboardingStore((s) => s.resetFTUE);
  const bookings = useBookingStore((s) => s.bookings);
  const wave = useEnergyWave(30);
  const logs = useEnergyLogs();

  const pending = bookings.filter((b) => b.status === "completed");
  const history = bookings.filter((b) => b.status === "energy_logged").slice(0, 5);
  const mix = useMemo(() => realmMix(bookings), [bookings]);
  const peak = logs.data?.length ? Math.max(...logs.data.map((l) => l.energy_score)) : null;

  if (!user) return null;

  const openLogger = (bookingId?: string) =>
    router.push(bookingId ? { pathname: "/energy/modal", params: { bookingId } } : "/energy/modal");

  const handleSignOut = () =>
    showAlert("Sign out?", "You can sign back in at any time.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/(auth)/sign-in");
        },
      },
    ]);

  return (
    <Screen inTabs>
      <Eyebrow tone="olive">Vitality passport</Eyebrow>

      <View className="mt-3 flex-row items-center gap-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit profile photo"
          onPress={() => {
            haptics.tap();
            router.push("/profile/edit");
          }}
        >
          <Avatar user={user} />
        </Pressable>
        <View className="min-w-0 flex-1">
          <Text accessibilityRole="header" numberOfLines={2} className="text-2xl font-extrabold text-ink">
            {displayName(user)}
          </Text>
          {user.nickname ? <Text className="text-sm font-semibold text-ink-muted">“{user.nickname}”</Text> : null}
        </View>
      </View>
      {user.bio ? <Text className="mt-3 text-base leading-6 text-ink-muted">{user.bio}</Text> : null}

      <View className="-mx-1.5 mt-4 flex-row flex-wrap">
        <StatTile label="Current streak" value={`${user.streak_current}d`} />
        <StatTile label="Longest streak" value={`${user.streak_longest}d`} />
        <StatTile label="Sessions logged" value={logs.data ? String(logs.data.length) : "—"} />
        <StatTile label="Peak endorphin" value={peak !== null ? String(peak) : "—"} />
      </View>

      <View className="mt-8">
        <SectionHeader
          title="Energy"
          action={<Button label="Log a session" icon="add" variant="link" onPress={() => openLogger()} />}
        />
        <EnergyWaveChart
          data={wave.data}
          isLoading={wave.isPending}
          isError={wave.isError}
          onRetry={() => wave.refetch()}
          onLogFirst={() => openLogger()}
        />
      </View>

      {pending.length ? (
        <View className="mt-8">
          <SectionHeader title="Awaiting your rating" />
          <View className="gap-2">
            {pending.map((booking) => (
              <Pressable
                key={booking.id}
                accessibilityRole="button"
                accessibilityLabel={`Rate ${booking.activity_name} at ${booking.facility_name}`}
                onPress={() => {
                  haptics.tap();
                  openLogger(booking.id);
                }}
                className="flex-row items-center gap-3 rounded-2xl border border-terracotta/40 bg-terracotta/5 p-4 active:opacity-80"
              >
                <View className="min-w-0 flex-1">
                  <Text numberOfLines={1} className="text-base font-bold text-ink">
                    {booking.facility_name}
                  </Text>
                  <Text className="text-sm text-ink-muted">
                    {booking.activity_name} · {booking.start_time}–{booking.end_time}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-terracotta">Rate</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.terracotta} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {history.length ? (
        <View className="mt-8">
          <SectionHeader title="Recent sessions" />
          <Card flush>
            {history.map((booking, i) => (
              <ListRow
                key={booking.id}
                title={booking.facility_name}
                subtitle={`${booking.activity_name} · ${formatSessionDay(booking.date)}`}
                last={i === history.length - 1}
                trailing={
                  <View className="rounded-md bg-olive px-2 py-1">
                    <Text className="text-sm font-bold text-chalk">{booking.logged_energy_score}</Text>
                  </View>
                }
              />
            ))}
          </Card>
        </View>
      ) : null}

      {mix.length ? (
        <View className="mt-8">
          <SectionHeader title="Realm mix" />
          <Card>
            <View className="h-2.5 flex-row overflow-hidden rounded-full bg-line">
              {mix.map((realm) =>
                realm.share ? (
                  <View key={realm.id} style={{ flex: realm.share, backgroundColor: realm.accent }} />
                ) : null,
              )}
            </View>
            <View className="mt-3 flex-row flex-wrap gap-x-5 gap-y-2">
              {mix.map((realm) => (
                <View key={realm.id} className="flex-row items-center gap-1.5">
                  <View className="h-2 w-2 rounded-full" style={{ backgroundColor: realm.accent }} />
                  <Text className="text-sm text-ink">
                    {realm.label} {Math.round(realm.share * 100)}%
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      ) : null}

      <View className="mt-8">
        <SectionHeader title="Sports" />
        <SportBreakdown bookings={bookings} />
      </View>

      <View className="mt-8">
        <SectionHeader title="Settings" />
        <Card flush>
          {SETTINGS.map((item, i) => (
            <ListRow
              key={item.title}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              last={i === SETTINGS.length - 1}
              onPress={() => router.push(item.href)}
            />
          ))}
        </Card>
      </View>

      <View className="mt-6 gap-3">
        <Button label="Sign out" icon="log-out-outline" variant="danger" onPress={handleSignOut} />
        {__DEV__ ? (
          <Button label="Replay onboarding (dev)" variant="link" onPress={resetFTUE} />
        ) : null}
      </View>
    </Screen>
  );
}

function Avatar({ user }: { user: User }) {
  if (user.avatar_url) {
    return <Image source={{ uri: user.avatar_url }} className="h-20 w-20 rounded-full border-2 border-olive bg-line" />;
  }
  const initials = [user.first_name?.[0], user.last_name?.[0]].filter(Boolean).join("") || user.username[0];
  return (
    <View className="h-20 w-20 items-center justify-center rounded-full bg-olive">
      <Text className="text-2xl font-bold uppercase text-chalk">{initials}</Text>
    </View>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-1/2 p-1.5 sm:w-1/4">
      <View accessible accessibilityLabel={`${label}: ${value}`} className="rounded-2xl border border-line bg-sand p-4">
        <Text className="text-2xl font-extrabold text-ink">{value}</Text>
        <Text numberOfLines={1} className="mt-1 text-sm text-ink-muted">
          {label}
        </Text>
      </View>
    </View>
  );
}
