import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { themeColors, hexToRgba } from '../../constants/theme'; // Adjusted path

interface MonthlyActivityChartProps {
  data: Array<{ month: string; movies: number; hours: number; }>;
  dataType: 'movies' | 'hours';
  chartTitle: string;
  barColorHex?: string;
  containerWidth: number;
}

const MonthlyActivityChart: React.FC<MonthlyActivityChartProps> = (props) => {
  if (!props.data || props.data.length === 0) {
    return (
      <View style={styles.container} className="p-4 bg-gray-800 rounded-lg items-center my-2">
        <Text className="text-gray-400 text-center">No monthly activity data available.</Text>
      </View>
    );
  }

  const formatMonthLabel = (monthString: string): string => {
    // Adding '-02T00:00:00Z' to ensure consistent parsing as UTC
    const date = new Date(monthString + '-02T00:00:00Z');
    const yearOption = props.data.length > 12 ? '2-digit' : undefined;
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      year: yearOption,
      timeZone: 'UTC' // Specify timezone for consistent output
    });
  };

  const labels = props.data.map(item => formatMonthLabel(item.month));
  const datasetValues = props.data.map(item => 
    props.dataType === 'movies' ? item.movies : item.hours
  );

  const chartKitData = {
    labels: labels,
    datasets: [{
      data: datasetValues,
      // color: (opacity = 1) => hexToRgba(props.barColorHex || themeColors.accent, opacity) // Handled by chartConfig.color
    }]
  };

  const chartConfig = {
    backgroundColor: themeColors.secondary,
    backgroundGradientFrom: themeColors.secondary,
    backgroundGradientTo: themeColors.primary,
    decimalPlaces: props.dataType === 'hours' ? 1 : 0,
    color: (opacity = 1) => hexToRgba(props.barColorHex || themeColors.accent, opacity),
    labelColor: (opacity = 1) => hexToRgba(themeColors.textLight, opacity),
    style: {
      borderRadius: 16,
    },
    propsForDots: { // Hide dots for BarChart
      r: "0",
      strokeWidth: "0",
      stroke: 'transparent' 
    },
    propsForBackgroundLines: {
      stroke: hexToRgba(themeColors.textMuted, 0.2), // Made even more subtle
      strokeDasharray: "", // solid lines
    },
    barPercentage: 0.6,
    // barRadius: 4, // Optional: for rounded bar tops, might need to check compatibility or implement custom path
  };

  return (
    <View style={styles.container} className="my-3">
      <Text className="text-gray-300 text-lg font-semibold mb-3 ml-2">{props.chartTitle}</Text>
      <BarChart
        data={chartKitData}
        width={props.containerWidth}
        height={230}
        yAxisLabel={props.dataType === 'movies' ? "" : ""}
        yAxisSuffix={props.dataType === 'hours' ? "h" : ""}
        chartConfig={chartConfig}
        fromZero={true}
        showValuesOnTopOfBars={true}
        withHorizontalLabels={true}
        withInnerLines={true}
        verticalLabelRotation={props.data.length > 7 ? 30 : (props.data.length > 4 ? 15 : 0)}
        style={styles.chartStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginVertical: 8, // Using Tailwind className="my-3" instead
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  // Add other styles if needed, or use NativeWind classNames
});

export default MonthlyActivityChart; 