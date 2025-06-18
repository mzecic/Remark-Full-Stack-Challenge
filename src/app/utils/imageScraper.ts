import * as cheerio from "cheerio";
import { getRealProductImage } from "./imageSearch";

// Image scraping utility for getting real product images from URLs
export interface ScrapedImageData {
  url: string;
  alt?: string;
  title?: string;
}

// New, cheerio-based scraper
export async function scrapeProductImage(
  productUrl: string
): Promise<string | null> {
  console.log(`Attempting to scrape URL: ${productUrl}`);
  try {
    // Use a more robust User-Agent
    const response = await fetch(productUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        Referer: "https://www.google.com/",
        "Accept-Encoding": "gzip, deflate, br",
      },
    });

    if (!response.ok) {
      console.error(
        `Scraping failed for ${productUrl}: Status ${response.status} ${response.statusText}`
      );
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let imageUrl: string | undefined;
    const url = new URL(productUrl);
    const domain = url.hostname;

    // --- Site-specific scraping logic ---
    if (domain.includes("amazon.com")) {
      // Amazon's main image is often in a container with ID 'imgTagWrapperId' or 'imageBlock'.
      imageUrl =
        $("#imgTagWrapperId img").attr("src") ||
        $("#landingImage").attr("data-old-hires") ||
        $("#landingImage").attr("src");
    } else if (domain.includes("bestbuy.com")) {
      // Best Buy often uses a specific class for their primary image.
      imageUrl = $(".primary-image.v-fw-medium").attr("src");
    } else if (domain.includes("apple.com")) {
      // Apple uses og:image meta tags which are reliable.
      imageUrl = $('meta[property="og:image"]').attr("content");
    } else if (domain.includes("samsung.com")) {
      // Samsung also uses og:image.
      imageUrl = $('meta[property="og:image"]').attr("content");
    } else if (domain.includes("newegg.com")) {
      // Newegg has a specific container for the main product image.
      imageUrl = $(".product-view-img-original").attr("src");
    }

    // --- Generic Fallback ---
    if (!imageUrl) {
      imageUrl = $('meta[property="og:image"]').attr("content");
    }
    if (!imageUrl) {
      imageUrl = $('meta[name="twitter:image"]').attr("content");
    }

    if (imageUrl) {
      // Resolve relative URLs to absolute
      const absoluteUrl = new URL(imageUrl, productUrl).href;
      console.log(`Successfully scraped image URL: ${absoluteUrl}`);
      return absoluteUrl;
    }

    console.log(`No image could be scraped from ${productUrl}`);
    return null;
  } catch (error) {
    console.error(`An error occurred during scraping of ${productUrl}:`, error);
    return null;
  }
}

// Enhanced function that combines URL scraping with smart image selection
export async function getEnhancedProductImageWithScraping(
  productName: string,
  productType: string,
  sourceUrl?: string
): Promise<string> {
  // If we have a source URL, try to scrape it first
  if (sourceUrl) {
    const scrapedImage = await scrapeProductImage(sourceUrl);
    if (scrapedImage) {
      return scrapedImage;
    }
  }

  // If scraping fails or there's no URL, fall back to the smart image search
  console.log(
    `Scraping failed for ${sourceUrl}, falling back to smart image search.`
  );
  return getRealProductImage(productName, productType);
}
