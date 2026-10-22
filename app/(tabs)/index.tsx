import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants";
import { useHaptics } from "@/hooks/useHaptics";
import { useLocation } from "@/hooks/useLocation";
import DiscoverScreen from "./discover";
import EnergyScreen from "./energy";
import ProfileScreen from "./profile";

const TABS = [
  { key: "discover", label: "DISCOVER", symbol: "◎" },
  { key: "energy", label: "ENERGY", symbol: "◈" },
  { key: "profile", label: "PROFILE", symbol: "◉" },
];

export default function TabsPager() {
  const { tap } = useHaptics();
  useLocation();

  const [dimensions, setDimensions] = useState(() => Dimensions.get("window"));
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isUserScrolling = useRef(false);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const screenWidth = dimensions.width;

  const handleTabPress = (index: number) => {
    tap();
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / screenWidth);
    if (newIndex >= 0 && newIndex < TABS.length && newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      tap();
    }
    isUserScrolling.current = false;
  };

  const renderItem = ({ item, index }: { item: typeof TABS[0]; index: number }) => {
    return (
      <View style={{ width: screenWidth, flex: 1, backgroundColor: Colors.obsidian }}>
        {index === 0 && <DiscoverScreen />}
        {index === 1 && <EnergyScreen />}
        {index === 2 && <ProfileScreen />}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.obsidian }}>
      {/* Horizontal Slider/Pager for Tabs in a Row */}
      <FlatList
        ref={flatListRef}
        data={TABS}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={() => {
          isUserScrolling.current = true;
        }}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        decelerationRate="fast"
      />

      {/* Synchronized Bottom Navigation Bar */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: Colors.void,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {TABS.map((tab, idx) => {
          const focused = activeIndex === idx;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabPress(idx)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  opacity: focused ? 1 : 0.4,
                }}
              >
                {tab.symbol}
              </Text>
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: "700",
                  letterSpacing: 1.5,
                  color: focused ? Colors.glow : Colors.tertiary,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
