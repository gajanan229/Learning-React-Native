import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarInputProps {
    starIndex: number;
    rating: number;
    onRate: (newRating: number) => void;
    size?: number;
    color?: string;
}

const StarInput: React.FC<StarInputProps> = ({
    starIndex,
    rating,
    onRate,
    size = 30, // Default size
    color = '#FFD700', // Default color (gold)
}) => {
    const isFull = rating >= starIndex + 1;
    const isHalf = rating >= starIndex + 0.5 && rating < starIndex + 1;
    // const isEmpty = rating < starIndex + 0.5; // Not explicitly needed if using else for icon

    let iconName: keyof typeof Ionicons.glyphMap;
    if (isFull) {
        iconName = 'star';
    } else if (isHalf) {
        iconName = 'star-half';
    } else {
        iconName = 'star-outline';
    }

    const handlePressLeftHalf = () => {
        onRate(starIndex + 0.5);
    };

    const handlePressRightHalf = () => {
        onRate(starIndex + 1);
    };

    return (
        <View style={[styles.starContainer, { width: size, height: size }]}>
            <Ionicons name={iconName} size={size} color={color} style={styles.iconStyle} />
            <TouchableOpacity
                style={[styles.touchableHalf, styles.leftHalf, { width: size / 2, height: size }]}
                onPress={handlePressLeftHalf}
                hitSlop={{ top: 5, bottom: 5, left: 5, right: 0 }} // Makes it easier to tap
            />
            <TouchableOpacity
                style={[styles.touchableHalf, styles.rightHalf, { width: size / 2, height: size }]}
                onPress={handlePressRightHalf}
                hitSlop={{ top: 5, bottom: 5, left: 0, right: 5 }} // Makes it easier to tap
            />
        </View>
    );
};

const styles = StyleSheet.create({
    starContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconStyle: {
        // The icon is centered by the container
    },
    touchableHalf: {
        position: 'absolute',
        top: 0,
        // backgroundColor: 'rgba(0, 255, 0, 0.1)', // Uncomment for debugging touch areas
    },
    leftHalf: {
        left: 0,
    },
    rightHalf: {
        right: 0,
    },
});

export default StarInput; 