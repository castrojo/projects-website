import { describe, it, expect } from 'vitest';
import { selectHeroes } from '../../src/lib/heroes';
import type { SafeProject } from '../../src/lib/project-renderer';

const mkProject = (name: string, maturity: string, accepted = '2020-01-01'): SafeProject => ({
  name, slug: name.toLowerCase(), maturity, category: 'Test', subcategory: '', logoUrl: '', updatedAt: '', acceptedDate: accepted,
});

describe('selectHeroes', () => {
  const projects = [
    mkProject('Kubernetes', 'graduated'),
    mkProject('Envoy', 'graduated'),
    mkProject('Linkerd', 'incubating'),
    mkProject('TestSandbox', 'sandbox'),
    mkProject('Archived', 'archived'),
  ];

  it('selects a graduated hero', () => {
    const heroes = selectHeroes(projects);
    expect(heroes.graduated).not.toBeNull();
    expect(heroes.graduated?.maturity).toBe('graduated');
  });

  it('returns null for empty pool', () => {
    const heroes = selectHeroes([]);
    expect(heroes.graduated).toBeNull();
  });

  it('does not select archived as recently accepted', () => {
    const heroes = selectHeroes(projects);
    expect(heroes.recentlyAccepted?.maturity).not.toBe('archived');
  });
});
