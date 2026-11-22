import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

export function useThemeColors() {
  return useTheme().colors;
}

export function useThemeStyles(createStyles) {
  const palette = useThemeColors();
  return useMemo(() => createStyles(palette), [createStyles, palette]);
}
