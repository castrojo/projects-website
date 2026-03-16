import type { SafeProject } from './project-renderer';

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

function dailyHero(pool: SafeProject[]): SafeProject | null {
  if (!pool.length) return null;
  const sorted = [...pool].sort((a, b) => djb2(a.name) - djb2(b.name));
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return sorted[dayIndex % sorted.length];
}

export interface HeroSet {
  graduated: SafeProject | null;
  incubating: SafeProject | null;
  sandbox: SafeProject | null;
  recentlyAccepted: SafeProject | null;
}

export function selectHeroes(projects: SafeProject[]): HeroSet {
  const graduated = projects.filter(p => p.maturity === 'graduated');
  const incubating = projects.filter(p => p.maturity === 'incubating');
  const sandbox = projects.filter(p => p.maturity === 'sandbox');
  const recent = [...projects.filter(p => p.maturity !== 'archived')]
    .sort((a, b) => (b.acceptedDate ?? '') > (a.acceptedDate ?? '') ? 1 : -1);

  return {
    graduated: dailyHero(graduated),
    incubating: dailyHero(incubating),
    sandbox: dailyHero(sandbox),
    recentlyAccepted: dailyHero(recent),
  };
}
