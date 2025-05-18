const tintColorLight = '#2f95dc';
const tintColorDark = '#3B82F6';

export const EVENT_COLORS = [
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

export default {
  light: {
    text: '#000',
    background: '#f7f7f7',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    accent: '#3B82F6',
    accentLight: '#93C5FD',
    accentDark: '#1D4ED8',
    accentTransparent: 'rgba(59, 130, 246, 0.1)',
    subtleText: '#6B7280',
    border: '#E5E7EB',
  },
  dark: {
    text: '#FFFFFF',
    background: '#121214',
    secondaryBackground: '#1E1E24',
    tint: tintColorDark,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    accent: '#3B82F6',
    accentLight: '#93C5FD',
    accentDark: '#1D4ED8',
    accentTransparent: 'rgba(59, 130, 246, 0.15)',
    subtleText: '#9CA3AF',
    border: '#333333',
  },
};