import React, { useState } from 'react';
import { Bold, Italic, Underline, Strikethrough, Type, RotateCcw } from 'lucide-react';

interface FormattingToolbarProps {
  onInsert: (code: string) => void;
  className?: string;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ onInsert, className }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colors = [
    { code: '§0', name: 'Black', color: '#000000' },
    { code: '§1', name: 'Dark Blue', color: '#0000AA' },
    { code: '§2', name: 'Dark Green', color: '#00AA00' },
    { code: '§3', name: 'Dark Aqua', color: '#00AAAA' },
    { code: '§4', name: 'Dark Red', color: '#AA0000' },
    { code: '§5', name: 'Dark Purple', color: '#AA00AA' },
    { code: '§6', name: 'Gold', color: '#FFAA00' },
    { code: '§7', name: 'Gray', color: '#AAAAAA' },
    { code: '§8', name: 'Dark Gray', color: '#555555' },
    { code: '§9', name: 'Blue', color: '#5555FF' },
    { code: '§a', name: 'Green', color: '#55FF55' },
    { code: '§b', name: 'Aqua', color: '#55FFFF' },
    { code: '§c', name: 'Red', color: '#FF5555' },
    { code: '§d', name: 'Light Purple', color: '#FF55FF' },
    { code: '§e', name: 'Yellow', color: '#FFFF55' },
    { code: '§f', name: 'White', color: '#FFFFFF' },
  ];

  return (
    <div className={`formatting-toolbar ${className || ''}`}>
      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={() => onInsert('§l')}
          title="Bold (§l)"
        >
          <Bold size={16} />
        </button>
        <button
          className="toolbar-btn"
          onClick={() => onInsert('§o')}
          title="Italic (§o)"
        >
          <Italic size={16} />
        </button>
        <button
          className="toolbar-btn"
          onClick={() => onInsert('§n')}
          title="Underline (§n)"
        >
          <Underline size={16} />
        </button>
        <button
          className="toolbar-btn"
          onClick={() => onInsert('§m')}
          title="Strikethrough (§m)"
        >
          <Strikethrough size={16} />
        </button>
        <button
          className="toolbar-btn"
          onClick={() => onInsert('§k')}
          title="Obfuscated (§k)"
        >
          <Type size={16} />
        </button>
        <button
          className="toolbar-btn"
          onClick={() => onInsert('§r')}
          title="Reset (§r)"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="toolbar-btn color-picker-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowColorPicker(!showColorPicker);
          }}
          title="Color"
        >
          <div className="color-icon">A</div>
        </button>

        {showColorPicker && (
          <div className="color-picker-dropdown">
            <div className="color-grid-picker">
              {colors.map((color) => (
                <button
                  key={color.code}
                  className="color-option"
                  style={{ backgroundColor: color.color }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onInsert(color.code);
                    setShowColorPicker(false);
                  }}
                  title={`${color.name} (${color.code})`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
