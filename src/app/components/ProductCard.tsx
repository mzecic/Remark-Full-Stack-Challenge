import { Product } from "../types";
import { useState, useEffect } from "react";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
}

const getProductIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("laptop")) return "💻";
  if (t.includes("phone")) return "📱";
  if (t.includes("desktop")) return "🖥️";
  if (t.includes("tablet")) return "📲";
  return "💻";
};

export default function ProductCard({ product }: ProductCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProductImage = async () => {
      if (!product.name) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Ensure you have a .env.local file with your Pexels API key
      // NEXT_PUBLIC_PEXELS_API_KEY=your_api_key
      const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

      if (!PEXELS_API_KEY) {
        console.error(
          "Pexels API key is missing. Add PEXELS_API_KEY to .env.local"
        );
        setImageUrl(null);
        setIsLoading(false);
        return;
      }

      // Create a sequence of search terms, from most specific to most general
      const brand = product.name.split(" ")[0];
      const searchTerms = [
        product.name, // 1. Full product name: "ASUS ROG Zephyrus G16"
        product.name.split(" ").slice(0, 2).join(" "), // 2. Brand + Model: "ASUS ROG"
        `${brand} ${product.type}`, // 3. Brand + Type: "ASUS laptop"
        brand, // 4. Brand only: "ASUS"
      ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates

      let foundImageUrl = null;

      for (const term of searchTerms) {
        if (!term || term.trim() === product.type) continue; // Avoid empty or overly generic searches
        try {
          console.log(`Searching Pexels for: "${term}"`); // DEBUG
          const response = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(
              term
            )}&per_page=1`,
            {
              headers: {
                Authorization: PEXELS_API_KEY,
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              `Pexels API request failed with status ${response.status}`
            );
          }

          const data = await response.json();

          if (data.photos && data.photos.length > 0) {
            foundImageUrl = data.photos[0].src.large; // Using 'large' image size
            console.log(`Found image for "${term}":`, foundImageUrl); // DEBUG
            break; // Exit loop once an image is found
          }
        } catch (error) {
          console.error(`Error fetching image for term "${term}":`, error);
          // Continue to the next search term
        }
      }

      setImageUrl(foundImageUrl);
      setIsLoading(false);
    };

    fetchProductImage();
  }, [product.name, product.type]);

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-400 transition-all duration-300 flex flex-col h-full group shadow-lg hover:shadow-2xl hover:shadow-yellow-400/20 hover:-translate-y-2 hover:scale-[1.02]">
      <div className="relative w-full h-48 bg-gray-900 flex items-center justify-center overflow-hidden">
        {isLoading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
        ) : imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            className="transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-yellow-400/10 to-orange-400/10">
            <span className="text-5xl">{getProductIcon(product.type)}</span>
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 flex-grow flex flex-col relative">
        <h3 className="text-lg md:text-xl font-bold text-yellow-400 mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 mb-3 md:mb-4">
          <p className="text-2xl md:text-3xl font-extrabold text-white group-hover:text-yellow-100 transition-colors">
            {product.price}
          </p>
        </div>
        <div className="bg-gray-900/50 p-2 md:p-3 rounded-lg mb-3 md:mb-4 border border-gray-600 group-hover:border-gray-500 transition-colors">
          <p className="text-xs md:text-sm text-gray-300 line-clamp-3 leading-relaxed">
            {product.specs}
          </p>
        </div>
        <div className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10 p-2 md:p-3 rounded-lg mb-3 md:mb-4 border-l-4 border-yellow-400 group-hover:border-yellow-300 transition-colors">
          <p className="text-xs md:text-sm text-gray-200">
            <span className="font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
              🐔 Barnabus says:
            </span>{" "}
            <span className="italic">&quot;{product.pros}&quot;</span>
          </p>
        </div>
        <a
          href={product.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto w-full text-center bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-gray-800 font-bold py-2 md:py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/50 active:scale-95 transform hover:scale-105 group-hover:animate-pulse"
        >
          <span className="flex items-center justify-center gap-2 text-sm md:text-base">
            View Deal
            <span className="text-base md:text-lg group-hover:animate-bounce">
              🛒
            </span>
          </span>
        </a>
      </div>
    </div>
  );
}
