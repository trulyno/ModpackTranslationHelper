import React, { useState, useMemo, useRef } from 'react';
import { useAppStore } from '../store/appStore';
import { MinecraftTextPreview } from './MinecraftTextPreview';
import { FormattingToolbar } from './FormattingToolbar';
import { AnnotationsList } from './AnnotationsList';
import { useResizableColumns } from '../hooks/useResizableColumns';
import { MessageSquare, AlertCircle, Pin, PinOff, Copy } from 'lucide-react';
import { findSimilarTranslations } from '../utils/search';

export const GUIEditor: React.FC = () => {
  const currentFile = useAppStore((state) => state.currentFile);
  const workspace = useAppStore((state) => state.workspace);
  const referenceFile = useAppStore((state) => state.workspace?.referenceFile);
  const pinnedKeys = useAppStore((state) => state.workspace?.pinnedKeys);
  const updateTranslation = useAppStore((state) => state.updateTranslation);
  const getTranslationEntries = useAppStore((state) => state.getTranslationEntries);
  const addAnnotation = useAppStore((state) => state.addAnnotation);
  const getAnnotationsForKey = useAppStore((state) => state.getAnnotationsForKey);
  const togglePinKey = useAppStore((state) => state.togglePinKey);

  const [filter, setFilter] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showAnnotationDialog, setShowAnnotationDialog] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const [showContextSearch, setShowContextSearch] = useState(false);
  const [sortColumn, setSortColumn] = useState<'key' | 'reference' | 'translation' | 'status' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const tableRef = useRef<HTMLTableElement>(null);
  const { widths, handleMouseDown } = useResizableColumns(
    {
      pin: 40,
      key: 250,
      reference: 350,
      translation: 350,
      actions: 80,
    },
    // tableRef
  );

  const entries = useMemo(() => getTranslationEntries(), [getTranslationEntries, currentFile, referenceFile, pinnedKeys]);

  const handleSort = (column: 'key' | 'reference' | 'translation' | 'status') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredEntries = useMemo(() => {
    let result = [...entries];
    
    // Apply filter
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      result = result.filter(
        (e) =>
          e.key.toLowerCase().includes(lowerFilter) ||
          e.reference.toLowerCase().includes(lowerFilter) ||
          e.translation.toLowerCase().includes(lowerFilter)
      );
    }
    
    // Apply sorting (pinned items always stay at top)
    if (sortColumn) {
      const pinned = result.filter(e => e.isPinned);
      const unpinned = result.filter(e => !e.isPinned);
      
      const sortFn = (a: any, b: any) => {
        let comparison = 0;
        
        switch (sortColumn) {
          case 'key':
            comparison = a.key.localeCompare(b.key);
            break;
          case 'reference':
            comparison = a.reference.localeCompare(b.reference);
            break;
          case 'translation':
            comparison = a.translation.localeCompare(b.translation);
            break;
          case 'status':
            // Sort by missing status (missing first or last)
            comparison = (a.isMissing === b.isMissing) ? 0 : (a.isMissing ? -1 : 1);
            break;
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      };
      
      unpinned.sort(sortFn);
      result = [...pinned, ...unpinned];
    }
    
    return result;
  }, [entries, filter, sortColumn, sortDirection]);

  const contextResults = useMemo(() => {
    if (!selectedKey || !workspace) return [];
    const entry = entries.find((e) => e.key === selectedKey);
    if (!entry) return [];
    return findSimilarTranslations(workspace, entry.translation, /* currentFile?.id */);
  }, [selectedKey, workspace, entries, currentFile]);

  const handleTranslationChange = (key: string, value: string) => {
    updateTranslation(key, value);
  };

  const handleAddAnnotation = () => {
    if (!currentFile || !selectedKey || !annotationText.trim()) return;

    addAnnotation({
      fileId: currentFile.id,
      key: selectedKey,
      text: annotationText.trim(),
    });

    setAnnotationText('');
    setShowAnnotationDialog(false);
  };

  const handleRowClick = (key: string) => {
    setSelectedKey(key);
    setShowContextSearch(true);
  };

  if (!currentFile) {
    return (
      <div className="editor-empty">
        <p>Select a file to start editing</p>
      </div>
    );
  }

  return (
    <div className="gui-editor">
      <div className="editor-header">
        <h3>{currentFile.path}</h3>
        <div className="header-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search translations (filters as you type)..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="editor-layout">
        <div className="editor-main">
          <div className="translation-table-container">
            <table 
              className="translation-table" 
              ref={tableRef}
              style={{ width: `${widths.pin + widths.key + widths.reference + widths.translation + widths.actions}px` }}
            >
              <thead>
                <tr>
                  <th style={{ width: `${widths.pin}px`, position: 'relative' }}>
                    <div
                      className="resize-handle"
                      onMouseDown={(e) => handleMouseDown('pin', e)}
                    />
                  </th>
                  <th 
                    style={{ width: `${widths.key}px`, position: 'relative', cursor: 'pointer' }}
                    onClick={() => handleSort('key')}
                  >
                    <span className="th-content">
                      Key
                      {sortColumn === 'key' && (
                        <span className="sort-indicator">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </span>
                    <div
                      className="resize-handle"
                      onMouseDown={(e) => handleMouseDown('key', e)}
                    />
                  </th>
                  <th 
                    style={{ width: `${widths.reference}px`, position: 'relative', cursor: 'pointer' }}
                    onClick={() => handleSort('reference')}
                  >
                    <span className="th-content">
                      Reference
                      {sortColumn === 'reference' && (
                        <span className="sort-indicator">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </span>
                    <div
                      className="resize-handle"
                      onMouseDown={(e) => handleMouseDown('reference', e)}
                    />
                  </th>
                  <th 
                    style={{ width: `${widths.translation}px`, position: 'relative', cursor: 'pointer' }}
                    onClick={() => handleSort('translation')}
                  >
                    <span className="th-content">
                      Translation
                      {sortColumn === 'translation' && (
                        <span className="sort-indicator">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </span>
                    <div
                      className="resize-handle"
                      onMouseDown={(e) => handleMouseDown('translation', e)}
                    />
                  </th>
                  <th 
                    style={{ width: `${widths.actions}px`, cursor: 'pointer' }}
                    onClick={() => handleSort('status')}
                  >
                    <span className="th-content">
                      Status
                      {sortColumn === 'status' && (
                        <span className="sort-indicator">{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                      )}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredEntries.map((entry) => (
                  <TranslationRow
                    key={entry.key}
                    entry={entry}
                    isSelected={selectedKey === entry.key}
                    onTranslationChange={handleTranslationChange}
                    onRowClick={handleRowClick}
                    onAnnotationClick={() => {
                      setSelectedKey(entry.key);
                      setShowAnnotationDialog(true);
                    }}
                    onTogglePin={togglePinKey}
                    fileId={currentFile?.id || ''}
                    annotations={
                      currentFile ? getAnnotationsForKey(currentFile.id, entry.key) : []
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showContextSearch && selectedKey && (
          <div className="editor-sidebar">
            <div className="sidebar-header">
              <h4>Context Search</h4>
              <button
                className="btn-icon"
                onClick={() => setShowContextSearch(false)}
              >
                ×
              </button>
            </div>
            <div className="context-results">
              <p className="context-info">
                Found {contextResults.length} similar translation(s)
              </p>
              {contextResults.slice(0, 10).map((result, i) => (
                <div 
                  key={i} 
                  className="context-result clickable"
                  onClick={() => {
                    const targetFile = workspace?.files.find(f => f.id === result.fileId);
                    if (targetFile) {
                      useAppStore.getState().setCurrentFile(targetFile);
                      setSelectedKey(result.key);
                      setShowContextSearch(false);
                      // Scroll to the key after a short delay
                      setTimeout(() => {
                        const keyElement = document.querySelector(`[data-key="${result.key}"]`);
                        keyElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }
                  }}
                >
                  <div className="context-file">{result.fileName}</div>
                  <div className="context-key">{result.key}</div>
                  <div className="context-value">
                    <MinecraftTextPreview text={result.value} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAnnotationDialog && (
        <div className="modal-overlay" onClick={() => setShowAnnotationDialog(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Annotation</h3>
              <button
                className="btn-icon"
                onClick={() => setShowAnnotationDialog(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <textarea
                className="annotation-input"
                value={annotationText}
                onChange={(e) => setAnnotationText(e.target.value)}
                placeholder="Enter your annotation..."
                rows={4}
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowAnnotationDialog(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddAnnotation}>
                Add Annotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface TranslationRowProps {
  entry: {
    key: string;
    reference: string;
    translation: string;
    hasAnnotation?: boolean;
    isMissing?: boolean;
    isPinned?: boolean;
  };
  isSelected: boolean;
  onTranslationChange: (key: string, value: string) => void;
  onRowClick: (key: string) => void;
  onAnnotationClick: () => void;
  onTogglePin: (key: string) => void;
  annotations: Array<{id: string; fileId: string; key: string; text: string; createdAt: string; modifiedAt: string; color?: string}>;
  fileId: string;
}

const TranslationRow: React.FC<TranslationRowProps> = ({
  entry,
  isSelected,
  onTranslationChange,
  onRowClick: _onRowClick,
  onAnnotationClick,
  onTogglePin,
  annotations,
  fileId,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const saveTranslationToHistory = useAppStore((state) => state.saveTranslationToHistory);

  const handleInsertFormatting = (code: string) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = entry.translation;
    const newText = text.substring(0, start) + code + text.substring(end);
    
    onTranslationChange(entry.key, newText);
    
    // Set cursor position after the inserted code
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = start + code.length;
        textareaRef.current.selectionEnd = start + code.length;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleCopyFromReference = () => {
    onTranslationChange(entry.key, entry.reference);
    setShowDuplicateWarning(true);
  };

  return (
    <>
      <tr
        className={`translation-row ${isSelected ? 'selected' : ''} ${
          entry.isMissing ? 'missing' : ''
        } ${entry.isPinned ? 'pinned' : ''}`}
        data-key={entry.key}
      >
        <td className="pin-cell">
          <button
            className="btn-icon btn-pin"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(entry.key);
            }}
            title={entry.isPinned ? 'Unpin' : 'Pin to top'}
          >
            {entry.isPinned ? <Pin size={14} className="pinned-icon" /> : <PinOff size={14} />}
          </button>
        </td>
        <td className="key-cell">{entry.key}</td>
      <td className="reference-cell">
        <MinecraftTextPreview text={entry.reference} className="text-preview" />
      </td>
      <td className="translation-cell">
        <div className="translation-cell-wrapper">
          {showToolbar && (
            <FormattingToolbar
              onInsert={handleInsertFormatting}
              className="cell-toolbar"
            />
          )}
          <div className="translation-input-row">
            <textarea
              ref={textareaRef}
              className="translation-input"
              value={entry.translation}
              onChange={(e) => onTranslationChange(entry.key, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onFocus={() => {
                setShowToolbar(true);
                saveTranslationToHistory();
              }}
              onBlur={() => {
                setTimeout(() => setShowToolbar(false), 300);
              }}
              placeholder="Enter translation..."
            />
            <button
              className="btn-icon btn-copy-reference"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyFromReference();
              }}
              title="Copy from reference"
            >
              <Copy size={14} />
            </button>
          </div>
          <MinecraftTextPreview text={entry.translation} className="text-preview" />
          {entry.isMissing && (
            <span className="missing-indicator" title="Missing translation">
              <AlertCircle size={14} />
            </span>
          )}
          {showDuplicateWarning && (
            <div className="duplicate-warning">
              <AlertCircle size={14} />
              <span>Warning: This may be a duplicate or untranslated text</span>
              <button
                className="btn-dismiss"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDuplicateWarning(false);
                }}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </td>
        <td className="actions-cell">
          <button
            className={`btn-icon ${annotations.length > 0 ? 'has-annotations' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowAnnotations(!showAnnotations);
            }}
            title={annotations.length > 0 ? `${annotations.length} annotation(s)` : 'No annotations'}
          >
            <MessageSquare size={16} />
            {annotations.length > 0 && <span className="annotation-badge">{annotations.length}</span>}
          </button>
          <button
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              onAnnotationClick();
            }}
            title="Add annotation"
          >
            <MessageSquare size={16} />+
          </button>
        </td>
      </tr>
      {showAnnotations && annotations.length > 0 && (
        <tr className="annotations-row">
          <td colSpan={5}>
            <AnnotationsList fileId={fileId} translationKey={entry.key} />
          </td>
        </tr>
      )}
    </>
  );
};
