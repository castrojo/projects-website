import type { TabId } from './tabs';

interface KeyboardOptions {
  onSearch: () => void;
  onHelp: () => void;
  onTheme: () => void;
  onTab: (n: number) => void;
  onEscape: () => void;
}

export function initKeyboard(opts: KeyboardOptions): void {
  document.addEventListener('keydown', (e) => {
    const tag = (e.target as HTMLElement).tagName;
    const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable;

    if (e.key === 'Escape') {
      opts.onEscape();
      return;
    }

    if (inInput) return;

    if (e.key === '/' || e.key === 's') {
      e.preventDefault();
      opts.onSearch();
    } else if (e.key === '?') {
      opts.onHelp();
    } else if (e.key === 't') {
      opts.onTheme();
    } else if (e.key >= '1' && e.key <= '5') {
      opts.onTab(parseInt(e.key));
    }
  });
}

const TABS: TabId[] = ['everyone', 'graduated', 'incubating', 'sandbox', 'archived'];
export function tabFromNumber(n: number): TabId {
  return TABS[n - 1] ?? 'everyone';
}
