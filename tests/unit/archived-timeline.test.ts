import { describe, it, expect } from 'vitest';
import { renderTimeline } from '../../src/lib/archived-timeline';
import type { SafeProject } from '../../src/lib/project-renderer';

const archived: SafeProject[] = [
  { name: 'OldProject', slug: 'old-project', maturity: 'archived', archivedDate: '2024-06-01', category: 'Test', subcategory: '', logoUrl: '', updatedAt: '' },
  { name: 'OlderProject', slug: 'older-project', maturity: 'archived', archivedDate: '2023-03-15', category: 'Test', subcategory: '', logoUrl: '', updatedAt: '' },
];

describe('renderTimeline', () => {
  it('sorts by archived date descending', () => {
    const html = renderTimeline(archived);
    const idx2024 = html.indexOf('OldProject');
    const idx2023 = html.indexOf('OlderProject');
    expect(idx2024).toBeLessThan(idx2023);
  });

  it('shows year markers', () => {
    const html = renderTimeline(archived);
    expect(html).toContain('2024');
    expect(html).toContain('2023');
  });

  it('returns empty state for no archived', () => {
    const html = renderTimeline([]);
    expect(html).toContain('No archived');
  });
});
