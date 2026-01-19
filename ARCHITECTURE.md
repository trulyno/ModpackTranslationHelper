# Component Architecture

## Component Hierarchy

```
App.tsx (Root)
├── Header
│   ├── ImportDialog
│   ├── ExportDialog
│   ├── ThemeManager
│   └── HelpDialog
├── EditorPanel
│   ├── EditorToolbar
│   └── EditorContainer
│       ├── GUIEditor
│       │   ├── TranslationRow[]
│       │   │   ├── MinecraftTextPreview
│       │   │   └── FormattingToolbar
│       │   └── ContextSidebar
│       └── RawEditor
│           └── MinecraftTextPreview
├── Sidebar
│   └── FileTree
│       └── TreeNode[]
├── SearchResultsPanel
└── StatusBar
```

## Component Details

### App.tsx
**Purpose**: Main application shell
**State**: Manages dialog visibility, search state
**Features**: 
- Auto-save workspace to localStorage
- Keyboard shortcuts integration
- Layout management

### FileTree.tsx
**Purpose**: Display workspace folder structure
**Props**: nodes (FileTreeNode[]), onFileSelect
**Features**:
- Recursive tree rendering
- Expand/collapse folders
- File selection
- Active file highlighting

### GUIEditor.tsx
**Purpose**: Table-based translation editor
**Features**:
- Translation table with key/reference/translation columns
- Inline editing with textarea
- Minecraft text preview
- Annotation support
- Context search sidebar
- Missing translation indicators
- Formatting toolbar per row

### RawEditor.tsx
**Purpose**: JSON text editor
**Features**:
- Side-by-side reference and translation
- Direct JSON editing
- Syntax validation
- Save functionality

### MinecraftTextPreview.tsx
**Purpose**: Render Minecraft formatted text
**Props**: text (string), className
**Features**:
- Parse § color codes
- Parse § style codes
- Obfuscated text animation
- Real-time color rendering

### FormattingToolbar.tsx
**Purpose**: Insert Minecraft formatting codes
**Props**: onInsert (callback)
**Features**:
- Style buttons (bold, italic, etc.)
- Color picker dropdown
- 16 Minecraft colors
- Code insertion at cursor

### ThemeManager.tsx
**Purpose**: Theme customization interface
**Features**:
- Display all themes
- Create custom themes
- Edit theme colors
- Import/export themes
- Live preview

### HelpDialog.tsx
**Purpose**: Help and documentation
**Features**:
- Keyboard shortcuts list
- Formatting codes reference
- Feature descriptions
- Usage tips

### ImportExportDialogs.tsx
**Purpose**: Import and export interfaces
**Components**: ImportDialog, ExportDialog
**Features**:
- Multiple import methods
- Multiple export formats
- GitHub integration
- File validation
- Progress indicators

## Store Structure (appStore.ts)

### State
```typescript
{
  workspace: Workspace | null,
  currentFile: LangFile | null,
  editorMode: EditorMode,
  theme: Theme,
  annotations: Annotation[],
  searchQuery: string,
  searchResults: SearchResult[],
  fileTree: FileTreeNode[]
}
```

### Actions
- Workspace: create, load, update
- Files: set, update, add, remove, setReference
- Editor: setMode, updateTranslation
- Theme: set, load, saveCustom
- Annotations: add, update, delete, get
- Search: set, perform, clear
- Import/Export: import, export
- Utility: refresh, getEntries

## Utility Modules

### fileOperations.ts
- `importFromFile()`: Parse JSON file
- `importFromZip()`: Extract and parse ZIP
- `importFromGithub()`: Fetch from GitHub API
- `exportSingleFile()`: Download single file
- `exportAsZip()`: Create ZIP archive
- `exportAsResourcePack()`: Generate resource pack

### minecraftFormat.ts
- `parseMinecraftText()`: Parse § codes
- `formatMinecraftText()`: Convert & to §
- `stripFormatting()`: Remove all codes
- `getColorHex()`: Get color value
- `insertColorCode()`: Insert at position
- `insertStyleCode()`: Insert style
- `getFormatCodes()`: Extract all codes

### themes.ts
- `defaultTheme`: Default dark theme
- `lightTheme`: Light mode theme
- `minecraftTheme`: Minecraft-styled theme
- `dracula`: Dracula theme
- `getThemeById()`: Load theme
- `getAllThemes()`: Get all themes
- `exportTheme()`: Serialize theme
- `importTheme()`: Parse theme JSON
- `createCustomTheme()`: Create new theme

### fileTree.ts
- `buildFileTree()`: Create tree structure
- `sortTree()`: Sort folders/files
- `findNodeByPath()`: Locate node
- `findNodeByFileId()`: Locate by ID
- `getAllFiles()`: Flatten tree

### search.ts
- `searchInWorkspace()`: Full-text search
- `findSimilarTranslations()`: Context search
- `findByKey()`: Key search

## Hooks

### useKeyboardShortcuts.ts
**Purpose**: Global keyboard shortcuts
**Shortcuts**:
- Ctrl/Cmd+S: Save
- Ctrl/Cmd+E: Toggle editor
- Ctrl/Cmd+F: Focus search
- Escape: Clear/close

**Utility**:
- `formatShortcut()`: Format for display

## Types (types/index.ts)

### Core Types
- `LangFile`: Translation file
- `Workspace`: Collection of files
- `FileTreeNode`: Tree structure
- `Annotation`: Translation note
- `Theme`: Color scheme
- `TranslationEntry`: Editor row

### UI Types
- `EditorMode`: gui | raw
- `SearchResult`: Search match
- `ImportOptions`: Import config
- `ExportOptions`: Export config

### Constants
- `MINECRAFT_COLORS`: Color code map
- `MINECRAFT_STYLES`: Style code map

## Data Flow

### Loading a File
1. User clicks file in tree
2. FileTree calls `setCurrentFile()`
3. Store updates `currentFile`
4. Editor re-renders with new file
5. Preview components update

### Saving Changes
1. User edits in GUI/Raw editor
2. Component calls `updateTranslation()` or `updateFileContent()`
3. Store updates via Immer
4. Auto-save triggers after 30s
5. localStorage updated

### Searching
1. User types in search bar
2. App calls `performSearch()`
3. Store scans all files
4. Results displayed in panel
5. Click result -> load file

### Theme Change
1. User selects theme
2. ThemeManager calls `setTheme()`
3. Store updates theme
4. CSS variables updated
5. UI re-renders with new colors

## Performance Considerations

### Optimizations Used
- Memoized search results
- Debounced auto-save
- Conditional rendering
- CSS transforms for animations
- Local state in components

### Potential Bottlenecks
- Large file tree rendering
- Search across many files
- Obfuscated text animation
- localStorage size limits

## Extension Points

### Adding New Features
1. **New Editor Mode**: Add to EditorMode type, create component
2. **New Import Source**: Add to ImportOptions, implement in fileOperations
3. **New Export Format**: Add to ExportOptions, implement export function
4. **New Theme**: Add to builtInThemes array
5. **New Shortcut**: Add to useKeyboardShortcuts hook

### Plugin System (Future)
Could add:
- Custom import/export handlers
- Custom formatting codes
- Custom preview renderers
- Custom search algorithms
- Custom themes

## Testing Strategy

### Unit Tests (Suggested)
- Utility functions
- State management
- Parsers/formatters
- Search algorithms

### Component Tests (Suggested)
- User interactions
- State updates
- Conditional rendering
- Error handling

### E2E Tests (Suggested)
- Import workflow
- Edit workflow
- Export workflow
- Search functionality

## Code Standards

### React Patterns
- Functional components only
- Hooks for state/effects
- Props interface for each component
- Controlled inputs

### TypeScript
- Strict mode enabled
- Explicit return types
- No `any` (warn only)
- Interfaces over types

### CSS
- BEM-inspired naming
- CSS variables for theming
- Mobile-first responsive
- Consistent spacing scale

### State Management
- Single store (Zustand)
- Immer for immutability
- Derived state where possible
- Minimal prop drilling

---

This architecture provides a solid foundation for the translation tool while remaining extensible for future enhancements.
