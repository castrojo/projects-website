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

export function renderCard(p: SafeProject): string {
  const color = MATURITY_COLORS[p.maturity] ?? '#8b949e';
  const label = p.maturity.charAt(0).toUpperCase() + p.maturity.slice(1);
  const name = escapeHtml(p.name);
  const desc = escapeHtml(p.description ?? '');
  const category = escapeHtml(p.category + (p.subcategory ? ' > ' + p.subcategory : ''));

  const stats: string[] = [];
  if (p.stars) stats.push(`${formatNumber(p.stars)} stars`);
  if (p.contributors) stats.push(`${formatNumber(p.contributors)} contributors`);

  const links: string[] = [];
  if (p.repoUrl) links.push(`<a class="card-link" href="${escapeHtml(p.repoUrl)}" target="_blank" rel="noopener">GitHub</a>`);
  if (p.homepageUrl) links.push(`<a class="card-link" href="${escapeHtml(p.homepageUrl)}" target="_blank" rel="noopener">Website</a>`);
  if (p.devStatsUrl) links.push(`<a class="card-link" href="${escapeHtml(p.devStatsUrl)}" target="_blank" rel="noopener">DevStats</a>`);
  if (p.slackUrl) links.push(`<a class="card-link" href="${escapeHtml(p.slackUrl)}" target="_blank" rel="noopener">Slack</a>`);

  const updated = p.updatedAt ? `<div class="card-updated">Updated ${formatDate(p.updatedAt)}</div>` : '';

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
      ${p.logoUrl ? `<img class="card-logo" src="${escapeHtml(p.logoUrl)}" alt="${name} logo" width="40" height="40" loading="lazy" style="width:40px;height:40px;object-fit:contain" />` : ''}
    </div>
    <div class="card-body">
      <h3 class="card-name">${name}</h3>
      ${desc ? `<p class="card-description">${desc}</p>` : ''}
      ${stats.length ? `<div class="card-stats">${stats.map(s => `<span>${escapeHtml(s)}</span>`).join('')}</div>` : ''}
      <div class="card-category">${category}</div>
      ${links.length ? `<div class="card-links">${links.join('')}</div>` : ''}
    </div>
    ${updated}
  </article>`;
}

export function renderCards(projects: SafeProject[]): string {
  return projects.map(renderCard).join('\n');
}
