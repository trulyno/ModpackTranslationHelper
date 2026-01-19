import { useState, useEffect, useRef } from 'react';

interface ColumnWidths {
  [key: string]: number;
}

export function useResizableColumns(
  initialWidths: ColumnWidths,
  // tableRef: React.RefObject<HTMLTableElement>
) {
  const [widths, setWidths] = useState<ColumnWidths>(initialWidths);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const delta = e.clientX - startX.current;
      const newWidth = Math.max(50, startWidth.current + delta);
      
      setWidths((prev) => ({
        ...prev,
        [isResizing]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleMouseDown = (column: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(column);
    startX.current = e.clientX;
    startWidth.current = widths[column] || 100;
  };

  return { widths, handleMouseDown, isResizing };
}
