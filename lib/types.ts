export type Severity = "critical" | "warning" | "info";
export type IssueCategory = "technical" | "onpage" | "performance" | "ai";

export interface Issue {
  id: string;
  severity: Severity;
  category: IssueCategory;
  title: string;
  description: string;
  url: string;
}

export interface PageAudit {
  url: string;
  statusCode: number;
  ok: boolean;
  responseTimeMs: number;
  sizeBytes: number;
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  canonical: string | null;
  metaRobots: string | null;
  h1: string[];
  h2Count: number;
  wordCount: number;
  imagesTotal: number;
  imagesMissingAlt: number;
  internalLinksCount: number;
  externalLinksCount: number;
  hasJsonLd: boolean;
  jsonLdTypes: string[];
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  lang: string | null;
  hasViewport: boolean;
  isHttps: boolean;
  issues: Issue[];
  score: number;
}

export interface DomainChecks {
  robotsTxt: { exists: boolean; disallowsAll: boolean; blocksAiBots: string[] };
  sitemapXml: { exists: boolean; urlCount: number };
  llmsTxt: { exists: boolean };
  https: boolean;
}

export interface ScoreBreakdown {
  overall: number;
  technical: number;
  onpage: number;
  performance: number;
  ai: number;
}

export interface AuditSummary {
  totalPages: number;
  critical: number;
  warning: number;
  info: number;
}

export interface AuditResult {
  rootUrl: string;
  domain: string;
  crawledAt: string;
  crawlDurationMs: number;
  pages: PageAudit[];
  domainChecks: DomainChecks;
  score: ScoreBreakdown;
  issues: Issue[];
  summary: AuditSummary;
}
