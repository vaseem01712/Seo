import * as cheerio from "cheerio";
import type { Issue, PageAudit } from "./types";

let issueCounter = 0;
function nextId() {
  issueCounter += 1;
  return `iss_${issueCounter}_${Date.now().toString(36)}`;
}

interface AnalyzeInput {
  url: string;
  html: string;
  statusCode: number;
  responseTimeMs: number;
  sizeBytes: number;
}

export function analyzePage({ url, html, statusCode, responseTimeMs, sizeBytes }: AnalyzeInput): PageAudit {
  const $ = cheerio.load(html);
  const issues: Issue[] = [];
  const isHttps = url.startsWith("https://");
  const origin = new URL(url).origin;

  const push = (severity: Issue["severity"], category: Issue["category"], title: string, description: string) => {
    issues.push({ id: nextId(), severity, category, title, description, url });
  };

  // Title
  const title = $("title").first().text().trim() || null;
  const titleLength = title?.length ?? 0;
  if (!title) {
    push("critical", "onpage", "Missing title tag", "This page has no <title>. Search engines rely on it for the clickable headline in results.");
  } else if (titleLength < 30) {
    push("warning", "onpage", "Title tag is too short", `Title is ${titleLength} characters. Aim for 30-60 to use the available space in search results.`);
  } else if (titleLength > 60) {
    push("warning", "onpage", "Title tag is too long", `Title is ${titleLength} characters and will likely be truncated in search results (limit ~60).`);
  }

  // Meta description
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || null;
  const metaDescriptionLength = metaDescription?.length ?? 0;
  if (!metaDescription) {
    push("critical", "onpage", "Missing meta description", "No meta description found. Search engines will auto-generate a snippet instead of your own copy.");
  } else if (metaDescriptionLength < 70) {
    push("info", "onpage", "Meta description is short", `Description is ${metaDescriptionLength} characters. 70-160 gives search engines more to work with.`);
  } else if (metaDescriptionLength > 160) {
    push("warning", "onpage", "Meta description is too long", `Description is ${metaDescriptionLength} characters and may be cut off (limit ~160).`);
  }

  // Canonical
  const canonical = $('link[rel="canonical"]').attr("href") || null;
  if (!canonical) {
    push("warning", "technical", "Missing canonical tag", "No canonical link found. Without it, duplicate or parameterized URLs can split ranking signals.");
  }

  // Meta robots
  const metaRobots = $('meta[name="robots"]').attr("content") || null;
  if (metaRobots && /noindex/i.test(metaRobots)) {
    push("critical", "technical", "Page is set to noindex", "This page's meta robots tag blocks it from search engine indexes.");
  }

  // Headings
  const h1 = $("h1").map((_, el) => $(el).text().trim()).get().filter(Boolean);
  if (h1.length === 0) {
    push("critical", "onpage", "Missing H1", "No H1 heading found. It's the clearest signal to readers and search engines of what the page is about.");
  } else if (h1.length > 1) {
    push("warning", "onpage", "Multiple H1 tags", `Found ${h1.length} H1 tags. Keep a single, clear H1 per page.`);
  }
  const h2Count = $("h2").length;

  // Word count
  const bodyText = $("body").clone().find("script,style,noscript").remove().end().text();
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  if (wordCount < 300) {
    push("info", "onpage", "Thin content", `This page has roughly ${wordCount} words. Thin pages often struggle to rank for competitive terms.`);
  }

  // Images
  const images = $("img");
  const imagesTotal = images.length;
  let imagesMissingAlt = 0;
  images.each((_, el) => {
    const alt = $(el).attr("alt");
    if (!alt || !alt.trim()) imagesMissingAlt += 1;
  });
  if (imagesMissingAlt > 0) {
    push("warning", "onpage", "Images missing alt text", `${imagesMissingAlt} of ${imagesTotal} images have no alt attribute, hurting accessibility and image search visibility.`);
  }

  // Links
  let internalLinksCount = 0;
  let externalLinksCount = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (/^(mailto:|tel:|javascript:|#)/i.test(href)) return;
    try {
      const resolved = new URL(href, url);
      if (resolved.origin === origin) internalLinksCount += 1;
      else externalLinksCount += 1;
    } catch {
      // ignore malformed
    }
  });

  // Structured data
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const hasJsonLd = jsonLdScripts.length > 0;
  const jsonLdTypes: string[] = [];
  jsonLdScripts.each((_, el) => {
    try {
      const parsed = JSON.parse($(el).contents().text());
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const t = item?.["@type"];
        if (typeof t === "string") jsonLdTypes.push(t);
        else if (Array.isArray(t)) jsonLdTypes.push(...t);
      }
    } catch {
      // malformed JSON-LD, ignore
    }
  });
  if (!hasJsonLd) {
    push("info", "ai", "No structured data", "No JSON-LD found. Schema markup helps search engines and AI systems understand and summarize this page accurately.");
  }

  // Open Graph / Twitter
  const hasOpenGraph = $('meta[property^="og:"]').length > 0;
  const hasTwitterCard = $('meta[name^="twitter:"]').length > 0;
  if (!hasOpenGraph) {
    push("info", "ai", "Missing Open Graph tags", "No Open Graph metadata found. This weakens how the page is represented when shared or summarized by AI assistants and social platforms.");
  }

  // Lang / viewport
  const lang = $("html").attr("lang") || null;
  if (!lang) {
    push("info", "technical", "Missing lang attribute", "The <html> tag has no lang attribute, which helps search engines and screen readers identify the page's language.");
  }
  const hasViewport = $('meta[name="viewport"]').length > 0;
  if (!hasViewport) {
    push("critical", "performance", "Missing viewport meta tag", "No responsive viewport tag found, which will hurt mobile usability and mobile search ranking.");
  }

  // HTTPS
  if (!isHttps) {
    push("critical", "technical", "Not served over HTTPS", "This page is served over HTTP. Browsers flag it as not secure and it's a confirmed ranking factor.");
  }

  // Status code
  if (statusCode >= 400) {
    push("critical", "technical", `Page returned status ${statusCode}`, "This URL is broken or inaccessible to crawlers.");
  } else if (statusCode >= 300) {
    push("warning", "technical", `Page returned a redirect (${statusCode})`, "Redirects add latency and can dilute link equity if chained.");
  }

  // Performance (approximate, based on response time & page weight)
  if (responseTimeMs > 1500) {
    push("warning", "performance", "Slow server response", `Time to first byte was ${responseTimeMs}ms. Aim for under 600ms.`);
  }
  if (sizeBytes > 1_500_000) {
    push("warning", "performance", "Large page weight", `HTML payload is ${(sizeBytes / 1024).toFixed(0)}KB. Heavy pages slow down rendering, especially on mobile.`);
  }

  const score = computePageScore(issues);

  return {
    url,
    statusCode,
    ok: statusCode < 400,
    responseTimeMs,
    sizeBytes,
    title,
    titleLength,
    metaDescription,
    metaDescriptionLength,
    canonical,
    metaRobots,
    h1,
    h2Count,
    wordCount,
    imagesTotal,
    imagesMissingAlt,
    internalLinksCount,
    externalLinksCount,
    hasJsonLd,
    jsonLdTypes: Array.from(new Set(jsonLdTypes)),
    hasOpenGraph,
    hasTwitterCard,
    lang,
    hasViewport,
    isHttps,
    issues,
    score,
  };
}

export function computePageScore(issues: Issue[]): number {
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === "critical") score -= 15;
    else if (issue.severity === "warning") score -= 7;
    else score -= 2;
  }
  return Math.max(0, Math.round(score));
}

export function extractInternalLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const origin = new URL(baseUrl).origin;
  const links = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (/^(mailto:|tel:|javascript:|#)/i.test(href)) return;
    try {
      const resolved = new URL(href, baseUrl);
      resolved.hash = "";
      if (resolved.origin === origin && /^https?:$/.test(resolved.protocol)) {
        links.add(resolved.toString());
      }
    } catch {
      // ignore
    }
  });
  return Array.from(links);
}
