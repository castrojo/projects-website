import type { ChangelogEvent } from './tabs';

const EVENT_COLORS: Record<string, string> = {
  accepted:   '#00A86B',
  promoted:   '#FFB300',
  archived:   '#6b7280',
  updated:    '#0086FF',
  removed:    '#ef4444',
  newsletter: '#1a202c',
};

const EVENT_LABELS: Record<string, string> = {
  accepted:   'Accepted',
  promoted:   'Promoted',
  archived:   'Archived',
  updated:    'Updated',
  removed:    'Removed',
  newsletter: 'Newsletter',
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function formatRelativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

const MATURITY_COLORS: Record<string, string> = {
  graduated: '#FFB300',
  incubating: '#0086FF',
  sandbox: '#8b949e',
  archived: '#6b7280',
};

export function renderChangelogEvent(event: ChangelogEvent): string {
  const color = EVENT_COLORS[event.type] ?? '#8b949e';
  const label = EVENT_LABELS[event.type] ?? event.type;
  const maturityColor = event.maturity ? (MATURITY_COLORS[event.maturity] ?? '#8b949e') : color;
  const name = escapeHtml(event.projectName ?? event.lwcnTitle ?? '');
  const desc = escapeHtml(event.description ?? '');
  const timeAgo = event.timestamp ? formatRelativeDate(event.timestamp) : '';

  const logoHtml = event.logoUrl
    ? `<img src="${escapeHtml(event.logoUrl)}" alt="${name} logo" width="48" height="48" loading="lazy" style="width:48px;height:48px;object-fit:contain;flex-shrink:0" />`
    : `<div style="width:48px;height:48px;background:${color}22;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="font-size:1.25rem;color:${color}">${name[0] ?? '?'}</span></div>`;

  const maturityBadge = event.maturity
    ? `<span style="font-size:0.65rem;font-weight:600;text-transform:uppercase;background:${maturityColor};color:#fff;padding:0.1rem 0.35rem;border-radius:3px">${escapeHtml(event.maturity)}</span>`
    : '';

  const oldMaturityNote = event.oldMaturity
    ? `<span style="font-size:0.75rem;color:var(--color-text-muted)">from ${escapeHtml(event.oldMaturity)}</span>`
    : '';

  return `<article class="changelog-event-card" style="--event-color:${color};display:flex;flex-direction:row;gap:1rem;align-items:flex-start;padding:1rem;border-left:4px solid ${color};border-radius:0 8px 8px 0;background:var(--color-bg-secondary);margin-bottom:0.5rem" data-slug="${escapeHtml(event.projectSlug ?? '')}" data-type="${escapeHtml(event.type)}">
  ${logoHtml}
  <div style="flex:1;min-width:0">
    <div style="display:flex;align-items:flex-start;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.375rem">
      <span style="font-size:0.65rem;font-weight:700;text-transform:uppercase;background:${color};color:#fff;padding:0.15rem 0.4rem;border-radius:3px">${label}</span>
      ${maturityBadge}
      ${oldMaturityNote}
    </div>
    <div style="font-weight:600;font-size:0.9375rem;margin-bottom:0.25rem">${name}</div>
    ${desc ? `<p style="margin:0 0 0.375rem;font-size:0.875rem;color:var(--color-text-secondary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${desc}</p>` : ''}
    <div style="font-size:0.8rem;color:var(--color-text-muted)">${timeAgo}</div>
  </div>
</article>`;
}

export function renderNewsletterItem(event: ChangelogEvent): string {
  const title = escapeHtml(event.lwcnTitle ?? 'Last Week in Cloud Native');
  const link = escapeHtml(event.lwcnIssueUrl ?? 'https://lwcn.dev/newsletter/');
  const desc = escapeHtml(event.description ?? '');
  const timeAgo = event.timestamp ? formatRelativeDate(event.timestamp) : '';
  const color = '#1a202c';

  const chipsHtml = (event.mentionedProjects ?? []).length > 0
    ? `<div style="display:flex;flex-wrap:wrap;gap:0.25rem;margin:0.375rem 0">
        ${(event.mentionedProjects ?? []).map(p => {
          const chipColor = MATURITY_COLORS[p.maturity] ?? '#8b949e';
          return `<span class="mentioned-chip" style="display:inline-flex;align-items:center;gap:0.25rem;font-size:0.7rem;padding:0.15rem 0.5rem;border:1px solid ${chipColor};border-radius:12px;color:var(--color-text-secondary)">
            <img src="${escapeHtml(p.logoUrl)}" alt="${escapeHtml(p.name)}" width="12" height="12" style="width:12px;height:12px;object-fit:contain" />
            ${escapeHtml(p.name)}
          </span>`;
        }).join('')}
      </div>`
    : '';

  return `<article class="newsletter-card" style="display:flex;flex-direction:row;gap:1rem;align-items:flex-start;padding:1rem;border-left:4px solid ${color};border-radius:0 8px 8px 0;background:color-mix(in srgb,${color} 5%,var(--color-bg-secondary));margin-bottom:0.5rem" data-type="newsletter">
  <img src="${escapeHtml(event.logoUrl)}" alt="LWCN logo" width="48" height="48" loading="lazy" style="width:48px;height:48px;object-fit:contain;flex-shrink:0" />
  <div style="flex:1;min-width:0">
    <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.375rem">
      <span style="font-size:0.65rem;font-weight:700;text-transform:uppercase;background:${color};color:#fff;padding:0.15rem 0.4rem;border-radius:3px">Newsletter</span>
    </div>
    <div style="font-weight:600;font-size:0.9375rem;margin-bottom:0.25rem">${title}</div>
    ${desc ? `<p style="margin:0 0 0.25rem;font-size:0.875rem;color:var(--color-text-secondary)">${desc}</p>` : ''}
    ${chipsHtml}
    <div style="display:flex;align-items:center;gap:1rem;font-size:0.8rem;color:var(--color-text-muted);margin-top:0.25rem">
      <span>${timeAgo}</span>
      <a href="${link}" target="_blank" rel="noopener" style="color:var(--color-accent-emphasis);text-decoration:none;font-weight:500">Read issue →</a>
    </div>
  </div>
</article>`;
}
