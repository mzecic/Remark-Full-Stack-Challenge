import { useState } from "react";
import PlaceholderImage from "./PlaceholderImage";

interface Product {
  name: string;
  price: string;
  specs: string;
  pros: string;
  image: string;
  sourceUrl: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-400 transition-all duration-300 flex flex-col h-full group shadow-lg hover:shadow-2xl hover:shadow-yellow-400/20 hover:-translate-y-2 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-48 overflow-hidden">
        <PlaceholderImage
          src={product.image}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="opacity-90 group-hover:scale-110 transition-all duration-500 animate-image-reveal"
          productType={
            product.name.toLowerCase().includes("laptop")
              ? "laptop"
              : product.name.toLowerCase().includes("phone")
              ? "phone"
              : product.name.toLowerCase().includes("desktop")
              ? "desktop"
              : product.name.toLowerCase().includes("tablet")
              ? "tablet"
              : "device"
          }
        />
        {/* Animated gradient overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Shimmer effect on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity duration-300 animate-shimmer ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <div className="p-6 flex-grow flex flex-col relative">
        {/* Product name with hover effect */}
        <h3 className="text-xl font-bold text-yellow-400 mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors">
          {product.name}
        </h3>

        {/* Price with enhanced styling */}
        <div className="flex items-baseline gap-2 mb-4">
          <p className="text-3xl font-extrabold text-white group-hover:text-yellow-100 transition-colors">
            {product.price}
          </p>
          <div className="flex-1 border-b border-gray-600 group-hover:border-yellow-400/50 transition-colors"></div>
        </div>

        {/* Specs with better formatting */}
        <div className="bg-gray-900/50 p-3 rounded-lg mb-4 border border-gray-600 group-hover:border-gray-500 transition-colors">
          <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
            {product.specs}
          </p>
        </div>

        {/* Barnabus recommendation with enhanced styling */}
        <div className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10 p-3 rounded-lg mb-4 border-l-4 border-yellow-400 group-hover:border-yellow-300 transition-colors">
          <p className="text-sm text-gray-200">
            <span className="font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
              🐔 Barnabus says:
            </span>{" "}
            <span className="italic">&quot;{product.pros}&quot;</span>
          </p>
        </div>

        {/* Enhanced CTA button */}
        <a
          href={product.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto w-full text-center bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-gray-800 font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/50 active:scale-95 transform hover:scale-105 group-hover:animate-pulse"
        >
          <span className="flex items-center justify-center gap-2">
            View Deal
            <span className="text-lg group-hover:animate-bounce">🛒</span>
          </span>
        </a>
      </div>
    </div>
  );
}
