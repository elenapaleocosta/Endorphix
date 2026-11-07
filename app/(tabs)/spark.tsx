import { type ReactNode } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Colors, MAX_RADIUS_KM, REALM_BY_ID, SPARK_MIN_RATING } from "@/constants";
import { formatDistance } from "@/utils";
import { haptics } from "@/lib/haptics";
import { useSparkFacilities } from "@/hooks/useFacilities";
import { useLocationStore } from "@/store/location.store";
import { useBucketStore, type BucketItem } from "@/store/bucket.store";
import { SwipeDeck } from "@/components/SwipeDeck";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  PageHeader,
  Screen,
  SectionHeader,
  Skeleton,
} from "@/components/ui";

/**
 * The Spark: top-rated venues nearby as a deck. Swipe right to save one to the bucket list,
 * left to pass. Passes reset each launch; the bucket list is kept.
 */
export default function SparkScreen() {
  const userLocation = useLocationStore((s) => s.userLocation);
  const { data: venues = [], isPending, isError, refetch } = useSparkFacilities(userLocation);
  const items = useBucketStore((s) => s.items);
  const skipped = useBucketStore((s) => s.skipped);
  const save = useBucketStore((s) => s.save);
  const skip = useBucketStore((s) => s.skip);
  const reshuffle = useBucketStore((s) => s.reshuffle);

  const saved = new Set(items.map((item) => item.id));
  const queue = venues.filter((venue) => !saved.has(venue.id) && !skipped.includes(venue.id));

  let deck: ReactNode;
  if (isError) {
    deck = <ErrorState title="Couldn't reach the Spark engine" onRetry={() => refetch()} />;
  } else if (isPending && !venues.length) {
    deck = <Skeleton className="h-[440px] w-full rounded-3xl" />;
  } else if (!venues.length) {
    deck = (
      <EmptyState
        icon="flash-outline"
        title={`No ${SPARK_MIN_RATING}★ venues within ${MAX_RADIUS_KM} km`}
        message="Try Discover to browse every venue nearby."
      />
    );
  } else if (!queue.length) {
    deck = (
      <Card>
        <View className="items-center py-6">
          <Ionicons name="checkmark-done-outline" size={28} color={Colors.highlightInk} />
          <Text className="mt-3 text-center font-display-bold text-xl text-fg">You've seen everyone nearby</Text>
          <Text className="mt-1 text-center text-sm leading-5 text-fg-muted">
            {items.length
              ? `${items.length} saved to your bucket list. Pick one below and go.`
              : "Nothing caught your eye this round."}
          </Text>
          {skipped.length ? (
            <Button
              label={`Show the ${skipped.length} skipped again`}
              icon="refresh"
              variant="secondary"
              size="sm"
              onPress={reshuffle}
              className="mt-4"
            />
          ) : null}
        </View>
      </Card>
    );
  } else {
    deck = (
      <SwipeDeck
        venues={queue}
        onSwipe={(venue, direction) => (direction === "right" ? save(venue) : skip(venue.id))}
      />
    );
  }

  return (
    <Screen inTabs>
      <PageHeader
        eyebrow="Spontaneous action"
        eyebrowTone="highlight"
        title="The Spark"
        subtitle={`Top-rated venues within ${MAX_RADIUS_KM} km. Swipe right to save, left to pass.`}
      />

      {deck}

      <View className="mt-10">
        <SectionHeader title={items.length ? `Bucket list · ${items.length}` : "Bucket list"} />
        {items.length ? (
          <Card flush>
            {items.map((item, i) => (
              <BucketRow key={item.id} item={item} last={i === items.length - 1} />
            ))}
          </Card>
        ) : (
          <View className="rounded-2xl border border-dashed border-line px-5 py-6">
            <Text className="text-center text-sm leading-5 text-fg-muted">
              Swipe right on a venue to keep it here for when you're ready to move.
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

function BucketRow({ item, last }: { item: BucketItem; last: boolean }) {
  const router = useRouter();
  const remove = useBucketStore((s) => s.remove);
  const realm = REALM_BY_ID[item.macro_realm ?? "land"];
  const distance = formatDistance(item.distance_meters);
  const image = item.images[0];

  return (
    <View className={`flex-row items-center gap-3 px-4 py-3 ${last ? "" : "border-b border-line"}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, open venue`}
        onPress={() => {
          haptics.tap();
          router.push(`/facility/${item.id}`);
        }}
        className="min-w-0 flex-1 flex-row items-center gap-3 active:opacity-80"
      >
        {image ? (
          <Image source={{ uri: image }} resizeMode="cover" className="h-12 w-12 shrink-0 rounded-xl bg-line" />
        ) : (
          <View className="h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-raised">
            <Ionicons name="image-outline" size={18} color={Colors.fgMuted} />
          </View>
        )}
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="text-base font-bold text-fg">
            {item.name}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: realm.accent }} />
            <Text numberOfLines={1} className="flex-1 text-sm text-fg-muted">
              {[realm.label, distance, `★ ${item.rating.toFixed(1)}`].filter(Boolean).join(" · ")}
            </Text>
          </View>
        </View>
      </Pressable>
      <IconButton
        icon="close"
        accessibilityLabel={`Remove ${item.name} from bucket list`}
        onPress={() => remove(item.id)}
      />
    </View>
  );
}
