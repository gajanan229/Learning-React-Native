import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import MonthlyActivityChart from './MonthlyActivityChart';
import { themeColors, hexToRgba } from '../../constants/theme';

interface SwipeableChartContainerProps {
  monthlyActivityData: Array<{ month: string; movies: number; hours: number; }> | null | undefined;
  defaultActiveIndex?: 0 | 1;
}

const chartPadding = 32; // Total horizontal padding on the profile page (16px on each side)
const chartWidth = Dimensions.get('window').width - chartPadding;

// Defined outside component to prevent re-creation on renders
const staticChartConfigs = [
  { type: 'movies' as 'movies' | 'hours', title: 'Movies Watched Per Month', barColorHex: themeColors.accent }, 
  { type: 'hours' as 'movies' | 'hours', title: 'Hours Watched Per Month', barColorHex: themeColors.light[200] },
];

const SwipeableChartContainer: React.FC<SwipeableChartContainerProps> = (props) => {
  const { monthlyActivityData, defaultActiveIndex = 0 } = props;
  const [activeIndex, setActiveIndex] = useState<number>(defaultActiveIndex);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    // Add a small tolerance to prevent floating point inaccuracies leading to wrong index
    const currentIndex = Math.round(offsetX / chartWidth + 0.01); 
    if (currentIndex !== activeIndex && currentIndex >= 0 && currentIndex < staticChartConfigs.length) {
      setActiveIndex(currentIndex);
    }
  };

  if (monthlyActivityData === null || monthlyActivityData === undefined) {
    // This placeholder is for when the entire monthlyActivityData prop is missing (e.g., API error in parent)
    return (
        <View style={[styles.placeholderContainer, {width: chartWidth, height: styles.scrollView.height || 280}]}>
            {/* Optional: <Text style={{color: themeColors.textMuted}}>Chart data is unavailable.</Text> */}
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView} 
      >
        {staticChartConfigs.map((config, index) => (
          <View key={index} style={[styles.chartItemContainer, { width: chartWidth }]}>
            <MonthlyActivityChart
              data={monthlyActivityData || []} // MonthlyActivityChart handles empty array by showing its own placeholder
              dataType={config.type}
              chartTitle={config.title}
              containerWidth={chartWidth}
              barColorHex={config.barColorHex}
            />
          </View>
        ))}
      </ScrollView>
      <View style={styles.paginationDotsContainer}>
        {staticChartConfigs.map((_, index) => (
          <View
            key={`dot-${index}`}
            style={[
              styles.dot,
              activeIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollView: {
    width: chartWidth,
    alignSelf: 'center',
    height: 280, 
  },
  chartItemContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  paginationDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: themeColors.accent,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  inactiveDot: {
    backgroundColor: hexToRgba(themeColors.textMuted, 0.5),
  },
  placeholderContainer: {
    alignSelf: 'center',
    backgroundColor: hexToRgba(themeColors.dark[200] || '#0F0D23', 0.5), // Added fallback for theme color
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SwipeableChartContainer; 