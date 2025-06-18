import { NextRequest, NextResponse } from "next/server";
import { getEnhancedProductImageWithScraping } from "../../utils/imageScraper";

export async function POST(request: NextRequest) {
  try {
    const { products } = await request.json();

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: "Products must be an array" },
        { status: 400 }
      );
    }

    // Enhance each product with better images
    const enhancedProducts = await Promise.all(
      products.map(async (product: any) => {
        const productType = detectProductType(product.name);
        const enhancedImage = await getEnhancedProductImageWithScraping(
          product.name,
          productType,
          product.sourceUrl
        );

        return {
          ...product,
          image: enhancedImage,
          originalImage: product.image, // Keep original as backup
        };
      })
    );

    return NextResponse.json({ products: enhancedProducts });
  } catch (error) {
    console.error("Error enhancing products:", error);
    return NextResponse.json(
      { error: "Failed to enhance products" },
      { status: 500 }
    );
  }
}

function detectProductType(productName: string): string {
  const name = productName.toLowerCase();

  if (
    name.includes("laptop") ||
    name.includes("macbook") ||
    name.includes("thinkpad")
  ) {
    return "laptop";
  }
  if (
    name.includes("phone") ||
    name.includes("iphone") ||
    name.includes("galaxy") ||
    name.includes("pixel")
  ) {
    return "phone";
  }
  if (
    name.includes("desktop") ||
    name.includes("pc") ||
    name.includes("studio") ||
    name.includes("optiplex")
  ) {
    return "desktop";
  }
  if (name.includes("tablet") || name.includes("ipad")) {
    return "tablet";
  }

  return "device";
}
