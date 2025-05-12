import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { themeColors, hexToRgba } from '../../constants/theme';

interface RatingDistributionChartProps {
  data: Array<{ rating: number; count: number; }> | null | undefined; // Allow null/undefined
  chartTitle: string;
  barColorHex?: string;
}

const RatingDistributionChart: React.FC<RatingDistributionChartProps> = (props) => {
  // Handle cases where data might not be available yet or is explicitly null
  // if (props.data === null || props.data === undefined) { // This check might be too restrictive if an empty array means "show all zeros"
  // Let's refine this: if props.data is explicitly null/undefined meaning API error or not loaded, show placeholder.
  // If props.data is an empty array, it means user has 0 ratings, and we should show the full scale with zeros.

  const allPossibleRatings = Array.from({ length: 10 }, (_, i) => {
    const rating = (i + 1) * 0.5;
    return Number.isInteger(rating) ? rating : rating; // Returns whole numbers as integers, keeps decimals for .5
  }); // [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
  const labels = allPossibleRatings.map(rating => rating.toFixed(1));

  // Create a map for quick lookup of actual counts from props.data
  const ratingCountsMap = new Map<number, number>();
  if (props.data && Array.isArray(props.data)) {
    props.data.forEach(item => {
      // Ensure ratings are aligned to the 0.5 steps, e.g. API might send 3.0, map it to 3
      // Or, assume backend sends ratings already aligned with 0.5, 1.0, etc.
      // For safety, one could round: const roundedRating = Math.round(item.rating * 2) / 2;
      ratingCountsMap.set(item.rating, item.count);
    });
  }

  const datasetValues = allPossibleRatings.map(rating => ratingCountsMap.get(rating) || 0);

  // If after processing, all datasetValues are 0 AND props.data was explicitly empty (not null/undefined from error),
  // it means the user genuinely has no ratings. We can still show the chart with all zeros.
  // The original prompt wants to show all ratings even with 0 count, so we don't need a special placeholder for empty props.data here.
  // A placeholder is only needed if statsData.ratingBasedStats.ratingDistribution itself is null/undefined at call site.

  const chartKitData = {
    labels: labels,
    datasets: [{
      data: datasetValues,
    }]
  };

  const chartConfig = {
    backgroundColor: themeColors.secondary,
    backgroundGradientFrom: themeColors.secondary,
    backgroundGradientTo: themeColors.primary,
    decimalPlaces: 0, // Counts are whole numbers
    color: (opacity = 1) => hexToRgba(props.barColorHex || themeColors.accent, opacity),
    labelColor: (opacity = 1) => hexToRgba(themeColors.textLight, opacity),
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "0",
      strokeWidth: "0",
      stroke: 'transparent' 
    },
    propsForBackgroundLines: {
      stroke: hexToRgba(themeColors.textMuted, 0.2),
      strokeDasharray: "",
    },
    barPercentage: 0.5, // Fixed for 10 bars
  };

  const screenWidth = Dimensions.get('window').width;

  // Conditional rendering for when there is absolutely no data to form even a zeroed chart
  // This is more about props.data being undefined/null than it being an empty array
  if (props.data === null || props.data === undefined) {
    return (
      <View style={styles.container} className="p-4 bg-gray-800 rounded-lg items-center my-2">
        <Text className="text-gray-400 text-center">Rating distribution data is not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} className="my-3">
      <Text className="text-gray-300 text-lg font-semibold mb-3 ml-2">{props.chartTitle}</Text>
      <BarChart
        data={chartKitData}
        width={screenWidth - 32} // 16px padding on each side
        height={250}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={chartConfig}
        fromZero={true}
        showValuesOnTopOfBars={true}
        withHorizontalLabels={true} // Show Y-axis labels
        withInnerLines={true} // Show horizontal grid lines
        verticalLabelRotation={30} // Fixed for 10 bars, labels like "0.5", "1.0" etc.
        style={styles.chartStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Using Tailwind className="my-3" instead
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default RatingDistributionChart; 