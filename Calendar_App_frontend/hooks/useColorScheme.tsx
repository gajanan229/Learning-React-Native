import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark';

type ColorSchemeContextType = {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextType>({
  colorScheme: 'dark',
  toggleColorScheme: () => {},
});

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme() as ColorScheme;
  const [colorScheme, setColorScheme] = useState<ColorScheme>('dark'); // Always start with dark theme for this app
  
  // Uncomment if you want to use the device's color scheme
  // useEffect(() => {
  //   setColorScheme(deviceColorScheme || 'dark');
  // }, [deviceColorScheme]);
  
  const toggleColorScheme = () => {
    setColorScheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <ColorSchemeContext.Provider value={{ colorScheme, toggleColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme() {
  return useContext(ColorSchemeContext);
}