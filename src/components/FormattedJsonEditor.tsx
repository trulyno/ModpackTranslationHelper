import React, { useRef, useEffect, useState } from 'react';

interface FormattedJsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const MINECRAFT_COLORS: Record<string, string> = {
  '0': '#000000', // Black
  '1': '#0000AA', // Dark Blue
  '2': '#00AA00', // Dark Green
  '3': '#00AAAA', // Dark Aqua
  '4': '#AA0000', // Dark Red
  '5': '#AA00AA', // Dark Purple
  '6': '#FFAA00', // Gold
  '7': '#AAAAAA', // Gray
  '8': '#555555', // Dark Gray
  '9': '#5555FF', // Blue
  'a': '#55FF55', // Green
  'b': '#55FFFF', // Aqua
  'c': '#FF5555', // Red
  'd': '#FF55FF', // Light Purple
  'e': '#FFFF55', // Yellow
  'f': '#FFFFFF', // White
};

const MINECRAFT_FORMATS: Record<string, string> = {
  'l': 'bold',
  'o': 'italic',
  'n': 'underline',
  'm': 'line-through',
  'r': 'reset',
};

export const FormattedJsonEditor: React.FC<FormattedJsonEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  placeholder = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Parse and format the JSON content with Minecraft formatting
  const formatContent = (text: string): string => {
    try {
      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      
      // Split into lines for processing
      const lines = formatted.split('\n');
      const formattedLines = lines.map(line => {
        // Check if this line contains a translation value (has quotes and colon)
        const match = line.match(/^(\s*"[^"]+"\s*:\s*)"(.+)"(,?)$/);
        if (!match) return escapeHtml(line);
        
        const [, prefix, content, suffix] = match;
        const formattedContent = applyMinecraftFormatting(content);
        console.log([prefix, formattedContent, suffix])
        return escapeHtml(prefix + '"') + formattedContent + escapeHtml('"' + suffix);
      });
      
      return formattedLines.join('\n');
    } catch {
      // If parsing fails, return plain escaped content
      return escapeHtml(text);
    }
  };

  // Apply Minecraft formatting codes to a string
  const applyMinecraftFormatting = (text: string): string => {
    const segments: string[] = [];
    let currentColor = '#AAAAAA';
    let currentFormats: string[] = [];
    let i = 0;
    let currentText = '';

    while (i < text.length) {
      if (text[i] === '§' && i + 1 < text.length) {
        // Flush current text
        if (currentText) {
          segments.push(createSpan(currentText, currentColor, currentFormats));
          currentText = '';
        }

        const code = text[i + 1].toLowerCase();
        
        // Add the § symbol and code to the output (visible but styled)
        const formatCode = `§${text[i + 1]}`;
        segments.push(`<span style="color: #888; opacity: 0.6;">${escapeHtml(formatCode)}</span>`);
        
        if (MINECRAFT_COLORS[code]) {
          currentColor = MINECRAFT_COLORS[code];
        } else if (MINECRAFT_FORMATS[code]) {
          if (code === 'r') {
            currentColor = '#AAAAAA';
            currentFormats = [];
          } else {
            currentFormats.push(MINECRAFT_FORMATS[code]);
          }
        }
        
        i += 2;
      } else {
        currentText += text[i];
        i++;
      }
    }

    // Flush remaining text
    if (currentText) {
      segments.push(createSpan(currentText, currentColor, currentFormats));
    }

    return segments.join('');
  };

  const createSpan = (text: string, color: string, formats: string[]): string => {
    const styles: string[] = [`color: ${color}`];
    
    if (formats.includes('bold')) styles.push('font-weight: bold');
    if (formats.includes('italic')) styles.push('font-style: italic');
    if (formats.includes('underline')) styles.push('text-decoration: underline');
    if (formats.includes('line-through')) {
      styles.push('text-decoration: line-through');
    }
    
    const escapedText = escapeHtml(text);
    return `<span style="${styles.join('; ')}">${escapedText}</span>`;
  };

  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Update the display when value changes
  useEffect(() => {
    if (!editorRef.current || isFocused) return;
    
    const formatted = formatContent(value);
    editorRef.current.innerHTML = formatted || `<span style="color: var(--color-text-secondary)">${placeholder}</span>`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isFocused, placeholder]);

  // Handle content changes
  const handleInput = () => {
    if (!editorRef.current || readOnly) return;
    
    const newContent = editorRef.current.innerText;
    onChange(newContent);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Re-format on blur
    if (editorRef.current) {
      const formatted = formatContent(value);
      editorRef.current.innerHTML = formatted;
    }
  };

  return (
    <div
      ref={editorRef}
      className="formatted-json-editor"
      contentEditable={!readOnly}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      spellCheck={false}
      suppressContentEditableWarning
    />
  );
};
