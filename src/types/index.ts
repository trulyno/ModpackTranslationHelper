// Core type definitions for the Translation Helper

export interface LangFile {
  id: string;
  path: string; // e.g., "kubejs/assets/namespace/lang/en_us.json"
  namespace: string;
  language: string; // e.g., "en_us"
  content: Record<string, string>;
  isReference?: boolean; // If this is the reference file (en_us)
}

export interface Workspace {
  id: string;
  name: string;
  files: LangFile[];
  referenceFile?: LangFile; // The en_us.json or base translation file
  currentLanguage: string; // e.g., "es_es", "fr_fr" - the language being translated to
  annotations: Annotation[]; // Annotations stored with workspace
  pinnedKeys: string[]; // Keys pinned to top in GUI mode
  createdAt: Date;
  modifiedAt: Date;
}

export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeNode[];
  fileId?: string; // Reference to LangFile.id if type is 'file'
}

export interface Annotation {
  id: string;
  fileId: string;
  key: string; // The translation key this annotation is for
  text: string;
  color?: string;
  createdAt: string; // Store as ISO string for serialization
  modifiedAt: string; // Store as ISO string for serialization
}

export interface Theme {
  id: string;
  name: string;
  font?: {
    family: string;
    monoFamily: string;
  };
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    // Minecraft color previews
    minecraftBlack: string;
    minecraftDarkBlue: string;
    minecraftDarkGreen: string;
    minecraftDarkAqua: string;
    minecraftDarkRed: string;
    minecraftDarkPurple: string;
    minecraftGold: string;
    minecraftGray: string;
    minecraftDarkGray: string;
    minecraftBlue: string;
    minecraftGreen: string;
    minecraftAqua: string;
    minecraftRed: string;
    minecraftLightPurple: string;
    minecraftYellow: string;
    minecraftWhite: string;
  };
  isCustom?: boolean;
}

export interface EditorMode {
  type: 'raw' | 'gui';
}

export interface TranslationEntry {
  key: string;
  reference: string; // From reference file (en_us)
  translation: string; // Current translation
  hasAnnotation?: boolean;
  isMissing?: boolean; // Key exists in reference but not in translation
  isPinned?: boolean; // Pinned to top in GUI mode
}

export interface HistoryEntry {
  workspace: Workspace;
  timestamp: number;
}

export interface HistoryState {
  past: HistoryEntry[];
  present: Workspace | null;
  future: HistoryEntry[];
}

export interface SearchResult {
  fileId: string;
  fileName: string;
  key: string;
  value: string;
  context: string; // Surrounding text for context
}

export interface ImportOptions {
  type: 'file' | 'zip' | 'github' | 'empty';
  source?: string; // File path or GitHub URL
  branch?: string; // GitHub branch (optional)
  referenceLanguage?: string; // Default: en_us
}

export interface ExportOptions {
  type: 'single' | 'zip-kubejs' | 'resourcepack';
  files?: string[]; // File IDs to export (for single/selective export)
  packName?: string; // For resource pack
  packDescription?: string;
  packFormat?: number; // Minecraft pack format version
}

export interface AppState {
  workspace: Workspace | null;
  currentFile: LangFile | null;
  editorMode: EditorMode;
  theme: Theme;
  annotations: Annotation[];
  searchQuery: string;
  searchResults: SearchResult[];
  fileTree: FileTreeNode[];
}

export interface MinecraftFormat {
  type: 'color' | 'style';
  code: string;
  display: string;
}

export const MINECRAFT_COLORS: Record<string, string> = {
  '§0': 'black',
  '§1': 'dark_blue',
  '§2': 'dark_green',
  '§3': 'dark_aqua',
  '§4': 'dark_red',
  '§5': 'dark_purple',
  '§6': 'gold',
  '§7': 'gray',
  '§8': 'dark_gray',
  '§9': 'blue',
  '§a': 'green',
  '§b': 'aqua',
  '§c': 'red',
  '§d': 'light_purple',
  '§e': 'yellow',
  '§f': 'white',
};

export const MINECRAFT_STYLES: Record<string, string> = {
  '§k': 'obfuscated',
  '§l': 'bold',
  '§m': 'strikethrough',
  '§n': 'underline',
  '§o': 'italic',
  '§r': 'reset',
};
