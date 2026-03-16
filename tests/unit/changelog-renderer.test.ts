import { describe, it, expect } from 'vitest';
import { renderChangelogEvent, renderNewsletterItem } from '../../src/lib/changelog-renderer';
import type { ChangelogEvent } from '../../src/lib/tabs';

const base: ChangelogEvent = {
  id: 'test-1',
  type: 'accepted',
  projectName: 'Kubernetes',
  projectSlug: 'kubernetes',
  logoUrl: 'https://example.com/k8s.svg',
  maturity: 'graduated',
  timestamp: '2024-01-01T00:00:00Z',
  description: 'Kubernetes was accepted as a CNCF project.',
};

describe('renderChangelogEvent', () => {
  it('renders a changelog event card with the changelog-event-card class', () => {
    const html = renderChangelogEvent(base);
    expect(html).toContain('changelog-event-card');
  });

  it('renders the project name', () => {
    const html = renderChangelogEvent(base);
    expect(html).toContain('Kubernetes');
  });

  it('renders the event type badge', () => {
    const html = renderChangelogEvent(base);
    expect(html).toContain('accepted');
  });

  it('renders the logo image', () => {
    const html = renderChangelogEvent(base);
    expect(html).toContain('https://example.com/k8s.svg');
  });

  it('renders promoted event with both old and new maturity', () => {
    const promoted: ChangelogEvent = {
      ...base,
      id: 'test-2',
      type: 'promoted',
      maturity: 'graduated',
      oldMaturity: 'incubating',
      description: 'Kubernetes was promoted from incubating to graduated.',
    };
    const html = renderChangelogEvent(promoted);
    expect(html).toContain('promoted');
    expect(html).toContain('graduated');
  });

  it('renders removed event', () => {
    const removed: ChangelogEvent = { ...base, id: 'test-3', type: 'removed', description: 'Project removed.' };
    const html = renderChangelogEvent(removed);
    expect(html).toContain('removed');
  });
});

describe('renderNewsletterItem', () => {
  const newsletter: ChangelogEvent = {
    id: 'lwcn-1',
    type: 'newsletter',
    logoUrl: 'https://lwcn.dev/images/logo.svg',
    timestamp: '2024-01-08T00:00:00Z',
    description: 'This week: 52 releases, 200 news items.',
    lwcnTitle: 'Week 1 - January 2024',
    lwcnIssueUrl: 'https://lwcn.dev/newsletter/2024-week-1/',
  };

  it('renders a newsletter card with the newsletter-card class', () => {
    const html = renderNewsletterItem(newsletter);
    expect(html).toContain('newsletter-card');
  });

  it('renders the Newsletter badge', () => {
    const html = renderNewsletterItem(newsletter);
    expect(html).toContain('Newsletter');
  });

  it('renders the issue title', () => {
    const html = renderNewsletterItem(newsletter);
    expect(html).toContain('Week 1 - January 2024');
  });

  it('renders the LWCN logo', () => {
    const html = renderNewsletterItem(newsletter);
    expect(html).toContain('https://lwcn.dev/images/logo.svg');
  });

  it('renders a link to the issue', () => {
    const html = renderNewsletterItem(newsletter);
    expect(html).toContain('https://lwcn.dev/newsletter/2024-week-1/');
  });

  it('renders mentioned project chips when provided', () => {
    const withMentions: ChangelogEvent = {
      ...newsletter,
      mentionedProjects: [
        { name: 'Kubernetes', slug: 'kubernetes', logoUrl: 'https://k8s.io/logo.svg', maturity: 'graduated' },
      ],
    };
    const html = renderNewsletterItem(withMentions);
    expect(html).toContain('mentioned-chip');
    expect(html).toContain('Kubernetes');
  });
});
