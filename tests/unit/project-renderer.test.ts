import { describe, it, expect } from 'vitest';
import { renderCard, type SafeProject } from '../../src/lib/project-renderer';

const base: SafeProject = {
  name: 'Kubernetes',
  slug: 'kubernetes',
  description: 'Production-grade container orchestration',
  maturity: 'graduated',
  category: 'Orchestration & Management',
  subcategory: 'Scheduling & Orchestration',
  logoUrl: 'https://example.com/k8s.svg',
  stars: 110000,
  contributors: 3000,
  updatedAt: '2024-01-01',
};

describe('renderCard', () => {
  it('renders graduated card with gold badge', () => {
    const html = renderCard(base);
    expect(html).toContain('data-maturity="graduated"');
    expect(html).toContain('#FFB300');
    expect(html).toContain('Kubernetes');
  });

  it('renders sandbox card with gray badge', () => {
    const html = renderCard({ ...base, maturity: 'sandbox', name: 'MySandbox', slug: 'mysandbox' });
    expect(html).toContain('#8b949e');
    expect(html).toContain('Sandbox');
  });

  it('renders stars and contributors with icons', () => {
    const html = renderCard(base);
    expect(html).toContain('stat-item');
    expect(html).toContain('110.0k');
    expect(html).toContain('3.0k');
  });

  it('escapes XSS in name', () => {
    const html = renderCard({ ...base, name: '<script>alert(1)</script>', slug: 'xss' });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('handles missing optional fields gracefully', () => {
    const html = renderCard({ name: 'Minimal', slug: 'minimal', maturity: 'sandbox', category: 'Test', subcategory: '', logoUrl: '', updatedAt: '' });
    expect(html).toContain('Minimal');
  });

  it('renders language and license tags', () => {
    const html = renderCard({ ...base, primaryLanguage: 'Go', license: 'Apache-2.0' });
    expect(html).toContain('tag-language');
    expect(html).toContain('Go');
    expect(html).toContain('tag-license');
    expect(html).toContain('Apache-2.0');
  });

  it('renders topic tags up to 3', () => {
    const html = renderCard({ ...base, topics: ['cloud', 'containers', 'orchestration', 'extra'] });
    expect(html).toContain('topic-tag');
    expect(html).toContain('cloud');
    expect(html).toContain('orchestration');
    expect(html).not.toContain('extra');
  });

  it('renders audit badge when audited', () => {
    const html = renderCard({ ...base, lastAuditDate: '2024-06-01', lastAuditVendor: 'Trail of Bits' });
    expect(html).toContain('audit-badge');
    expect(html).toContain('Audited');
    expect(html).toContain('Trail of Bits');
  });

  it('renders activity info', () => {
    const html = renderCard({ ...base, lastCommitDate: '2024-12-01', lastReleaseDate: '2024-11-15' });
    expect(html).toContain('card-activity');
    expect(html).toContain('activity-item');
  });

  it('renders blog and twitter links', () => {
    const html = renderCard({ ...base, blogUrl: 'https://blog.example.com', twitterUrl: 'https://twitter.com/k8s' });
    expect(html).toContain('Blog');
    expect(html).toContain('Twitter');
  });
});
