import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { getAllThemes, exportTheme, importTheme, createCustomTheme } from '../utils/themes';
import { Palette, Download, Upload, Plus, Check } from 'lucide-react';
import type { Theme } from '../types';

export const ThemeManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const currentTheme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  const saveCustomTheme = useAppStore((state) => state.saveCustomTheme);

  const [themes] = useState(getAllThemes());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [themeName, setThemeName] = useState('');

  const handleThemeSelect = (theme: Theme) => {
    setTheme(theme);
  };

  const handleExportTheme = (theme: Theme) => {
    const json = exportTheme(theme);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.id}.theme.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTheme = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        try {
          const theme = importTheme(text);
          saveCustomTheme(theme);
          setTheme(theme);
        } catch (error) {
          alert('Failed to import theme: Invalid format');
        }
      }
    };
    input.click();
  };

  const handleCreateTheme = () => {
    if (!themeName.trim()) return;
    const newTheme = createCustomTheme(themeName, currentTheme);
    saveCustomTheme(newTheme);
    setTheme(newTheme);
    setThemeName('');
    setShowCreateDialog(false);
  };

  const handleEditTheme = (theme: Theme) => {
    setEditingTheme({ ...theme });
    setShowEditDialog(true);
  };

  const handleSaveEditedTheme = () => {
    if (!editingTheme) return;
    saveCustomTheme(editingTheme);
    setTheme(editingTheme);
    setEditingTheme(null);
    setShowEditDialog(false);
  };

  const updateThemeColor = (key: string, value: string) => {
    if (!editingTheme) return;
    setEditingTheme({
      ...editingTheme,
      colors: {
        ...editingTheme.colors,
        [key]: value,
      },
    });
  };

  const updateThemeFont = (type: 'family' | 'monoFamily', value: string) => {
    if (!editingTheme) return;
    setEditingTheme({
      ...editingTheme,
      font: {
        family: type === 'family' ? value : (editingTheme.font?.family || 'Inter, system-ui, sans-serif'),
        monoFamily: type === 'monoFamily' ? value : (editingTheme.font?.monoFamily || 'Monaco, Menlo, monospace'),
      },
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal theme-manager" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Palette size={24} />
            Theme Manager
          </h2>
          <button className="btn-icon" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="theme-actions">
            <button className="btn btn-primary" onClick={() => setShowCreateDialog(true)}>
              <Plus size={16} />
              Create Theme
            </button>
            <button className="btn btn-secondary" onClick={handleImportTheme}>
              <Upload size={16} />
              Import Theme
            </button>
          </div>

          <div className="theme-grid">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`theme-card ${currentTheme.id === theme.id ? 'active' : ''}`}
                onClick={() => handleThemeSelect(theme)}
              >
                <div className="theme-preview">
                  <div
                    className="theme-color"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="theme-color"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <div
                    className="theme-color"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                  <div
                    className="theme-color"
                    style={{ backgroundColor: theme.colors.background }}
                  />
                </div>
                <div className="theme-info">
                  <h4>{theme.name}</h4>
                  {currentTheme.id === theme.id && (
                    <Check size={16} className="theme-check" />
                  )}
                </div>
                <div className="theme-actions-row">
                  {theme.isCustom && (
                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTheme(theme);
                      }}
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportTheme(theme);
                    }}
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showCreateDialog && (
          <div className="modal-overlay" onClick={() => setShowCreateDialog(false)}>
            <div className="modal small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Create Theme</h3>
                <button className="btn-icon" onClick={() => setShowCreateDialog(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="input"
                  placeholder="Theme name"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                />
                <p className="hint">Theme will be based on the current theme</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCreateTheme}>
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {showEditDialog && editingTheme && (
          <div className="modal-overlay" onClick={() => setShowEditDialog(false)}>
            <div className="modal large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit Theme: {editingTheme.name}</h3>
                <button className="btn-icon" onClick={() => setShowEditDialog(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="theme-section">
                  <h4>Fonts</h4>
                  <div className="font-inputs">
                    <div className="form-group">
                      <label>UI Font Family</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Inter, system-ui, sans-serif"
                        value={editingTheme.font?.family || ''}
                        onChange={(e) => updateThemeFont('family', e.target.value)}
                      />
                      <small className="form-hint">Font used for UI elements and text</small>
                    </div>
                    <div className="form-group">
                      <label>Monospace Font Family</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Monaco, Menlo, monospace"
                        value={editingTheme.font?.monoFamily || ''}
                        onChange={(e) => updateThemeFont('monoFamily', e.target.value)}
                      />
                      <small className="form-hint">Font used for code and translation keys</small>
                    </div>
                  </div>
                </div>
                <div className="theme-section">
                  <h4>Colors</h4>
                  <div className="color-grid">
                    {Object.entries(editingTheme.colors).map(([key, value]) => (
                      <div key={key} className="color-input-group">
                        <label>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <div className="color-input-container">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => updateThemeColor(key, e.target.value)}
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateThemeColor(key, e.target.value)}
                            className="input color-hex"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveEditedTheme}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
