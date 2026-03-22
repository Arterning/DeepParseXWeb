'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { Workbook } from '@fortune-sheet/react';
import '@fortune-sheet/react/dist/index.css';
import type { Sheet } from '@fortune-sheet/core';

const DEFAULT_SHEET: Sheet[] = [
  {
    name: 'Sheet1',
    celldata: [],
    config: {},
    row: 100,
    column: 26,
  },
];

interface SheetEditorProps {
  initialContent: string | null | undefined;
  onUpdate: (json: string) => void;
}

export default function SheetEditor({ initialContent, onUpdate }: SheetEditorProps) {
  const [sheets, setSheets] = useState<Sheet[]>(() => {
    if (!initialContent) return DEFAULT_SHEET;
    try {
      const parsed = JSON.parse(initialContent);
      return Array.isArray(parsed) ? parsed : DEFAULT_SHEET;
    } catch {
      return DEFAULT_SHEET;
    }
  });

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (data: Sheet[]) => {
      setSheets(data);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        onUpdate(JSON.stringify(data));
      }, 2000);
    },
    [onUpdate],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Workbook
        data={sheets}
        onChange={handleChange}
      />
    </div>
  );
}
