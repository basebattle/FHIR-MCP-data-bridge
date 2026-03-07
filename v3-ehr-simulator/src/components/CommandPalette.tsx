'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, X } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  description: string;
  category: string;
  action: () => void;
}

const commands: Command[] = [
  {
    id: '1',
    label: 'Start Demo',
    description: 'Launch autonomous clinical workflow',
    category: 'Demo',
    action: () => {},
  },
  {
    id: '2',
    label: 'Reset Demo',
    description: 'Clear and restart the demonstration',
    category: 'Demo',
    action: () => {},
  },
  {
    id: '3',
    label: 'View Patient Record',
    description: 'Show full patient medical record',
    category: 'Patient',
    action: () => {},
  },
  {
    id: '4',
    label: 'Export ICD-10 Codes',
    description: 'Download extracted diagnostic codes',
    category: 'Export',
    action: () => {},
  },
  {
    id: '5',
    label: 'Approve Suggestions',
    description: 'Accept AI-generated recommendations',
    category: 'Actions',
    action: () => {},
  },
  {
    id: '6',
    label: 'Dark Mode',
    description: 'Toggle dark/light theme',
    category: 'Settings',
    action: () => {},
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      {/* Keyboard shortcut button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--muted)] transition-colors"
      >
        <Search size={16} />
        <span className="hidden sm:inline text-xs text-[var(--muted-foreground)]">⌘K</span>
      </button>

      {/* Command Palette Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
          <div className="w-full max-w-lg neo-card rounded-lg overflow-hidden shadow-2xl">
            <Command>
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
                <Search size={16} className="text-[var(--muted-foreground)]" />
                <Command.Input
                  placeholder="Search commands..."
                  className="flex-1 bg-transparent border-0 outline-none text-sm placeholder-[var(--muted-foreground)]"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 hover:bg-[var(--muted)] rounded"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Command Items */}
              <Command.List className="max-h-96 overflow-y-auto">
                <Command.Empty className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                  No commands found.
                </Command.Empty>

                {/* Grouped Commands */}
                {Array.from(new Set(commands.map((c) => c.category))).map((category) => (
                  <Command.Group key={category} heading={category} className="overflow-hidden">
                    {/* Group Heading */}
                    <div className="px-4 py-2 text-2xs font-bold uppercase text-[var(--muted-foreground)] tracking-clinical sticky top-0 bg-[var(--surface-0)]">
                      {category}
                    </div>

                    {/* Group Items */}
                    {commands
                      .filter((cmd) => cmd.category === category)
                      .map((cmd) => (
                        <Command.Item
                          key={cmd.id}
                          value={cmd.label}
                          onSelect={cmd.action}
                          className="px-4 py-2 hover:bg-[var(--muted)] cursor-pointer data-[selected]:bg-[var(--primary)] data-[selected]:text-white transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium">{cmd.label}</p>
                            <p className="text-2xs text-[var(--muted-foreground)] mt-0.5">
                              {cmd.description}
                            </p>
                          </div>
                        </Command.Item>
                      ))}
                  </Command.Group>
                ))}
              </Command.List>

              {/* Footer Help Text */}
              <div className="border-t border-[var(--border-subtle)] px-4 py-2 flex items-center justify-between text-2xs text-[var(--muted-foreground)]">
                <span>Use arrow keys to navigate • Enter to select • Esc to close</span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
