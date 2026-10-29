import { View } from "react-native";
import { useRouter } from "expo-router";
import { MAX_RADIUS_KM } from "@/constants";
import { goBackOr } from "@/lib/navigation";
import { useAuthStore, type NotificationPreferences } from "@/store/auth.store";
import { Card, ListRow, PageHeader, Screen, SectionHeader, Toggle } from "@/components/ui";

type Row = { key: keyof NotificationPreferences; title: string; subtitle: string };

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "Check-ins & alerts",
    rows: [
      {
        key: "activityAlerts",
        title: "30-min post-session check-in",
        subtitle: "A prompt to rate your endorphin high half an hour after a session ends.",
      },
      {
        key: "pushNotifications",
        title: "Push notifications",
        subtitle: `New court slots and top-rated venues opening up within ${MAX_RADIUS_KM} km.`,
      },
    ],
  },
  {
    title: "Email",
    rows: [
      {
        key: "emailUpdates",
        title: "Weekly wave digest",
        subtitle: "Your streaks, average endorphin index and momentum.",
      },
      {
        key: "marketingMessages",
        title: "Events and retreats",
        subtitle: "Occasional invitations to tournaments and athletic retreats.",
      },
    ],
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useAuthStore((s) => s.notifications);
  const setNotification = useAuthStore((s) => s.setNotification);

  return (
    <Screen width="narrow">
      <PageHeader
        title="Notifications"
        subtitle="Changes save automatically."
        onBack={() => goBackOr(router, "/(tabs)/profile")}
      />

      {GROUPS.map((group) => (
        <View key={group.title} className="mb-6">
          <SectionHeader title={group.title} />
          <Card flush>
            {group.rows.map((row, i) => (
              <ListRow
                key={row.key}
                title={row.title}
                subtitle={row.subtitle}
                last={i === group.rows.length - 1}
                trailing={
                  <Toggle
                    accessibilityLabel={row.title}
                    value={notifications[row.key]}
                    onChange={(value) => setNotification(row.key, value)}
                  />
                }
              />
            ))}
          </Card>
        </View>
      ))}
    </Screen>
  );
}
