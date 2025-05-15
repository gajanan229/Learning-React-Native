// Theme constants for ChronoFold app

// Colors with enhanced depth and sophistication
export const colors = {
  // Main backgrounds with subtle gradient potential
  background: {
    primary: '#121212', // Main screen background
    secondary: '#1A1A1A', // Slightly elevated surfaces
    tertiary: '#242424', // Cards and elevated content
    gradient: {
      start: '#141414',
      end: '#0A0A0A',
    },
  },
  // Interactive elements with better contrast
  interactive: {
    primary: '#2A2A2A', // Input fields, selected items
    secondary: '#333333', // Dividers, subtle elements
    hover: '#3A3A3A', // Hover states
    active: '#404040', // Active/pressed states
  },
  // Text colors with improved hierarchy
  text: {
    primary: '#FFFFFF',
    secondary: '#A0A0A0',
    tertiary: '#666666',
  },
  // Accent colors with additional states
  accent: {
    primary: '#007AFF',
    primaryHover: '#0064D1',
    primaryActive: '#004C9E',
    muted: '#0056B3',
    edit: '#FFA500',
    destructive: '#FF3B30',
    success: '#34C759',
  },
  // New overlay colors for modals and sheets
  overlay: {
    background: 'rgba(0, 0, 0, 0.5)',
    card: 'rgba(30, 30, 30, 0.95)',
  },
};

// Enhanced typography with better hierarchy
export const typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// Refined spacing scale
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

// Enhanced border radiuses
export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

// Sophisticated shadow system
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Subtle inner shadow for pressed states
  inner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
};

// Z-index values with clear hierarchy
export const zIndex = {
  base: 0,
  card: 10,
  header: 20,
  modal: 30,
  overlay: 40,
  toast: 50,
  max: 999,
};

// Animation durations and curves
export const animations = {
  durations: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  curves: {
    easeInOut: 'easeInOut',
    spring: {
      damping: 10,
      stiffness: 100,
      mass: 1,
    },
  },
};

// Layout constants
export const layout = {
  maxWidth: 1200,
  headerHeight: 60,
  tabBarHeight: 49,
  cardSpacing: 16,
};