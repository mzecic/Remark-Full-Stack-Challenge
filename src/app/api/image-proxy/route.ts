import { NextRequest, NextResponse } from "next/server";

const getReferer = (url: string) => {
  if (url.includes("apple.com")) return "https://www.apple.com/";
  if (url.includes("samsung.com")) return "https://www.samsung.com/";
  if (url.includes("lenovo.com")) return "https://www.lenovo.com/";
  if (url.includes("dell.com")) return "https://www.dell.com/";
  return undefined;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("URL parameter is required", { status: 400 });
  }

  // Decode in case it's double-encoded
  try {
    imageUrl = decodeURIComponent(imageUrl);
  } catch {}

  // Basic validation to ensure it's a valid URL
  try {
    new URL(imageUrl);
  } catch {
    return new NextResponse("Invalid URL provided", { status: 400 });
  }

  // Timeout logic
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    // Prepare headers
    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
    };
    const referer = getReferer(imageUrl);
    if (referer) headers["Referer"] = referer;

    // Fetch the external image
    let response;
    try {
      response = await fetch(imageUrl, { headers, signal: controller.signal });
    } catch (err) {
      clearTimeout(timeout);
      return new NextResponse(
        "Failed to fetch image (network error, timeout, or blocked)",
        { status: 502 }
      );
    }
    clearTimeout(timeout);

    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, {
        status: response.status,
      });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return new NextResponse(
        `The requested resource isn't a valid image. Received: ${contentType}`,
        { status: 400 }
      );
    }

    const imageBuffer = new Uint8Array(await response.arrayBuffer());

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new NextResponse("Internal Server Error while fetching image", {
      status: 500,
    });
  }
}
