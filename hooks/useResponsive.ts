import { useWindowDimensions, type ViewStyle } from "react-native";
import { useMemo } from "react";

export type Breakpoint = "phone" | "tablet" | "desktop" | "wideDesktop";

export interface ResponsiveValues {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWideDesktop: boolean;
  isWide: boolean; // tablet or desktop (>= 640)
  isLandscape: boolean;
  columns: number; // 1 for phone, 2 for tablet, 3 for desktop
  gutter: number;
  contentMaxWidth: number;
  getGridItemStyle: (numCols?: number, gap?: number) => ViewStyle;
}

export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  return useMemo(() => {
    const isPhone = width < 640;
    const isTablet = width >= 640 && width < 1024;
    const isDesktop = width >= 1024 && width < 1440;
    const isWideDesktop = width >= 1440;
    const isWide = width >= 640;
    const isLandscape = width > height;

    let breakpoint: Breakpoint = "phone";
    if (isTablet) breakpoint = "tablet";
    else if (isDesktop) breakpoint = "desktop";
    else if (isWideDesktop) breakpoint = "wideDesktop";

    const columns = isPhone ? 1 : isTablet ? 2 : width >= 1280 ? 3 : 2;
    const gutter = isPhone ? 16 : isTablet ? 24 : 32;
    const contentMaxWidth = isPhone ? width : isTablet ? 768 : 1180;

    const getGridItemStyle = (numCols: number = columns, gap: number = 14): ViewStyle => {
      if (numCols <= 1) {
        return { width: "100%" };
      }
      // Calculate percentage taking gap into account
      const pct = 100 / numCols;
      // In flexWrap layouts: calc(pct% - gap * (cols - 1) / cols)
      const adjustedPct = `${((100 - (gap * (numCols - 1) * 100) / (width > 0 ? width : 1000)) / numCols).toFixed(2)}%` as any;
      return {
        width: isPhone ? "100%" : `${Math.floor((100 / numCols) - 1.5)}%`,
        minWidth: isPhone ? "100%" : 280,
      };
    };

    return {
      width,
      height,
      breakpoint,
      isPhone,
      isTablet,
      isDesktop,
      isWideDesktop,
      isWide,
      isLandscape,
      columns,
      gutter,
      contentMaxWidth,
      getGridItemStyle,
    };
  }, [width, height]);
}
