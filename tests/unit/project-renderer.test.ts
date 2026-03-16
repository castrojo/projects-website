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

  it('renders stars and contributors', () => {
    const html = renderCard(base);
    expect(html).toContain('110.0k stars');
    expect(html).toContain('3.0k contributors');
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
});
