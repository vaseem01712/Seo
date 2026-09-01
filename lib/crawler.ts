import { analyzePage, extractInternalLinks } from "./analyzer";
import type { AuditResult, DomainChecks, Issue, PageAudit, ScoreBreakdown } from "./types";

const FETCH_TIMEOUT_MS = 5000;
const USER_AGENT = "SignalSEOBot/1.0 (+https://signal.seo)";

async function timedFetch(url: string): Promise<{ res: Response | null; timeMs: number; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    });
    return { res, timeMs: Date.now() - start };
  } catch (e: any) {
    return { res: null, timeMs: Date.now() - start, error: e?.message || "fetch failed" };
  } finally {
    clearTimeout(timer);
  }
}

async function checkRobotsTxt(origin: string): Promise<DomainChecks["robotsTxt"]> {
  try {
    const { res } = await timedFetch(`${origin}/robots.txt`);
    if (!res || !res.ok) return { exists: false, disallowsAll: false, blocksAiBots: [] };
    const text = await res.text();
    const disallowsAll = /User-agent:\s*\*[\s\S]{0,50}?Disallow:\s*\/\s*(\n|$)/i.test(text);
    const aiBots = ["GPTBot", "Google-Extended", "CCBot", "ClaudeBot", "anthropic-ai", "PerplexityBot"];
    const blocksAiBots = aiBots.filter((bot) => {
      const re = new RegExp(`User-agent:\\s*${bot}[\\s\\S]{0,60}?Disallow:\\s*/`, "i");
      return re.test(text);
    });
    return { exists: true, disallowsAll, blocksAiBots };
  } catch {
    return { exists: false, disallowsAll: false, blocksAiBots: [] };
  }
}

async function checkSitemap(origin: string): Promise<DomainChecks["sitemapXml"]> {
  try {
    const { res } = await timedFetch(`${origin}/sitemap.xml`);
    if (!res || !res.ok) return { exists: false, urlCount: 0 };
    const text = await res.text();
    const urlCount = (text.match(/<loc>/g) || []).length;
    return { exists: true, urlCount };
  } catch {
    return { exists: false, urlCount: 0 };
  }
}

async function checkLlmsTxt(origin: string): Promise<DomainChecks["llmsTxt"]> {
  try {
    const { res } = await timedFetch(`${origin}/llms.txt`);
    return { exists: !!res && res.ok };
  } catch {
    return { exists: false };
  }
}

export async function runAudit(startUrl: string, maxPages: number): Promise<AuditResult> {
  const crawlStart = Date.now();
  const normalizedStart = normalizeUrl(startUrl);
  const origin = new URL(normalizedStart).origin;

  // These checks are independent, so run them together.
  const [robotsTxt, sitemapXml, llmsTxt] = await Promise.all([
    checkRobotsTxt(origin),
    checkSitemap(origin),
    checkLlmsTxt(origin),
  ]);

  const domainChecks: DomainChecks = {
    robotsTxt,
    sitemapXml,
    llmsTxt,
    https: normalizedStart.startsWith("https://"),
  };

  const cap = Math.min(Math.max(maxPages, 1), 50);
  const visited = new Set<string>();
  const queued = new Set<string>([normalizedStart]);
  const queue: string[] = [normalizedStart];
  const pages: PageAudit[] = [];

  // Parallel crawling is dramatically faster than waiting for each URL one-by-one.
  // Keep concurrency modest so the audited site is not hammered.
  const CONCURRENCY = Math.min(8, cap);

  while (queue.length > 0 && pages.length < cap) {
    const batch = queue.splice(0, Math.min(CONCURRENCY, cap - pages.length));
    batch.forEach((u) => visited.add(u));

    const results = await Promise.all(batch.map(async (url) => {
      const { res, timeMs } = await timedFetch(url);
      if (!res) {
        return {
          page: analyzePage({ url, html: "<html><head></head><body></body></html>", statusCode: 0, responseTimeMs: timeMs, sizeBytes: 0 }),
          links: [] as string[],
        };
      }

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) return { page: null, links: [] as string[] };

      const html = await res.text();
      const sizeBytes = new TextEncoder().encode(html).length;
      const page = analyzePage({ url, html, statusCode: res.status, responseTimeMs: timeMs, sizeBytes });
      const links = res.status < 400 ? extractInternalLinks(html, url) : [];
      return { page, links };
    }));

    for (const { page, links } of results) {
      if (!page) continue;
      pages.push(page);
      if (pages.length >= cap) break;
      for (const link of links) {
        if (!visited.has(link) && !queued.has(link) && queue.length + pages.length < cap * 2) {
          queued.add(link);
          queue.push(link);
        }
      }
    }
  }

  const allIssues: Issue[] = pages.flatMap((p) => p.issues);
  const score = computeScoreBreakdown(pages, allIssues, domainChecks);
  const summary = {
    totalPages: pages.length,
    critical: allIssues.filter((i) => i.severity === "critical").length,
    warning: allIssues.filter((i) => i.severity === "warning").length,
    info: allIssues.filter((i) => i.severity === "info").length,
  };

  return {
    rootUrl: normalizedStart,
    domain: origin,
    crawledAt: new Date().toISOString(),
    crawlDurationMs: Date.now() - crawlStart,
    pages,
    domainChecks,
    score,
    issues: allIssues,
    summary,
  };
}

function computeScoreBreakdown(pages: PageAudit[], issues: Issue[], domainChecks: DomainChecks): ScoreBreakdown {
  const catScore = (category: Issue["category"]) => {
    const relevant = issues.filter((i) => i.category === category);
    let score = 100;
    for (const i of relevant) {
      if (i.severity === "critical") score -= 12;
      else if (i.severity === "warning") score -= 6;
      else score -= 2;
    }
    return Math.max(0, Math.round(score));
  };

  let ai = catScore("ai");
  if (!domainChecks.llmsTxt.exists) ai = Math.max(0, ai - 5);
  if (domainChecks.robotsTxt.blocksAiBots.length > 0) ai = Math.max(0, ai - 10);

  let technical = catScore("technical");
  if (!domainChecks.robotsTxt.exists) technical = Math.max(0, technical - 8);
  if (!domainChecks.sitemapXml.exists) technical = Math.max(0, technical - 8);
  if (!domainChecks.https) technical = Math.max(0, technical - 15);

  const onpage = catScore("onpage");
  const performance = catScore("performance");

  const overall = pages.length
    ? Math.round(pages.reduce((sum, p) => sum + p.score, 0) / pages.length)
    : 0;

  return { overall, technical, onpage, performance, ai };
}

export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  const parsed = new URL(url);
  parsed.hash = "";
  return parsed.toString();
}
