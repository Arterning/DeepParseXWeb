'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  // Read initial state from the DOM (already set by the inline script in layout.tsx)
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggle}
      title={isDark ? '切换到浅色模式' : '切换到深色模式'}
      className={[
        'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
        'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
        'hover:bg-slate-100 dark:hover:bg-slate-800',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
