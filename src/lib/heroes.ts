import type { SafeProject } from './project-renderer';

function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return h >>> 0;
}

export function heroSlots(pool: SafeProject[], count = 8): SafeProject[] {
  if (!pool.length) return [];
  const sorted = [...pool].sort((a, b) => djb2(a.name) - djb2(b.name));
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const seen = new Set<string>();
  const result: SafeProject[] = [];
  for (let i = 0; result.length < count && i < sorted.length * 2; i++) {
    const p = sorted[(dayIndex + i) % sorted.length];
    if (!seen.has(p.slug)) { seen.add(p.slug); result.push(p); }
  }
  return result;
}

export interface HeroSets {
  everyone:   SafeProject[];
  graduated:  SafeProject[];
  incubating: SafeProject[];
  sandbox:    SafeProject[];
}

export function selectHeroSets(projects: SafeProject[]): HeroSets {
  return {
    everyone:   heroSlots(projects.filter(p => p.maturity !== 'archived')),
    graduated:  heroSlots(projects.filter(p => p.maturity === 'graduated')),
    incubating: heroSlots(projects.filter(p => p.maturity === 'incubating')),
    sandbox:    heroSlots(projects.filter(p => p.maturity === 'sandbox')),
  };
}
