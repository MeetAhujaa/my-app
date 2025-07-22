import { NextResponse } from "next/server"

export const maxDuration = 30

export async function GET(request, { params }) {
  const { coinId } = params

  // CoinGecko Direct API Key
  const COINGECKO_API_KEY = "CG-eywktABdgPEh3xH1dYtaQFe2" // Your provided key

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?x_cg_demo_api_key=${COINGECKO_API_KEY}`,
      {
        next: { revalidate: 300 }, // 5 minutes
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`CoinGecko API error for ${coinId}: Status ${response.status}, Message: ${errorText}`)
      return NextResponse.json(
        { error: `Failed to fetch coin detail for ${coinId} from CoinGecko API: ${response.statusText}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error(`Error in coin-detail route handler for ${coinId}:`, error)
    return NextResponse.json({ error: "Internal server error while fetching coin detail." }, { status: 500 })
  }
}
