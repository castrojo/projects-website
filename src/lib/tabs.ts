export type TabId = 'everyone' | 'graduated' | 'incubating' | 'sandbox' | 'archived';

const TAB_STORAGE_KEY = 'projects-active-tab';

export function initTabs(onTabChange: (tabId: TabId) => void): void {
  const savedTab = (localStorage.getItem(TAB_STORAGE_KEY) as TabId) ?? 'everyone';
  activateTab(savedTab, onTabChange);

  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = (btn as HTMLElement).dataset.tab as TabId;
      if (tab) {
        localStorage.setItem(TAB_STORAGE_KEY, tab);
        activateTab(tab, onTabChange);
      }
    });
  });
}

export function activateTab(tabId: TabId, onTabChange: (tabId: TabId) => void): void {
  document.querySelectorAll('.tab-button').forEach(btn => {
    const active = (btn as HTMLElement).dataset.tab === tabId;
    btn.classList.toggle('active', active);
  });
  onTabChange(tabId);
}

export function filterByTab(projects: import('./project-renderer').SafeProject[], tabId: TabId): import('./project-renderer').SafeProject[] {
  if (tabId === 'everyone') return projects.filter(p => p.maturity !== 'archived');
  return projects.filter(p => p.maturity === tabId);
}
