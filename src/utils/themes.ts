import type { Theme } from '../types';

export const defaultTheme: Theme = {
  id: 'default',
  name: 'Default Dark',
  colors: {
    primary: '#5865F2',
    secondary: '#4752C4',
    background: '#1e1e2e',
    surface: '#2a2a3e',
    text: '#cdd6f4',
    textSecondary: '#a6adc8',
    border: '#45475a',
    accent: '#89b4fa',
    success: '#a6e3a1',
    warning: '#f9e2af',
    error: '#f38ba8',
    // Minecraft colors
    minecraftBlack: '#000000',
    minecraftDarkBlue: '#0000AA',
    minecraftDarkGreen: '#00AA00',
    minecraftDarkAqua: '#00AAAA',
    minecraftDarkRed: '#AA0000',
    minecraftDarkPurple: '#AA00AA',
    minecraftGold: '#FFAA00',
    minecraftGray: '#AAAAAA',
    minecraftDarkGray: '#555555',
    minecraftBlue: '#5555FF',
    minecraftGreen: '#55FF55',
    minecraftAqua: '#55FFFF',
    minecraftRed: '#FF5555',
    minecraftLightPurple: '#FF55FF',
    minecraftYellow: '#FFFF55',
    minecraftWhite: '#FFFFFF',
  },
};

export const lightTheme: Theme = {
  id: 'light',
  name: 'Light Mode',
  colors: {
    primary: '#5865F2',
    secondary: '#4752C4',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#1e1e2e',
    textSecondary: '#585b70',
    border: '#ccd0da',
    accent: '#1e66f5',
    success: '#40a02b',
    warning: '#df8e1d',
    error: '#d20f39',
    minecraftBlack: '#000000',
    minecraftDarkBlue: '#0000AA',
    minecraftDarkGreen: '#00AA00',
    minecraftDarkAqua: '#00AAAA',
    minecraftDarkRed: '#AA0000',
    minecraftDarkPurple: '#AA00AA',
    minecraftGold: '#FFAA00',
    minecraftGray: '#AAAAAA',
    minecraftDarkGray: '#555555',
    minecraftBlue: '#5555FF',
    minecraftGreen: '#55FF55',
    minecraftAqua: '#55FFFF',
    minecraftRed: '#FF5555',
    minecraftLightPurple: '#FF55FF',
    minecraftYellow: '#FFFF55',
    minecraftWhite: '#FFFFFF',
  },
};

export const minecraftTheme: Theme = {
  id: 'minecraft',
  name: 'Minecraft',
  colors: {
    primary: '#8B8B8B',
    secondary: '#5A5A5A',
    background: '#313131',
    surface: '#3F3F3F',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    border: '#000000',
    accent: '#8B8B8B',
    success: '#55FF55',
    warning: '#FFFF55',
    error: '#FF5555',
    minecraftBlack: '#000000',
    minecraftDarkBlue: '#0000AA',
    minecraftDarkGreen: '#00AA00',
    minecraftDarkAqua: '#00AAAA',
    minecraftDarkRed: '#AA0000',
    minecraftDarkPurple: '#AA00AA',
    minecraftGold: '#FFAA00',
    minecraftGray: '#AAAAAA',
    minecraftDarkGray: '#555555',
    minecraftBlue: '#5555FF',
    minecraftGreen: '#55FF55',
    minecraftAqua: '#55FFFF',
    minecraftRed: '#FF5555',
    minecraftLightPurple: '#FF55FF',
    minecraftYellow: '#FFFF55',
    minecraftWhite: '#FFFFFF',
  },
};

export const dracula: Theme = {
  id: 'dracula',
  name: 'Dracula',
  colors: {
    primary: '#bd93f9',
    secondary: '#6272a4',
    background: '#282a36',
    surface: '#44475a',
    text: '#f8f8f2',
    textSecondary: '#6272a4',
    border: '#6272a4',
    accent: '#8be9fd',
    success: '#50fa7b',
    warning: '#f1fa8c',
    error: '#ff5555',
    minecraftBlack: '#000000',
    minecraftDarkBlue: '#0000AA',
    minecraftDarkGreen: '#00AA00',
    minecraftDarkAqua: '#00AAAA',
    minecraftDarkRed: '#AA0000',
    minecraftDarkPurple: '#AA00AA',
    minecraftGold: '#FFAA00',
    minecraftGray: '#AAAAAA',
    minecraftDarkGray: '#555555',
    minecraftBlue: '#5555FF',
    minecraftGreen: '#55FF55',
    minecraftAqua: '#55FFFF',
    minecraftRed: '#FF5555',
    minecraftLightPurple: '#FF55FF',
    minecraftYellow: '#FFFF55',
    minecraftWhite: '#FFFFFF',
  },
};

export const builtInThemes: Theme[] = [defaultTheme, lightTheme, minecraftTheme, dracula];

export function getThemeById(id: string): Theme | undefined {
  // Check built-in themes
  const builtIn = builtInThemes.find((t) => t.id === id);
  if (builtIn) return builtIn;

  // Check custom themes in localStorage
  const savedThemes = localStorage.getItem('customThemes');
  if (savedThemes) {
    const themes: Theme[] = JSON.parse(savedThemes);
    return themes.find((t) => t.id === id);
  }

  return undefined;
}

export function getAllThemes(): Theme[] {
  const savedThemes = localStorage.getItem('customThemes');
  const customThemes: Theme[] = savedThemes ? JSON.parse(savedThemes) : [];
  return [...builtInThemes, ...customThemes];
}

export function exportTheme(theme: Theme): string {
  return JSON.stringify(theme, null, 2);
}

export function importTheme(themeJson: string): Theme {
  const theme = JSON.parse(themeJson) as Theme;
  if (!theme.id || !theme.name || !theme.colors) {
    throw new Error('Invalid theme format');
  }
  return theme;
}

export function createCustomTheme(name: string, baseTheme?: Theme): Theme {
  const base = baseTheme || defaultTheme;
  return {
    ...base,
    id: crypto.randomUUID(),
    name,
    isCustom: true,
  };
}
