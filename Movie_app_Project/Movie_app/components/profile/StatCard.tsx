import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    unit?: string; // Optional unit to display next to the value
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, unit }) => {
    return (
        <View className="bg-gray-800 p-4 rounded-lg items-center justify-center flex-1 mx-1 min-h-[100px]">
            {icon && <View className="mb-2">{icon}</View>}
            <Text className="text-white text-3xl font-bold">
                {value}
                {unit && <Text className="text-xl">{unit}</Text>}
            </Text>
            <Text className="text-gray-400 text-sm mt-1 text-center">{label}</Text>
        </View>
    );
};

export default StatCard; 