import React from 'react';
import { HelpCircle, Keyboard, Palette, FileText, Zap } from 'lucide-react';
import { formatShortcut } from '../hooks/useKeyboardShortcuts';

interface HelpDialogProps {
  onClose: () => void;
}

export const HelpDialog: React.FC<HelpDialogProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <HelpCircle size={24} />
            Help & Shortcuts
          </h2>
          <button className="btn-icon" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <section className="help-section">
            <h3>
              <Keyboard size={20} />
              Keyboard Shortcuts
            </h3>
            <div className="shortcuts-list">
              <div className="shortcut-item">
                <kbd>{formatShortcut(['mod', 's'])}</kbd>
                <span>Save current file</span>
              </div>
              <div className="shortcut-item">
                <kbd>{formatShortcut(['mod', 'e'])}</kbd>
                <span>Toggle editor mode (GUI/Raw)</span>
              </div>
              <div className="shortcut-item">
                <kbd>{formatShortcut(['mod', 'f'])}</kbd>
                <span>Focus search bar</span>
              </div>
              <div className="shortcut-item">
                <kbd>ESC</kbd>
                <span>Clear search / Close dialogs</span>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h3>
              <Palette size={20} />
              Minecraft Formatting Codes
            </h3>
            <div className="formatting-list">
              <div className="format-group">
                <h4>Colors</h4>
                <div className="format-codes">
                  <code>§0</code> Black
                  <code>§1</code> Dark Blue
                  <code>§2</code> Dark Green
                  <code>§3</code> Dark Aqua
                </div>
                <div className="format-codes">
                  <code>§4</code> Dark Red
                  <code>§5</code> Dark Purple
                  <code>§6</code> Gold
                  <code>§7</code> Gray
                </div>
                <div className="format-codes">
                  <code>§8</code> Dark Gray
                  <code>§9</code> Blue
                  <code>§a</code> Green
                  <code>§b</code> Aqua
                </div>
                <div className="format-codes">
                  <code>§c</code> Red
                  <code>§d</code> Light Purple
                  <code>§e</code> Yellow
                  <code>§f</code> White
                </div>
              </div>

              <div className="format-group">
                <h4>Styles</h4>
                <div className="format-codes">
                  <code>§l</code> <strong>Bold</strong>
                  <code>§o</code> <em>Italic</em>
                  <code>§n</code> <u>Underline</u>
                </div>
                <div className="format-codes">
                  <code>§m</code> <s>Strikethrough</s>
                  <code>§k</code> Obfuscated
                  <code>§r</code> Reset
                </div>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h3>
              <FileText size={20} />
              Import/Export Options
            </h3>
            <ul className="features-list">
              <li>
                <strong>Import Single File:</strong> Import individual .json language files
              </li>
              <li>
                <strong>Import ZIP:</strong> Import resource packs or KubeJS projects
              </li>
              <li>
                <strong>Import from GitHub:</strong> Automatically fetch KubeJS lang files from repositories
              </li>
              <li>
                <strong>Export as ZIP:</strong> Export with KubeJS folder structure
              </li>
              <li>
                <strong>Export as Resource Pack:</strong> Create Minecraft resource pack with pack.mcmeta
              </li>
            </ul>
          </section>

          <section className="help-section">
            <h3>
              <Zap size={20} />
              Smart Features
            </h3>
            <ul className="features-list">
              <li>
                <strong>Word Search:</strong> Click on a translation to find similar translations across all files for context
              </li>
              <li>
                <strong>Annotations:</strong> Add notes to specific translations for collaboration or reminders
              </li>
              <li>
                <strong>Live Preview:</strong> See formatted Minecraft text in real-time with colors and styles
              </li>
              <li>
                <strong>Missing Detection:</strong> Automatically highlights translations missing from current file
              </li>
              <li>
                <strong>Auto-save:</strong> Workspace is automatically saved to local storage every 30 seconds
              </li>
            </ul>
          </section>

          <section className="help-section">
            <h3>Tips</h3>
            <ul className="features-list">
              <li>Use the formatting toolbar when editing translations to easily insert Minecraft codes</li>
              <li>Set a reference file (usually en_us.json) for side-by-side translation</li>
              <li>Create custom themes to match your preferred color scheme</li>
              <li>Use the search feature to find all occurrences of a word or phrase</li>
              <li>The Raw editor is useful for bulk operations and reviewing JSON structure</li>
            </ul>
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
