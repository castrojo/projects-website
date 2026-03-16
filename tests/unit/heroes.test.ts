import { describe, it, expect } from 'vitest';
import { selectHeroSets } from '../../src/lib/heroes';
import type { SafeProject } from '../../src/lib/project-renderer';

const mkProject = (name: string, maturity: string, accepted = '2020-01-01'): SafeProject => ({
  name, slug: name.toLowerCase(), maturity, category: 'Test', subcategory: '', logoUrl: '', updatedAt: '', acceptedDate: accepted,
});

describe('selectHeroSets', () => {
  const projects = [
    mkProject('Kubernetes', 'graduated'),
    mkProject('Envoy', 'graduated'),
    mkProject('Linkerd', 'incubating'),
    mkProject('TestSandbox', 'sandbox'),
    mkProject('Archived', 'archived'),
  ];

  it('selects graduated heroes', () => {
    const sets = selectHeroSets(projects);
    expect(sets.graduated.length).toBeGreaterThan(0);
    expect(sets.graduated.every(p => p.maturity === 'graduated')).toBe(true);
  });

  it('returns empty arrays for empty pool', () => {
    const sets = selectHeroSets([]);
    expect(sets.graduated).toHaveLength(0);
    expect(sets.everyone).toHaveLength(0);
  });

  it('excludes archived from everyone set', () => {
    const sets = selectHeroSets(projects);
    expect(sets.everyone.every(p => p.maturity !== 'archived')).toBe(true);
  });
});
