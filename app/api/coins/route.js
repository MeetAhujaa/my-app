import { NextResponse } from "next/server"

export const maxDuration = 30

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const vs_currency = searchParams.get("vs_currency") || "usd"
  const order = searchParams.get("order") || "market_cap_desc"
  const per_page = searchParams.get("per_page") || "100"
  const page = searchParams.get("page") || "1"
  const sparkline = searchParams.get("sparkline") || "false"

  // CoinGecko Direct API Key
  const COINGECKO_API_KEY = "CG-eywktABdgPEh3xH1dYtaQFe2" // Your provided key

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&order=${order}&per_page=${per_page}&page=${page}&sparkline=${sparkline}&x_cg_demo_api_key=${COINGECKO_API_KEY}`,
      {
        next: { revalidate: 43200 }, // 12 hours
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`CoinGecko API error: Status ${response.status}, Message: ${errorText}`)
      return NextResponse.json(
        { error: `Failed to fetch coins from CoinGecko API: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in coins route handler:", error)
    return NextResponse.json({ error: "Internal server error while fetching coins." }, { status: 500 })
  }
}
