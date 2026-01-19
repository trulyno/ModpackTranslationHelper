import { MINECRAFT_COLORS, MINECRAFT_STYLES } from '../types';

export interface MinecraftTextSegment {
  text: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
}

export function parseMinecraftText(text: string): MinecraftTextSegment[] {
  const segments: MinecraftTextSegment[] = [];
  let currentSegment: MinecraftTextSegment = { text: '' };
  let i = 0;

  while (i < text.length) {
    if (text[i] === '§' && i + 1 < text.length) {
      const code = text.substring(i, i + 2);
      
      // If we have accumulated text, push it
      if (currentSegment.text) {
        segments.push({ ...currentSegment });
        currentSegment = {
          text: '',
          color: currentSegment.color,
          bold: currentSegment.bold,
          italic: currentSegment.italic,
          underline: currentSegment.underline,
          strikethrough: currentSegment.strikethrough,
          obfuscated: currentSegment.obfuscated,
        };
      }

      // Handle color codes
      if (MINECRAFT_COLORS[code]) {
        currentSegment.color = MINECRAFT_COLORS[code];
      }
      // Handle style codes
      else if (MINECRAFT_STYLES[code]) {
        const style = MINECRAFT_STYLES[code];
        switch (style) {
          case 'bold':
            currentSegment.bold = true;
            break;
          case 'italic':
            currentSegment.italic = true;
            break;
          case 'underline':
            currentSegment.underline = true;
            break;
          case 'strikethrough':
            currentSegment.strikethrough = true;
            break;
          case 'obfuscated':
            currentSegment.obfuscated = true;
            break;
          case 'reset':
            currentSegment = { text: '' };
            break;
        }
      }

      i += 2;
    } else {
      currentSegment.text += text[i];
      i++;
    }
  }

  // Push the last segment
  if (currentSegment.text) {
    segments.push(currentSegment);
  }

  return segments;
}

export function formatMinecraftText(text: string): string {
  // Convert & codes to § codes
  return text.replace(/&([0-9a-fk-or])/gi, '§$1');
}

export function stripFormatting(text: string): string {
  return text.replace(/[§&][0-9a-fk-or]/gi, '');
}

export function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    black: '#000000',
    dark_blue: '#0000AA',
    dark_green: '#00AA00',
    dark_aqua: '#00AAAA',
    dark_red: '#AA0000',
    dark_purple: '#AA00AA',
    gold: '#FFAA00',
    gray: '#AAAAAA',
    dark_gray: '#555555',
    blue: '#5555FF',
    green: '#55FF55',
    aqua: '#55FFFF',
    red: '#FF5555',
    light_purple: '#FF55FF',
    yellow: '#FFFF55',
    white: '#FFFFFF',
  };
  return colorMap[colorName] || '#FFFFFF';
}

// Utility to insert formatting codes
export function insertColorCode(text: string, position: number, code: string): string {
  return text.substring(0, position) + code + text.substring(position);
}

export function insertStyleCode(text: string, position: number, style: string): string {
  const styleMap: Record<string, string> = {
    bold: '§l',
    italic: '§o',
    underline: '§n',
    strikethrough: '§m',
    obfuscated: '§k',
    reset: '§r',
  };
  const code = styleMap[style] || '';
  return text.substring(0, position) + code + text.substring(position);
}

// Get all format codes in text with their positions
export function getFormatCodes(text: string): Array<{ position: number; code: string; type: 'color' | 'style' }> {
  const codes: Array<{ position: number; code: string; type: 'color' | 'style' }> = [];
  let i = 0;

  while (i < text.length - 1) {
    if (text[i] === '§') {
      const code = text.substring(i, i + 2);
      if (MINECRAFT_COLORS[code]) {
        codes.push({ position: i, code, type: 'color' });
      } else if (MINECRAFT_STYLES[code]) {
        codes.push({ position: i, code, type: 'style' });
      }
      i += 2;
    } else {
      i++;
    }
  }

  return codes;
}
