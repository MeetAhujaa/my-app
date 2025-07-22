import { NextResponse } from "next/server"

export const maxDuration = 30

export async function GET() {
  // CoinGecko Direct API Key
  const COINGECKO_API_KEY = "CG-eywktABdgPEh3xH1dYtaQFe2" // Your provided key

  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/global?x_cg_demo_api_key=${COINGECKO_API_KEY}`, {
      next: { revalidate: 86400 }, // 24 hours
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`CoinGecko API error: Status ${response.status}, Message: ${errorText}`)
      return NextResponse.json(
        { error: `Failed to fetch global market data from CoinGecko API: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data.data)
  } catch (error) {
    console.error("Error in global-market route handler:", error)
    return NextResponse.json({ error: "Internal server error while fetching global market data." }, { status: 500 })
  }
}
