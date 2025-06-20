import { NextRequest, NextResponse } from "next/server";
import { createClient } from "pexels";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  if (!process.env.PEXELS_API_KEY) {
    return NextResponse.json(
      { error: "Pexels API key is not configured" },
      { status: 500 }
    );
  }

  try {
    const client = createClient(process.env.PEXELS_API_KEY);
    const response = await client.photos.search({ query, per_page: 1 });

    if ("photos" in response && response.photos.length > 0) {
      return NextResponse.json({ imageUrl: response.photos[0].src.large });
    } else {
      return NextResponse.json({ imageUrl: null });
    }
  } catch (error) {
    console.error("Error fetching image from Pexels:", error);
    return NextResponse.json(
      { error: "Failed to fetch image from Pexels" },
      { status: 500 }
    );
  }
}
