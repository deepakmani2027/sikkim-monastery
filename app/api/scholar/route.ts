import { NextResponse } from "next/server"

// Proxies Google Scholar queries via SerpAPI
// Requires SERPAPI_KEY in environment

const SERPAPI_ENDPOINT = "https://serpapi.com/search"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get("q") || undefined
  const cites = url.searchParams.get("cites") || undefined
  const as_ylo = url.searchParams.get("as_ylo") || undefined
  const as_yhi = url.searchParams.get("as_yhi") || undefined
  const scisbd = url.searchParams.get("scisbd") || undefined
  const cluster = url.searchParams.get("cluster") || undefined

  const key = process.env.SERPAPI_KEY
  if (!key) {
    return NextResponse.json({ error: "Missing SERPAPI_KEY" }, { status: 500 })
  }

  const params = new URLSearchParams()
  params.set("engine", "google_scholar")
  params.set("api_key", key)
  if (q) params.set("q", q)
  if (cites) params.set("cites", cites)
  if (as_ylo) params.set("as_ylo", as_ylo)
  if (as_yhi) params.set("as_yhi", as_yhi)
  if (scisbd) params.set("scisbd", scisbd)
  if (cluster) params.set("cluster", cluster)

  try {
    const resp = await fetch(`${SERPAPI_ENDPOINT}?${params.toString()}`, {
      method: "GET",
      headers: { "Accept": "application/json" },
      // Avoid caching scholarly queries
      cache: "no-store",
    })
    const data = await resp.json()
    if (!resp.ok) {
      return NextResponse.json({ error: data?.error || `SerpAPI ${resp.status}` }, { status: 502 })
    }

    // Normalize a minimal shape for the client while keeping raw for power users
    const results = Array.isArray(data?.organic_results) ? data.organic_results : []
    const normalized = results.map((r: any) => ({
      title: r.title,
      link: r.link,
      snippet: r.snippet,
      publication_info: r.publication_info,
      authors: r.publication_info?.authors || [],
      year: r.publication_info?.year,
      cited_by: r.inline_links?.cited_by?.total,
      cited_by_link: r.inline_links?.cited_by?.serpapi_scholar_link,
      pdf: r.resources?.find((x: any) => x?.file_format === "PDF")?.link,
    }))

    return NextResponse.json({ normalized, raw: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to query SerpAPI" }, { status: 500 })
  }
}


