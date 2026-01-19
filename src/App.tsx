import { useState, useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { FileTree } from './components/FileTree';
import { RawEditor } from './components/RawEditor';
import { GUIEditor } from './components/GUIEditor';
import { ThemeManager } from './components/ThemeManager';
import { HelpDialog } from './components/HelpDialog';
import { ImportDialog, ExportDialog } from './components/ImportExportDialogs';
import { LanguageSelector } from './components/LanguageSelector';
import { ProgressWidget } from './components/ProgressWidget';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import {
  FileUp,
  Download,
  Palette,
  Code,
  Table,
  Search,
  FileText,
  HelpCircle,
  Undo,
  Redo,
} from 'lucide-react';

function App() {
  // Enable keyboard shortcuts
  useKeyboardShortcuts();
  const workspace = useAppStore((state) => state.workspace);
  const currentFile = useAppStore((state) => state.currentFile);
  const fileTree = useAppStore((state) => state.fileTree);
  const editorMode = useAppStore((state) => state.editorMode);
  const setEditorMode = useAppStore((state) => state.setEditorMode);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const performSearch = useAppStore((state) => state.performSearch);
  const searchResults = useAppStore((state) => state.searchResults);
  const clearSearch = useAppStore((state) => state.clearSearch);
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);
  const canUndo = useAppStore((state) => state.canUndo);
  const canRedo = useAppStore((state) => state.canRedo);

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showThemeManager, setShowThemeManager] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  // Auto-save functionality
  useEffect(() => {
    if (!workspace) return;

    // Save immediately when workspace changes
    localStorage.setItem('workspace', JSON.stringify(workspace));

    const interval = setInterval(() => {
      // Also save periodically as backup
      localStorage.setItem('workspace', JSON.stringify(workspace));
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [workspace]);

  // Load workspace and theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('workspace');
    if (saved) {
      try {
        const workspace = JSON.parse(saved);
        useAppStore.getState().loadWorkspace(workspace);
      } catch (error) {
        console.error('Failed to load saved workspace:', error);
      }
    }

    // Restore theme
    const savedThemeId = localStorage.getItem('currentThemeId');
    if (savedThemeId) {
      useAppStore.getState().loadTheme(savedThemeId);
    }
  }, []);

  const handleSearch = () => {
    if (localSearchQuery.trim()) {
      performSearch(localSearchQuery);
      setShowSearch(true);
    }
  };

  const handleSearchResultClick = (fileId: string) => {
    const file = workspace?.files.find((f) => f.id === fileId);
    if (file) {
      useAppStore.getState().setCurrentFile(file);
      setShowSearch(false);
      // TODO: Scroll to key in editor
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">
            <FileText size={24} />
            Minecraft Translation Helper
          </h1>
        </div>

        <div className="header-center">
          <div className="search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search in workspace..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {searchQuery && (
              <button
                className="btn-icon"
                onClick={() => {
                  setLocalSearchQuery('');
                  clearSearch();
                  setShowSearch(false);
                }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="header-right">
          {workspace && <LanguageSelector />}
          <button
            className="btn btn-icon"
            onClick={() => undo()}
            title="Undo (Ctrl+Z)"
            disabled={!canUndo()}
          >
            <Undo size={20} />
          </button>
          <button
            className="btn btn-icon"
            onClick={() => redo()}
            title="Redo (Ctrl+Shift+Z)"
            disabled={!canRedo()}
          >
            <Redo size={20} />
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setShowImportDialog(true)}
            title="Import"
          >
            <FileUp size={20} />
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setShowExportDialog(true)}
            title="Export"
            disabled={!workspace}
          >
            <Download size={20} />
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setShowThemeManager(true)}
            title="Themes"
          >
            <Palette size={20} />
          </button>
          <button
            className="btn btn-icon"
            onClick={() => setShowHelpDialog(true)}
            title="Help"
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="app-content">
        {/* Sidebar (Left) */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>Workspace</h3>
            {workspace && (
              <span className="file-count">{workspace.files.length} files</span>
            )}
          </div>
          {workspace && currentFile && <ProgressWidget />}
          <div className="sidebar-content">
            {workspace ? (
              <FileTree nodes={fileTree} />
            ) : (
              <div className="sidebar-empty">
                <p>No files in workspace</p>
              </div>
            )}
          </div>
        </div>

        {/* Editor Panel (Right) */}
        <div className="editor-panel">
          {workspace ? (
            <>
              <div className="editor-toolbar">
                <div className="toolbar-left">
                  <button
                    className={`btn btn-toolbar ${
                      editorMode.type === 'gui' ? 'active' : ''
                    }`}
                    onClick={() => setEditorMode('gui')}
                  >
                    <Table size={16} />
                    GUI
                  </button>
                  <button
                    className={`btn btn-toolbar ${
                      editorMode.type === 'raw' ? 'active' : ''
                    }`}
                    onClick={() => setEditorMode('raw')}
                  >
                    <Code size={16} />
                    Raw
                  </button>
                </div>

                {currentFile && (
                  <div className="toolbar-right">
                    <span className="file-info">
                      {currentFile.namespace} / {currentFile.language}
                    </span>
                  </div>
                )}
              </div>

              <div className="editor-container">
                {editorMode.type === 'gui' ? <GUIEditor /> : <RawEditor />}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <FileText size={64} />
              <h2>No Workspace Open</h2>
              <p>Import a workspace to get started</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowImportDialog(true)}
              >
                <FileUp size={16} />
                Import Workspace
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Results Panel */}
      {showSearch && searchResults.length > 0 && (
        <div className="search-results-panel">
          <div className="search-results-header">
            <h3>
              Search Results ({searchResults.length})
            </h3>
            <button className="btn-icon" onClick={() => setShowSearch(false)}>
              ×
            </button>
          </div>
          <div className="search-results-content">
            {searchResults.map((result, i) => (
              <div
                key={i}
                className="search-result"
                onClick={() => handleSearchResultClick(result.fileId)}
              >
                <div className="result-file">{result.fileName}</div>
                <div className="result-key">{result.key}</div>
                <div className="result-context">{result.context}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {showImportDialog && <ImportDialog onClose={() => setShowImportDialog(false)} />}
      {showExportDialog && <ExportDialog onClose={() => setShowExportDialog(false)} />}
      {showThemeManager && <ThemeManager onClose={() => setShowThemeManager(false)} />}
      {showHelpDialog && <HelpDialog onClose={() => setShowHelpDialog(false)} />}

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          {workspace && <span>Workspace: {workspace.name}</span>}
        </div>
        <div className="status-right">
          {currentFile && <span>Editing: {currentFile.path}</span>}
        </div>
      </div>
    </div>
  );
}

export default App;
