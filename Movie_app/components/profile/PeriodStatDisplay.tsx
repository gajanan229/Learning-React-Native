import React from 'react';
import { View, Text } from 'react-native';

interface PeriodStatDisplayProps {
    periodName: string;
    movies: number;
    hours: number;
}

const PeriodStatDisplay: React.FC<PeriodStatDisplayProps> = ({ periodName, movies, hours }) => {
    return (
        <View className="flex-row justify-between items-center bg-gray-800 p-3 rounded-md mb-2 mx-1">
            <Text className="text-white font-semibold text-base w-2/5" numberOfLines={1} ellipsizeMode="tail">
                {periodName}
            </Text>
            <Text className="text-gray-300 text-sm w-3/5 text-right" numberOfLines={1} ellipsizeMode="tail">
                {movies} {movies === 1 ? 'movie' : 'movies'} / {hours.toFixed(1)} hrs
            </Text>
        </View>
    );
};

export default PeriodStatDisplay; 