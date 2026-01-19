import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export function useKeyboardShortcuts() {
  const workspace = useAppStore((state) => state.workspace);
  const currentFile = useAppStore((state) => state.currentFile);
  const editorMode = useAppStore((state) => state.editorMode);
  const setEditorMode = useAppStore((state) => state.setEditorMode);
  const updateFileContent = useAppStore((state) => state.updateFileContent);
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);
  const canUndo = useAppStore((state) => state.canUndo);
  const canRedo = useAppStore((state) => state.canRedo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + S: Save
      if (modifier && e.key === 's') {
        e.preventDefault();
        if (currentFile) {
          // Auto-save is handled in App.tsx, just show feedback
          const statusBar = document.querySelector('.status-bar .status-right');
          if (statusBar) {
            const originalText = statusBar.textContent;
            statusBar.textContent = 'Saved!';
            setTimeout(() => {
              statusBar.textContent = originalText;
            }, 1000);
          }
        }
      }

      // Ctrl/Cmd + E: Toggle editor mode
      if (modifier && e.key === 'e') {
        e.preventDefault();
        setEditorMode(editorMode.type === 'gui' ? 'raw' : 'gui');
      }

      // Ctrl/Cmd + F: Focus search
      if (modifier && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-bar input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // Ctrl/Cmd + Z: Undo
      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if ((modifier && e.key === 'z' && e.shiftKey) || (modifier && e.key === 'y')) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }

      // Formatting shortcuts (when textarea is focused)
      const activeElement = document.activeElement as HTMLElement;
      const isTextarea = activeElement && activeElement.tagName === 'TEXTAREA';
      
      if (isTextarea && modifier) {
        // Ctrl/Cmd + B: Bold
        if (e.key === 'b') {
          e.preventDefault();
          insertFormatCode('§l');
        }
        // Ctrl/Cmd + I: Italic
        if (e.key === 'i') {
          e.preventDefault();
          insertFormatCode('§o');
        }
        // Ctrl/Cmd + U: Underline
        if (e.key === 'u') {
          e.preventDefault();
          insertFormatCode('§n');
        }
        // Ctrl/Cmd + D: Strikethrough
        if (e.key === 'd') {
          e.preventDefault();
          insertFormatCode('§m');
        }
        // Ctrl/Cmd + R: Reset formatting
        if (e.key === 'r') {
          e.preventDefault();
          insertFormatCode('§r');
        }
      }

      // Escape: Clear search or close dialogs
      if (e.key === 'Escape') {
        const searchBar = document.querySelector('.search-bar input') as HTMLInputElement;
        if (searchBar && document.activeElement === searchBar) {
          searchBar.blur();
          useAppStore.getState().clearSearch();
        }
      }
    };

    // Helper to insert format code at cursor
    const insertFormatCode = (code: string) => {
      const textarea = document.activeElement as HTMLTextAreaElement;
      if (textarea && textarea.tagName === 'TEXTAREA') {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        
        if (start === end) {
          // No selection - insert at cursor
          textarea.value = value.substring(0, start) + code + value.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + code.length;
        } else {
          // Selection - wrap with code and reset at end
          textarea.value =
            value.substring(0, start) + code + value.substring(start, end) + '§r' + value.substring(end);
          textarea.selectionStart = start + code.length;
          textarea.selectionEnd = start + code.length + (end - start);
        }
        
        // Trigger change event
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
        textarea.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [workspace, currentFile, editorMode, setEditorMode, updateFileContent, undo, redo, canUndo, canRedo]);
}

// Utility to format keyboard shortcut for display
export function formatShortcut(keys: string[]): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return keys
    .map((key) => {
      if (key === 'mod') return isMac ? '⌘' : 'Ctrl';
      if (key === 'shift') return isMac ? '⇧' : 'Shift';
      if (key === 'alt') return isMac ? '⌥' : 'Alt';
      return key.toUpperCase();
    })
    .join(isMac ? '' : '+');
}
