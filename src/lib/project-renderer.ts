export interface SafeProject {
  name: string;
  slug: string;
  description?: string;
  homepageUrl?: string;
  repoUrl?: string;
  logoUrl: string;
  maturity: string;
  category: string;
  subcategory: string;
  twitterUrl?: string;
  acceptedDate?: string;
  incubatingDate?: string;
  graduatedDate?: string;
  archivedDate?: string;
  devStatsUrl?: string;
  blogUrl?: string;
  slackUrl?: string;
  stars?: number;
  contributors?: number;
  lastCommitDate?: string;
  lastReleaseDate?: string;
  license?: string;
  primaryLanguage?: string;
  topics?: string[];
  lastAuditDate?: string;
  lastAuditVendor?: string;
  updatedAt: string;
}

const MATURITY_COLORS: Record<string, string> = {
  graduated: '#FFB300',
  incubating: '#0086FF',
  sandbox: '#8b949e',
  archived: '#6b7280',
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function formatRelativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function renderCard(p: SafeProject): string {
  const color = MATURITY_COLORS[p.maturity] ?? '#8b949e';
  const label = p.maturity.charAt(0).toUpperCase() + p.maturity.slice(1);
  const name = escapeHtml(p.name);
  const desc = escapeHtml(p.description ?? '');
  const category = escapeHtml(p.category + (p.subcategory ? ' > ' + p.subcategory : ''));

  const statsHtml = (p.stars || p.contributors) ? `<div class="card-stats">${
    p.stars ? `<span class="stat-item" title="GitHub Stars"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/></svg> ${formatNumber(p.stars)}</span>` : ''
  }${
    p.contributors ? `<span class="stat-item" title="Contributors"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4.001 4.001 0 0 0-6.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.4.974.75.75 0 0 1-.974-.4 3.51 3.51 0 0 0-2.522-2.372.75.75 0 0 1-.22-1.228 1.5 1.5 0 1 0-1.114-2.496.75.75 0 0 1-.559-1.394A3 3 0 0 1 11 4Z"/></svg> ${formatNumber(p.contributors)}</span>` : ''
  }</div>` : '';

  const tagsHtml = (p.primaryLanguage || p.license) ? `<div class="card-tags">${
    p.primaryLanguage ? `<span class="tag tag-language">${escapeHtml(p.primaryLanguage)}</span>` : ''
  }${
    p.license ? `<span class="tag tag-license">${escapeHtml(p.license)}</span>` : ''
  }</div>` : '';

  const topicsHtml = p.topics?.length ? `<div class="card-topics">${p.topics.slice(0, 3).map(t => `<span class="topic-tag">${escapeHtml(t)}</span>`).join('')}</div>` : '';

  const auditHtml = p.lastAuditDate ? `<span class="audit-badge" title="Last audit: ${escapeHtml(p.lastAuditDate)}${p.lastAuditVendor ? ' by ' + escapeHtml(p.lastAuditVendor) : ''}">Audited</span>` : '';

  const activityHtml = (p.lastCommitDate || p.lastReleaseDate) ? `<div class="card-activity">${
    p.lastCommitDate ? `<span class="activity-item" title="Last commit">${formatRelativeDate(p.lastCommitDate)}</span>` : ''
  }${
    p.lastReleaseDate ? `<span class="activity-item" title="Last release">Release: ${formatDate(p.lastReleaseDate)}</span>` : ''
  }</div>` : '';

  const links: string[] = [];
  if (p.repoUrl) links.push(`<a class="card-link" href="${escapeHtml(p.repoUrl)}" target="_blank" rel="noopener">GitHub</a>`);
  if (p.homepageUrl) links.push(`<a class="card-link" href="${escapeHtml(p.homepageUrl)}" target="_blank" rel="noopener">Website</a>`);
  if (p.devStatsUrl) links.push(`<a class="card-link" href="${escapeHtml(p.devStatsUrl)}" target="_blank" rel="noopener">DevStats</a>`);
  if (p.slackUrl) links.push(`<a class="card-link" href="${escapeHtml(p.slackUrl)}" target="_blank" rel="noopener">Slack</a>`);
  if (p.blogUrl) links.push(`<a class="card-link" href="${escapeHtml(p.blogUrl)}" target="_blank" rel="noopener">Blog</a>`);
  if (p.twitterUrl) links.push(`<a class="card-link" href="${escapeHtml(p.twitterUrl)}" target="_blank" rel="noopener">Twitter</a>`);

  return `<article
    class="project-card"
    style="--card-accent: ${color}"
    data-maturity="${escapeHtml(p.maturity)}"
    data-slug="${escapeHtml(p.slug)}"
    data-name="${name.toLowerCase()}"
    data-category="${escapeHtml(p.category.toLowerCase())}"
  >
    <div class="card-header">
      <span class="maturity-badge" style="background: ${color}">${label}</span>
      ${auditHtml}
      ${p.logoUrl ? `<img class="card-logo" src="${escapeHtml(p.logoUrl)}" alt="${name} logo" width="40" height="40" loading="lazy" style="width:40px;height:40px;object-fit:contain" />` : ''}
    </div>
    <div class="card-body">
      <h3 class="card-name">${name}</h3>
      ${desc ? `<p class="card-description">${desc}</p>` : ''}
      ${tagsHtml}
      ${topicsHtml}
      ${statsHtml}
      <div class="card-category">${category}</div>
      ${activityHtml}
      ${links.length ? `<div class="card-links">${links.join('')}</div>` : ''}
    </div>
  </article>`;
}

export function renderCards(projects: SafeProject[]): string {
  return projects.map(renderCard).join('\n');
}
