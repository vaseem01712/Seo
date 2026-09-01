# Signal — SEO Intelligence

Ek real SEO audit tool: koi bhi URL daalo, crawler internal pages scan karta hai aur
Technical SEO, On-Page SEO, Performance aur AI Visibility ke saare signals ek premium
dashboard mein dikhata hai.

## Setup

```bash
npm install
npm run dev
```

Phir browser mein **http://localhost:3000** kholo.

## Kaise kaam karta hai

1. Top bar mein URL daalo (e.g. `example.com`), crawl settings se max pages set karo (1–50).
2. **Start Audit** dabao — server-side crawler (`/api/audit`) same-origin links follow karke
   pages fetch karta hai, HTML parse karta hai (cheerio se), aur har page ke liye SEO
   issues nikaal ta hai.
3. Sidebar ke tabs:
   - **Overview** — signal-strength gauge, category scores, top issues
   - **Performance** — response time, page weight
   - **Technical SEO** — robots.txt, sitemap.xml, HTTPS, canonical, status codes
   - **On-Page SEO** — title/meta description/H1/word count/alt text per page
   - **Opportunities** — sabse zyada impact wale fixes, grouped + prioritized
   - **AI Visibility** — llms.txt, structured data (JSON-LD), AI bot access (GPTBot etc.)
   - **Competitors** — koi bhi competitor URL daalke score compare karo
   - **Reports** — pura audit JSON ya issues CSV mein export karo

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (custom "signal" design tokens — ink navy + amber accent)
- cheerio for server-side HTML parsing
- lucide-react for icons

Sab kuch real crawl data pe based hai — koi fake/mock numbers nahi.

## Deploy

Vercel pe seedha deploy ho jaayega (`vercel deploy`), koi extra env variable ki zaroorat nahi.
