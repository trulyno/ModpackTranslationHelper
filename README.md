# Modpack Translation Helper

A comprehensive web-based tool for translating Minecraft language files with support for KubeJS, resource packs, and more. Built with React, TypeScript, and Vite.

## ✨ Features

### 📥 Multiple Import Options
- **Single Lang Files**: Import individual `.json` language files
- **ZIP Archives**: Import resource packs or KubeJS projects automatically
- **GitHub Integration**: Fetch KubeJS lang files directly from repositories
- **Empty Workspace**: Start from scratch with a blank workspace

### 📤 Flexible Export Options
- **Single File Export**: Export individual translation files
- **KubeJS ZIP**: Export with proper `kubejs/assets/*/lang/*` structure
- **Resource Pack**: Generate complete Minecraft resource pack with `pack.mcmeta`

### ✏️ Powerful Editor Modes
- **Raw Editor**: Direct JSON editing with syntax highlighting
- **GUI Editor**: Intuitive table view with:
  - Key column with namespace display
  - Reference translation (base language)
  - Editable translation field
  - Real-time Minecraft formatting preview
  - Missing translation indicators

### 🎨 Minecraft Text Formatting
- Full support for Minecraft color codes (`§0-f`)
- Style codes (bold, italic, underline, strikethrough, obfuscated)
- Live preview with actual Minecraft colors
- Formatting toolbar for easy code insertion
- Visual color picker

### 🔍 Smart Features
- **Context Search**: Find similar translations across all files
- **Word Search**: Locate phrases for consistent translation
- **Annotations**: Add notes and comments to translations
- **Missing Detection**: Automatically highlights missing keys
- **Auto-save**: Workspace saved to localStorage every 30 seconds

### 🎨 Theme System
- 4 built-in themes (Default Dark, Light, Minecraft, Dracula)
- Create custom themes with full color customization
- Import/export themes as JSON
- Live theme switching
- Persistent theme preferences

### 📁 File Management
- Hierarchical folder tree view
- Multiple namespace support
- Multiple language support
- Reference file selection (typically `en_us.json`)
- File count and workspace info

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd TranslationHelper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will open at `http://localhost:3000`

4. **Build for production**
   ```bash
   npm run build
   ```
   
   Built files will be in the `dist` folder

## 📖 Usage Guide

### Getting Started
1. Click **Import** in the header
2. Choose your import method:
   - Upload a `.json` lang file
   - Upload a ZIP archive
   - Enter a GitHub repository URL
   - Create an empty workspace

### Editing Translations
1. Select a file from the workspace tree on the right
2. Choose editor mode:
   - **GUI Mode**: Table view with formatting preview (recommended)
   - **Raw Mode**: Direct JSON editing
3. Edit translations in the middle column
4. See live Minecraft formatting preview below each field

### Using Formatting
- Click on a translation field to show the formatting toolbar
- Use toolbar buttons to insert color and style codes
- Preview shows exactly how text appears in Minecraft
- Common codes:
  - `§l` = **Bold**
  - `§o` = *Italic*
  - `§n` = <u>Underline</u>
  - `§c` = Red color
  - `§r` = Reset formatting

### Finding Context
1. Click on any translation row
2. The context panel shows similar translations
3. Use this to maintain consistency across files

### Adding Notes
1. Click the note icon on any translation
2. Add your annotation text
3. Notes are saved with the workspace

### Exporting Work
1. Click **Export** in the header
2. Choose export format:
   - **Single File**: Current file only
   - **KubeJS ZIP**: Full workspace with folder structure
   - **Resource Pack**: Minecraft-ready pack with metadata

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save current file |
| `Ctrl/Cmd + E` | Toggle editor mode (GUI/Raw) |
| `Ctrl/Cmd + F` | Focus search bar |
| `Escape` | Clear search / Close dialogs |

## 🎨 Minecraft Formatting Codes

### Colors
| Code | Color | Code | Color |
|------|-------|------|-------|
| `§0` | Black | `§8` | Dark Gray |
| `§1` | Dark Blue | `§9` | Blue |
| `§2` | Dark Green | `§a` | Green |
| `§3` | Dark Aqua | `§b` | Aqua |
| `§4` | Dark Red | `§c` | Red |
| `§5` | Dark Purple | `§d` | Light Purple |
| `§6` | Gold | `§e` | Yellow |
| `§7` | Gray | `§f` | White |

### Styles
- `§l` - **Bold**
- `§o` - *Italic*
- `§n` - Underline
- `§m` - Strikethrough
- `§k` - Obfuscated (random characters)
- `§r` - Reset all formatting

## 🏗️ Project Structure

```
TranslationHelper/
├── src/
│   ├── components/       # React components
│   │   ├── FileTree.tsx
│   │   ├── GUIEditor.tsx
│   │   ├── RawEditor.tsx
│   │   ├── MinecraftTextPreview.tsx
│   │   ├── FormattingToolbar.tsx
│   │   ├── ThemeManager.tsx
│   │   ├── HelpDialog.tsx
│   │   └── ImportExportDialogs.tsx
│   ├── store/            # Zustand state management
│   │   └── appStore.ts
│   ├── utils/            # Utility functions
│   │   ├── fileOperations.ts
│   │   ├── minecraftFormat.ts
│   │   ├── themes.ts
│   │   ├── fileTree.ts
│   │   └── search.ts
│   ├── hooks/            # Custom React hooks
│   │   └── useKeyboardShortcuts.ts
│   ├── types/            # TypeScript definitions
│   │   └── index.ts
│   ├── styles/           # CSS styles
│   │   └── index.css
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
└── package.json
```

## 🛠️ Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Immer** - Immutable state updates
- **JSZip** - ZIP file handling
- **FileSaver.js** - File downloads
- **Lucide React** - Icon library

## 💡 Tips & Best Practices

1. **Set Reference File**: Always select `en_us.json` as your reference for easier translation
2. **Use GUI Mode**: Table view is more efficient for translation work
3. **Save Often**: Although auto-save is enabled, manually save with `Ctrl/Cmd + S`
4. **Search for Context**: Use the context search to maintain consistency
5. **Test Formatting**: Preview shows real Minecraft formatting
6. **Organize with Annotations**: Leave notes for complex translations
7. **Custom Themes**: Create themes matching your workflow

## 🐛 Known Issues & Limitations

- GitHub import requires public repositories (API rate limits apply)
- Large workspaces (100+ files) may impact performance
- Browser localStorage has size limits (~5-10MB)
- Obfuscated text animation is simulated, not pixel-perfect

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📝 License

MIT License - feel free to use this project for any purpose.

## 🙏 Acknowledgments

- Minecraft and its formatting codes are owned by Mojang Studios
- KubeJS is a Minecraft mod by LatvianModder
- Icons by Lucide

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check the Help dialog in the app (click the ? icon)
