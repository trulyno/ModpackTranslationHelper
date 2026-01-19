import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { Globe, Plus, X } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const workspace = useAppStore((state) => state.workspace);
  const setCurrentLanguage = useAppStore((state) => state.setCurrentLanguage);
  const [showNewLanguageDialog, setShowNewLanguageDialog] = useState(false);
  const [newLanguageCode, setNewLanguageCode] = useState('');

  const currentLanguage = workspace?.currentLanguage;
  const availableLanguages = workspace ? Array.from(
    new Set(workspace.files.map((f) => f.language))
  ).filter((lang) => lang !== 'en_us') : [];

  // Auto-show dialog if only en_us exists and workspace has files
  React.useEffect(() => {
    if (workspace && workspace.files.length > 0 && availableLanguages.length === 0 && !showNewLanguageDialog) {
      setShowNewLanguageDialog(true);
    }
  }, [workspace, availableLanguages.length, showNewLanguageDialog]);

  if (!workspace) return null;

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
  };

  const handleCreateLanguage = () => {
    if (newLanguageCode.trim()) {
      const langCode = newLanguageCode.trim().toLowerCase();
      setCurrentLanguage(langCode);
      setNewLanguageCode('');
      setShowNewLanguageDialog(false);
    }
  };

  return (
    <div className="language-selector">
      <Globe size={16} />
      <select
        value={currentLanguage}
        onChange={(e) => {
          if (e.target.value === '__new__') {
            setShowNewLanguageDialog(true);
          } else {
            handleLanguageChange(e.target.value);
          }
        }}
        className="language-select"
      >
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
        <option value="__new__">+ New Language...</option>
      </select>

      {showNewLanguageDialog && (
        <div className="modal-overlay" onClick={() => availableLanguages.length > 0 && setShowNewLanguageDialog(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{availableLanguages.length === 0 ? 'Create Target Language' : 'Create New Language'}</h2>
              {availableLanguages.length > 0 && (
                <button
                  className="btn-icon"
                  onClick={() => setShowNewLanguageDialog(false)}
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <div className="modal-content">
              {availableLanguages.length === 0 && (
                <p className="info-message">
                  You need to create a target language to start translating. 
                  All en_us files will be duplicated with empty translation values.
                </p>
              )}
              <div className="form-group">
                <label htmlFor="language-code">Language Code</label>
                <input
                  id="language-code"
                  type="text"
                  placeholder="e.g., es_es, fr_fr, de_de"
                  value={newLanguageCode}
                  onChange={(e) => setNewLanguageCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateLanguage()}
                  autoFocus
                />
                <small className="form-hint">
                  Use Minecraft's language code format (e.g., es_es for Spanish, fr_fr for French)
                </small>
              </div>
            </div>
            <div className="modal-footer">
              {availableLanguages.length > 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowNewLanguageDialog(false)}
                >
                  Cancel
                </button>
              )}
              <button
                className="btn btn-primary"
                onClick={handleCreateLanguage}
                disabled={!newLanguageCode.trim()}
              >
                <Plus size={16} />
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
