import { useState } from "react";
import { Platform, Share, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { haptics } from "@/lib/haptics";
import { showAlert } from "@/lib/alert";
import { goBackOr } from "@/lib/navigation";
import { queryClient } from "@/lib/query-client";
import { errorMessage } from "@/lib/validation";
import { clearLocalEnergyLogs, useEnergyLogs } from "@/hooks/useEnergy";
import { useAuthStore } from "@/store/auth.store";
import { useBookingStore } from "@/store/booking.store";
import { Button, Card, ListRow, PageHeader, Screen, SectionHeader, Toggle } from "@/components/ui";

function downloadOnWeb(filename: string, json: string) {
  const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function PrivacyScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const profileVisibility = useAuthStore((s) => s.profileVisibility);
  const setProfileVisibility = useAuthStore((s) => s.setProfileVisibility);
  const eraseAll = useAuthStore((s) => s.eraseAll);
  const bookings = useBookingStore((s) => s.bookings);
  const resetBookings = useBookingStore((s) => s.reset);
  const logs = useEnergyLogs();
  const [exportStatus, setExportStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const isPublic = profileVisibility === "public";

  const exportData = async () => {
    setExportStatus(null);
    const json = JSON.stringify(
      { exportedAt: new Date().toISOString(), profile: user, bookings, energyLogs: logs.data ?? [] },
      null,
      2,
    );
    try {
      if (Platform.OS === "web") {
        downloadOnWeb(`endorphix-export-${new Date().toISOString().slice(0, 10)}.json`, json);
        setExportStatus({ tone: "ok", text: "Your export has been downloaded." });
      } else {
        const result = await Share.share({ title: "endorphix data export", message: json });
        if (result.action === Share.sharedAction) setExportStatus({ tone: "ok", text: "Your export is ready." });
      }
      haptics.success();
    } catch (err) {
      haptics.error();
      setExportStatus({ tone: "error", text: errorMessage(err, "Export failed. Please try again.") });
    }
  };

  const confirmErase = () =>
    showAlert(
      "Erase all data?",
      "This removes your passport, bookings and energy logs from this device and signs you out. It can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Erase",
          style: "destructive",
          onPress: () => {
            eraseAll();
            resetBookings();
            clearLocalEnergyLogs();
            queryClient.clear();
            router.replace("/(auth)/sign-in");
          },
        },
      ],
    );

  return (
    <Screen width="narrow">
      <PageHeader title="Privacy & data" onBack={() => goBackOr(router, "/(tabs)/profile")} />

      <SectionHeader title="Visibility" />
      <Card flush className="mb-8">
        <ListRow
          last
          title="Public passport"
          subtitle={
            isPublic
              ? "Venues you book with can see your name and streaks."
              : "Your passport is private. Venues only see your booking."
          }
          trailing={
            <Toggle
              accessibilityLabel="Public passport"
              value={isPublic}
              onChange={(value) => setProfileVisibility(value ? "public" : "private")}
            />
          }
        />
      </Card>

      <SectionHeader title="Your data" />
      <Card className="mb-8 gap-3">
        <Text className="text-sm leading-5 text-ink-muted">
          Export your profile, bookings and energy logs as a JSON file. No lock-in.
        </Text>
        <Button
          label="Export my data"
          icon="download-outline"
          variant="secondary"
          loading={logs.isPending}
          onPress={exportData}
        />
        {exportStatus ? (
          <Text
            accessibilityLiveRegion="polite"
            className={`text-sm font-medium ${exportStatus.tone === "ok" ? "text-ink" : "text-terracotta"}`}
          >
            {exportStatus.text}
          </Text>
        ) : null}
      </Card>

      <SectionHeader title="Erase" />
      <View className="gap-3">
        <Text className="text-sm leading-5 text-ink-muted">
          Removes everything endorphix stores on this device and signs you out.
        </Text>
        <Button label="Erase all data" icon="trash-outline" variant="danger" onPress={confirmErase} />
      </View>
    </Screen>
  );
}
