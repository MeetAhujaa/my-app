import { NextResponse } from "next/server"

export const maxDuration = 30

export async function GET(request, { params }) {
  const { coinId } = params
  const { searchParams } = new URL(request.url)
  const vs_currency = searchParams.get("vs_currency") || "usd"
  const days = searchParams.get("days") || "7"

  // CoinGecko Direct API Key
  const COINGECKO_API_KEY = "CG-eywktABdgPEh3xH1dYtaQFe2" // Your provided key

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vs_currency}&days=${days}&x_cg_demo_api_key=${COINGECKO_API_KEY}`,
      {
        next: { revalidate: 43200 }, // 12 hours
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`CoinGecko API error for ${coinId}: Status ${response.status}, Message: ${errorText}`)
      return NextResponse.json(
        { error: `Failed to fetch historical data for ${coinId} from CoinGecko API: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error in coin-history route handler for ${coinId}:`, error)
    return NextResponse.json({ error: "Internal server error while fetching historical coin data." }, { status: 500 })
  }
}
