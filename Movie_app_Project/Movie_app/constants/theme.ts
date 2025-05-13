export const themeColors = {
  primary: '#030014',
  secondary: '#151312',
  light: {
    100: '#D6C6FF', // textLight
    200: '#A8B5DB',
    300: '#9CA4AB', // textMuted
  },
  dark: {
    100: '#221F3D',
    200: '#0F0D23',
  },
  accent: '#AB8BFF',
  // Alias for easier use in charts
  textLight: '#D6C6FF',
  textMuted: '#9CA4AB',
};

/**
 * Converts a HEX color string to an RGBA string.
 * @param hex The hex color string (e.g., "#FF0000" or "#F00").
 * @param opacity The opacity value (0 to 1).
 * @returns The RGBA string (e.g., "rgba(255, 0, 0, 0.5)").
 */
export const hexToRgba = (hex: string, opacity: number = 1): string => {
  let r = 0, g = 0, b = 0;
  if (!hex) return `rgba(0,0,0,${opacity})`; // Default to black if hex is undefined/null

  // Remove # if present
  const hexValue = hex.startsWith('#') ? hex.slice(1) : hex;

  if (hexValue.length === 3) {
    r = parseInt(hexValue[0] + hexValue[0], 16);
    g = parseInt(hexValue[1] + hexValue[1], 16);
    b = parseInt(hexValue[2] + hexValue[2], 16);
  } else if (hexValue.length === 6) {
    r = parseInt(hexValue.substring(0, 2), 16);
    g = parseInt(hexValue.substring(2, 4), 16);
    b = parseInt(hexValue.substring(4, 6), 16);
  } else {
    // Fallback for invalid hex (or return an error/default color)
    console.warn(`Invalid hex color: ${hex}`);
    return `rgba(0,0,0,${opacity})`; // Default to black
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}; 