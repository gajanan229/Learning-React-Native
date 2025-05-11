import React from 'react';
import { View, Text } from 'react-native';

interface GenreStatItemProps {
    genreName: string;
    count?: number;         // For top genres: number of movies
    hours?: number;         // For top genres: hours watched
    averageRating?: number; // For average rating per genre
    // barPercentage?: number; // Optional: for a visual bar (0-100)
}

const GenreStatItem: React.FC<GenreStatItemProps> = ({
    genreName,
    count,
    hours,
    averageRating,
    // barPercentage 
}) => {
    return (
        <View className="flex-row justify-between items-center bg-gray-800 p-3 rounded-md mb-2 mx-1 min-h-[50px]">
            <Text className="text-white font-semibold text-base flex-1 mr-2" numberOfLines={1} ellipsizeMode="tail">
                {genreName}
            </Text>
            <View className="flex-row items-center">
                {count !== undefined && hours !== undefined && (
                    <Text className="text-gray-300 text-sm text-right">
                        {count} {count === 1 ? 'movie' : 'movies'} / {hours.toFixed(1)} hrs
                    </Text>
                )}
                {averageRating !== undefined && (
                    <View className="flex-row items-baseline">
                        <Text className="text-yellow-400 font-bold text-base">{averageRating.toFixed(1)}</Text>
                        <Text className="text-gray-400 text-xs">/5 avg</Text>
                    </View>
                )}
            </View>
            {/* Optional Visual Bar - can be added later if barPercentage is provided */}
            {/* {barPercentage !== undefined && (
                <View className="h-2 bg-gray-700 rounded-full w-16 ml-2">
                   <View style={{ width: `${barPercentage}%` }} className="h-full bg-accent rounded-full" />
                </View>
            )} */}
        </View>
    );
};

export default GenreStatItem; 