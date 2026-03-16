import type { SafeProject } from './project-renderer';

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch { return iso; }
}

function getYear(iso: string): string {
  return iso ? iso.slice(0, 4) : 'Unknown';
}

export function renderTimeline(archived: SafeProject[]): string {
  const sorted = [...archived].sort((a, b) =>
    (b.archivedDate ?? '') > (a.archivedDate ?? '') ? 1 : -1
  );

  if (!sorted.length) return '<p class="empty-state">No archived projects yet.</p>';

  let html = '<div class="timeline-container">';
  let currentYear = '';

  for (const p of sorted) {
    const year = getYear(p.archivedDate ?? '');
    if (year !== currentYear) {
      currentYear = year;
      html += `<div class="timeline-year">${escapeHtml(year)}</div>`;
    }
    const date = p.archivedDate ? formatDate(p.archivedDate) : 'Date unknown';
    html += `
      <div class="timeline-item" data-slug="${escapeHtml(p.slug)}">
        <div class="timeline-card">
          <div class="timeline-date">${date}</div>
          <div style="display:flex;gap:0.75rem;align-items:center">
            ${p.logoUrl ? `<img src="${escapeHtml(p.logoUrl)}" alt="${escapeHtml(p.name)} logo" width="48" height="48" loading="lazy" style="width:48px;height:48px;object-fit:contain" />` : ''}
            <div>
              <h3 style="margin:0 0 0.25rem;font-size:1rem">${escapeHtml(p.name)}</h3>
              ${p.description ? `<p style="margin:0;font-size:0.8125rem;color:var(--color-text-secondary)">${escapeHtml(p.description)}</p>` : ''}
            </div>
          </div>
        </div>
      </div>`;
  }

  html += '</div>';
  return html;
}
