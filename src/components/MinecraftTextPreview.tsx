import React from 'react';
import { parseMinecraftText, getColorHex } from '../utils/minecraftFormat';
import type { MinecraftTextSegment } from '../utils/minecraftFormat';

interface MinecraftTextPreviewProps {
  text: string;
  className?: string;
}

export const MinecraftTextPreview: React.FC<MinecraftTextPreviewProps> = ({ text, className }) => {
  const segments = parseMinecraftText(text);

  return (
    <div className={`minecraft-preview ${className || ''}`}>
      {segments.map((segment, index) => (
        <MinecraftSegment key={index} segment={segment} />
      ))}
    </div>
  );
};

interface MinecraftSegmentProps {
  segment: MinecraftTextSegment;
}

const MinecraftSegment: React.FC<MinecraftSegmentProps> = ({ segment }) => {
  const style: React.CSSProperties = {};

  if (segment.color) {
    style.color = getColorHex(segment.color);
  }
  if (segment.bold) {
    style.fontWeight = 'bold';
  }
  if (segment.italic) {
    style.fontStyle = 'italic';
  }

  const className = [
    segment.underline ? 'mc-underline' : '',
    segment.strikethrough ? 'mc-strikethrough' : '',
    segment.obfuscated ? 'mc-obfuscated' : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (segment.obfuscated) {
    return <ObfuscatedText text={segment.text} style={style} className={className} />;
  }

  return (
    <span style={style} className={className}>
      {segment.text}
    </span>
  );
};

interface ObfuscatedTextProps {
  text: string;
  style: React.CSSProperties;
  className: string;
}

const ObfuscatedText: React.FC<ObfuscatedTextProps> = ({ text, style, className }) => {
  const [displayText, setDisplayText] = React.useState(text);

  React.useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char) => (char === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]))
          .join('')
      );
    }, 50);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span style={style} className={className}>
      {displayText}
    </span>
  );
};
