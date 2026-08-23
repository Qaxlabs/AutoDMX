'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`h-9 w-9 rounded-full border border-neutral-200/80 bg-neutral-100/50 dark:border-neutral-800 dark:bg-neutral-900/50 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const cycleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={`group relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200/90 bg-white/80 text-neutral-700 shadow-sm backdrop-blur-md transition-all hover:border-neutral-400 hover:bg-white hover:text-black active:scale-95 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-900 dark:hover:text-white ${className}`}
      title={`Current theme: ${theme || 'system'}. Click to toggle.`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Moon className="h-4 w-4 transition-transform group-hover:scale-110" />
      ) : theme === 'light' ? (
        <Sun className="h-4 w-4 transition-transform group-hover:scale-110" />
      ) : (
        <Monitor className="h-4 w-4 transition-transform group-hover:scale-110" />
      )}
    </button>
  );
}
