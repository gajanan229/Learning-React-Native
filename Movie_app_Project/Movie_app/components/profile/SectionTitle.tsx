import React from 'react';
import { Text, View } from 'react-native';

interface SectionTitleProps {
    title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
    return (
        <Text className="text-white text-xl font-bold mt-6 mb-3 px-1">
            {title}
        </Text>
    );
};

export default SectionTitle; 