import { describe, it, expect } from 'vitest';
import { filterByTab } from '../../src/lib/tabs';
import type { SafeProject } from '../../src/lib/project-renderer';

const projects: SafeProject[] = [
  { name: 'K8s', slug: 'k8s', maturity: 'graduated', category: 'Orch', subcategory: '', logoUrl: '', updatedAt: '' },
  { name: 'Envoy', slug: 'envoy', maturity: 'graduated', category: 'Net', subcategory: '', logoUrl: '', updatedAt: '' },
  { name: 'Sandbox1', slug: 'sandbox1', maturity: 'sandbox', category: 'Test', subcategory: '', logoUrl: '', updatedAt: '' },
  { name: 'Incub1', slug: 'incub1', maturity: 'incubating', category: 'Test', subcategory: '', logoUrl: '', updatedAt: '' },
  { name: 'Arch1', slug: 'arch1', maturity: 'archived', category: 'Test', subcategory: '', logoUrl: '', updatedAt: '' },
];

describe('filterByTab', () => {
  it('everyone excludes archived', () => {
    const result = filterByTab(projects, 'everyone');
    expect(result.some(p => p.maturity === 'archived')).toBe(false);
    expect(result.length).toBe(4);
  });

  it('graduated shows only graduated', () => {
    const result = filterByTab(projects, 'graduated');
    expect(result.every(p => p.maturity === 'graduated')).toBe(true);
    expect(result.length).toBe(2);
  });

  it('archived shows only archived', () => {
    const result = filterByTab(projects, 'archived');
    expect(result.every(p => p.maturity === 'archived')).toBe(true);
  });
});
