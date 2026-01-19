import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  AppState,
  LangFile,
  Workspace,
  Annotation,
  Theme,
  TranslationEntry,
  ImportOptions,
  ExportOptions,
  HistoryEntry,
} from '../types';
import { defaultTheme } from '../utils/themes';
import { buildFileTree } from '../utils/fileTree';
import { searchInWorkspace } from '../utils/search';
import {
  importFromFile,
  // importFromZip,
  importFromGithub,
  exportSingleFile,
  exportAsZip,
  exportAsResourcePack,
} from '../utils/fileOperations';

interface AppStore extends AppState {
  // Workspace actions
  createWorkspace: (name: string) => void;
  loadWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (updates: Partial<Workspace>) => void;
  setCurrentLanguage: (language: string) => void;
  togglePinKey: (key: string) => void;
  
  // File actions
  setCurrentFile: (file: LangFile | null) => void;
  updateFileContent: (fileId: string, content: Record<string, string>) => void;
  addFile: (file: LangFile) => void;
  removeFile: (fileId: string) => void;
  setReferenceFile: (fileId: string) => void;
  
  // Editor actions
  setEditorMode: (mode: 'raw' | 'gui') => void;
  updateTranslation: (key: string, value: string) => void;
  saveTranslationToHistory: () => void;
  
  // Theme actions
  setTheme: (theme: Theme) => void;
  loadTheme: (themeId: string) => void;
  saveCustomTheme: (theme: Theme) => void;
  
  // Annotation actions
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'modifiedAt'>) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  deleteAnnotation: (id: string) => void;
  getAnnotationsForKey: (fileId: string, key: string) => Annotation[];
  
  // Search actions
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => void;
  clearSearch: () => void;
  
  // Import/Export actions
  importWorkspace: (options: ImportOptions) => Promise<void>;
  exportWorkspace: (options: ExportOptions) => Promise<void>;
  
  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Utility actions
  refreshFileTree: () => void;
  getTranslationEntries: () => TranslationEntry[];
}

export const useAppStore = create<AppStore>()(
  immer((set, get) => ({
    // Initial state
    workspace: null,
    currentFile: null,
    editorMode: { type: 'gui' },
    theme: defaultTheme,
    annotations: [],
    searchQuery: '',
    searchResults: [],
    fileTree: [],
    
    // History state (not part of AppState to avoid serialization issues)
    _history: {
      past: [] as HistoryEntry[],
      future: [] as HistoryEntry[],
      pendingSave: null as number | null,
      hasPendingSnapshot: false,
    },

    // Workspace actions
    createWorkspace: (name: string) => {
      set((state) => {
        state.workspace = {
          id: crypto.randomUUID(),
          name,
          files: [],
          currentLanguage: 'en_us',
          annotations: [],
          pinnedKeys: [],
          createdAt: new Date(),
          modifiedAt: new Date(),
        };
        state.fileTree = [];
        state.currentFile = null;
      });
    },

    loadWorkspace: (workspace: Workspace) => {
      set((state) => {
        state.workspace = workspace;
        state.fileTree = buildFileTree(workspace.files);
        state.currentFile = null;
      });
    },

    updateWorkspace: (updates: Partial<Workspace>) => {
      set((state) => {
        if (state.workspace) {
          // Save to history before update
          const current = get().workspace;
          if (current && (state as any)._history) {
            (state as any)._history.past.push({
              workspace: JSON.parse(JSON.stringify(current)),
              timestamp: Date.now(),
            });
            // Keep max 50 history entries
            if ((state as any)._history.past.length > 50) {
              (state as any)._history.past.shift();
            }
            // Clear future when making new changes
            (state as any)._history.future = [];
          }
          
          Object.assign(state.workspace, updates);
          state.workspace.modifiedAt = new Date();
        }
      });
    },

    setCurrentLanguage: (language: string) => {
      set((state) => {
        if (state.workspace) {
          state.workspace.currentLanguage = language;
          state.workspace.modifiedAt = new Date();
          
          // Find or create files for this language
          const existingFiles = state.workspace.files.filter((f) => f.language === language);
          
          if (existingFiles.length === 0) {
            // Create new lang files for each en_us file
            const enUsFiles = state.workspace.files.filter((f) => f.language === 'en_us');
            
            enUsFiles.forEach((enUsFile) => {
              // Create empty content with same keys as en_us
              const emptyContent: Record<string, string> = {};
              Object.keys(enUsFile.content).forEach((key) => {
                emptyContent[key] = '';
              });
              
              const newFile: LangFile = {
                id: crypto.randomUUID(),
                path: enUsFile.path.replace('en_us', language),
                namespace: enUsFile.namespace,
                language,
                content: emptyContent,
              };
              state.workspace!.files.push(newFile);
            });
            
            state.fileTree = buildFileTree(state.workspace.files);
            
            // Set first file of new language as current
            const firstNewFile = state.workspace.files.find((f) => f.language === language);
            if (firstNewFile) {
              state.currentFile = firstNewFile;
            }
          } else {
            // Switch to existing language file
            state.currentFile = existingFiles[0];
          }
        }
      });
    },

    togglePinKey: (key: string) => {
      set((state) => {
        if (state.workspace) {
          const index = state.workspace.pinnedKeys.indexOf(key);
          if (index === -1) {
            state.workspace.pinnedKeys.push(key);
          } else {
            state.workspace.pinnedKeys.splice(index, 1);
          }
          state.workspace.modifiedAt = new Date();
        }
      });
    },

    // File actions
    setCurrentFile: (file: LangFile | null) => {
      set((state) => {
        state.currentFile = file;
        // Auto-set reference file to en_us sibling
        if (file && state.workspace) {
          // Find en_us file with same namespace (same folder structure)
          const enUsSibling = state.workspace.files.find(
            f => f.namespace === file.namespace && f.language === 'en_us'
          );
          if (enUsSibling) {
            state.workspace.referenceFile = enUsSibling;
          } else {
            // Fallback: if no en_us sibling found, try to find any en_us file
            const anyEnUsFile = state.workspace.files.find(f => f.language === 'en_us');
            if (anyEnUsFile) {
              state.workspace.referenceFile = anyEnUsFile;
            }
          }
        }
      });
    },

    updateFileContent: (fileId: string, content: Record<string, string>) => {
      set((state) => {
        if (state.workspace) {
          const file = state.workspace.files.find((f) => f.id === fileId);
          if (file) {
            file.content = content;
            state.workspace.modifiedAt = new Date();
          }
          if (state.currentFile?.id === fileId) {
            state.currentFile.content = content;
          }
        }
      });
    },

    addFile: (file: LangFile) => {
      set((state) => {
        if (state.workspace) {
          state.workspace.files.push(file);
          state.workspace.modifiedAt = new Date();
          state.fileTree = buildFileTree(state.workspace.files);
        }
      });
    },

    removeFile: (fileId: string) => {
      set((state) => {
        if (state.workspace) {
          state.workspace.files = state.workspace.files.filter((f) => f.id !== fileId);
          state.workspace.modifiedAt = new Date();
          state.fileTree = buildFileTree(state.workspace.files);
          if (state.currentFile?.id === fileId) {
            state.currentFile = null;
          }
        }
      });
    },

    setReferenceFile: (fileId: string) => {
      set((state) => {
        if (state.workspace) {
          const file = state.workspace.files.find((f) => f.id === fileId);
          if (file) {
            // Clear previous reference
            state.workspace.files.forEach((f) => {
              f.isReference = false;
            });
            file.isReference = true;
            state.workspace.referenceFile = file;
          }
        }
      });
    },

    // Editor actions
    setEditorMode: (mode: 'raw' | 'gui') => {
      set((state) => {
        state.editorMode = { type: mode };
      });
    },

    updateTranslation: (key: string, value: string) => {
      set((state) => {
        if (state.currentFile) {
          state.currentFile.content[key] = value;
          if (state.workspace) {
            const file = state.workspace.files.find((f) => f.id === state.currentFile?.id);
            if (file) {
              file.content[key] = value;
              state.workspace.modifiedAt = new Date();
            }
          }
        }
      });
    },
    
    saveTranslationToHistory: () => {
      const currentState = get();
      const history = (currentState as any)._history;
      
      if (history && currentState.workspace) {
        set((state) => {
          const hist = (state as any)._history;
          if (hist && state.workspace) {
            hist.past.push({
              workspace: JSON.parse(JSON.stringify(state.workspace)),
              timestamp: Date.now(),
            });
            // Keep max 50 history entries
            if (hist.past.length > 50) {
              hist.past.shift();
            }
            // Clear future when making new changes
            hist.future = [];
          }
        });
      }
    },

    // Theme actions
    setTheme: (theme: Theme) => {
      set((state) => {
        state.theme = theme;
        applyTheme(theme);
        // Persist theme ID to localStorage
        localStorage.setItem('currentThemeId', theme.id);
      });
    },

    loadTheme: (themeId: string) => {
      // Load theme from localStorage or defaults
      const savedThemes = localStorage.getItem('customThemes');
      if (savedThemes) {
        const themes: Theme[] = JSON.parse(savedThemes);
        const theme = themes.find((t) => t.id === themeId);
        if (theme) {
          get().setTheme(theme);
        }
      }
    },

    saveCustomTheme: (theme: Theme) => {
      const savedThemes = localStorage.getItem('customThemes');
      const themes: Theme[] = savedThemes ? JSON.parse(savedThemes) : [];
      const existingIndex = themes.findIndex((t) => t.id === theme.id);
      
      if (existingIndex >= 0) {
        themes[existingIndex] = theme;
      } else {
        themes.push(theme);
      }
      
      localStorage.setItem('customThemes', JSON.stringify(themes));
      get().setTheme(theme);
    },

    // Annotation actions
    addAnnotation: (annotation) => {
      set((state) => {
        if (state.workspace) {
          state.workspace.annotations.push({
            ...annotation,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
          });
          state.workspace.modifiedAt = new Date();
        }
      });
    },

    updateAnnotation: (id: string, updates: Partial<Annotation>) => {
      set((state) => {
        if (state.workspace) {
          const annotation = state.workspace.annotations.find((a) => a.id === id);
          if (annotation) {
            Object.assign(annotation, updates);
            annotation.modifiedAt = new Date().toISOString();
            state.workspace.modifiedAt = new Date();
          }
        }
      });
    },

    deleteAnnotation: (id: string) => {
      set((state) => {
        if (state.workspace) {
          state.workspace.annotations = state.workspace.annotations.filter((a) => a.id !== id);
          state.workspace.modifiedAt = new Date();
        }
      });
    },

    getAnnotationsForKey: (fileId: string, key: string) => {
      const workspace = get().workspace;
      return workspace?.annotations.filter((a) => a.fileId === fileId && a.key === key) || [];
    },

    // Search actions
    setSearchQuery: (query: string) => {
      set((state) => {
        state.searchQuery = query;
      });
    },

    performSearch: (query: string) => {
      set((state) => {
        state.searchQuery = query;
        const workspace = state.workspace;
        if (workspace && query.trim()) {
          state.searchResults = searchInWorkspace(workspace, query);
        } else {
          state.searchResults = [];
        }
      });
    },

    clearSearch: () => {
      set((state) => {
        state.searchQuery = '';
        state.searchResults = [];
      });
    },

    // Import/Export actions
    importWorkspace: async (options: ImportOptions) => {
      try {
        let workspace: Workspace | null = null;

        switch (options.type) {
          case 'file':
            if (options.source) {
              workspace = await importFromFile(options.source);
            }
            break;
          case 'zip':
            if (options.source) {
              console.log('Importing from zip is not yet implemented');
              // workspace = await importFromZip(options.source);
            }
            break;
          case 'github':
            if (options.source) {
              workspace = await importFromGithub(options.source, options.branch);
            }
            break;
          case 'empty':
            get().createWorkspace('New Workspace');
            return;
        }

        if (workspace) {
          get().loadWorkspace(workspace);
        }
      } catch (error) {
        console.error('Import failed:', error);
        throw error;
      }
    },

    exportWorkspace: async (options: ExportOptions) => {
      const workspace = get().workspace;
      if (!workspace) {
        throw new Error('No workspace to export');
      }

      try {
        switch (options.type) {
          case 'single':
            if (options.files && options.files.length > 0) {
              await exportSingleFile(workspace, options.files[0]);
            }
            break;
          case 'zip-kubejs':
            await exportAsZip(workspace, options.files);
            break;
          case 'resourcepack':
            await exportAsResourcePack(workspace, {
              packName: options.packName || 'Translation Pack',
              packDescription: options.packDescription || 'Generated by Translation Helper',
              packFormat: options.packFormat || 15,
            });
            break;
        }
      } catch (error) {
        console.error('Export failed:', error);
        throw error;
      }
    },

    // Utility actions
    refreshFileTree: () => {
      set((state) => {
        if (state.workspace) {
          state.fileTree = buildFileTree(state.workspace.files);
        }
      });
    },

    // History actions
    undo: () => {
      set((state) => {
        const history = (state as any)._history;
        if (history && history.past.length > 0) {
          const previous = history.past.pop();
          if (previous && state.workspace) {
            history.future.push({
              workspace: JSON.parse(JSON.stringify(state.workspace)),
              timestamp: Date.now(),
            });
            state.workspace = previous.workspace;
            if (state.workspace) {
              state.fileTree = buildFileTree(state.workspace.files);
              // Update current file reference
              if (state.currentFile) {
                const updatedFile = state.workspace.files.find(
                  (f) => f.id === state.currentFile!.id
                );
                state.currentFile = updatedFile || null;
              }
            }
          }
        }
      });
    },

    redo: () => {
      set((state) => {
        const history = (state as any)._history;
        if (history && history.future.length > 0) {
          const next = history.future.pop();
          if (next && state.workspace) {
            history.past.push({
              workspace: JSON.parse(JSON.stringify(state.workspace)),
              timestamp: Date.now(),
            });
            state.workspace = next.workspace;
            if (state.workspace) {
              state.fileTree = buildFileTree(state.workspace.files);
            
              // Update current file reference
              if (state.currentFile) {
                const updatedFile = state.workspace.files.find(
                  (f) => f.id === state.currentFile!.id
                );
                state.currentFile = updatedFile || null;
              }
            }
          }
        }
      });
    },

    canUndo: () => {
      const state = get();
      return ((state as any)._history?.past.length || 0) > 0;
    },

    canRedo: () => {
      const state = get();
      return ((state as any)._history?.future.length || 0) > 0;
    },

    getTranslationEntries: (): TranslationEntry[] => {
      const state = get();
      const currentFile = state.currentFile;
      const referenceFile = state.workspace?.referenceFile;

      if (!currentFile) return [];

      const entries: TranslationEntry[] = [];
      const allKeys = new Set([
        ...Object.keys(referenceFile?.content || {}),
        ...Object.keys(currentFile.content),
      ]);

      allKeys.forEach((key) => {
        const reference = referenceFile?.content[key] || '';
        const translation = currentFile.content[key] || '';
        const hasAnnotation = state.workspace?.annotations.some(
          (a) => a.fileId === currentFile.id && a.key === key
        );
        const isMissing = !translation && !!reference;
        const isPinned = state.workspace?.pinnedKeys.includes(key) || false;

        entries.push({
          key,
          reference,
          translation,
          hasAnnotation,
          isMissing,
          isPinned,
        });
      });

      // Sort: pinned first, then by key
      return entries.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return a.key.localeCompare(b.key);
      });
    },
  }))
);

// Helper function to apply theme to CSS variables
function applyTheme(theme: Theme) {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVarName, value);
  });
  
  // Apply font settings if provided
  if (theme.font) {
    if (theme.font.family) {
      root.style.setProperty('--font-family', theme.font.family);
    }
    if (theme.font.monoFamily) {
      root.style.setProperty('--font-mono', theme.font.monoFamily);
    }
  }
}
