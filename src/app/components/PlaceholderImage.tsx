import { useState } from "react";
import Image from "next/image";

interface PlaceholderImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  layout?: "fill" | "fixed" | "intrinsic" | "responsive";
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  productType?: string;
}

export default function PlaceholderImage({
  src,
  alt,
  width,
  height,
  className = "",
  layout = "fill",
  objectFit = "cover",
  productType = "device",
}: PlaceholderImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const getPlaceholderIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "laptop":
      case "laptops":
        return "💻";
      case "phone":
      case "phones":
      case "smartphone":
        return "📱";
      case "desktop":
      case "desktops":
      case "pc":
        return "🖥️";
      case "tablet":
      case "tablets":
        return "📲";
      case "gaming":
        return "🎮";
      default:
        return "📟";
    }
  };

  const getPlaceholderColor = (productName: string) => {
    // Simple hash function to generate consistent colors
    let hash = 0;
    for (let i = 0; i < productName.length; i++) {
      hash = productName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };
  if (imageError || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-700 ${className}`}
        style={{
          background: `linear-gradient(135deg, ${getPlaceholderColor(
            alt
          )}, ${getPlaceholderColor(alt + "2")})`,
          width: layout === "fill" ? "100%" : width,
          height: layout === "fill" ? "100%" : height,
        }}
      >
        <div className="text-center text-white">
          <div className="text-4xl mb-2 animate-pulse">
            {getPlaceholderIcon(productType)}
          </div>
          <div className="text-xs opacity-75 px-2">
            {alt.length > 20 ? `${alt.substring(0, 20)}...` : alt}
          </div>
        </div>
      </div>
    );
  }
  
  const proxiedSrc = src;

  return (
    <div className="relative w-full h-full">
      {/* Loading spinner overlay */}
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 z-10">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-yellow-400/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-xs text-gray-400 mt-3 animate-pulse">
              Loading image...
            </div>
          </div>
        </div>
      )}

      <Image
        src={proxiedSrc}
        alt={alt}
        width={width}
        height={height}
        layout={layout}
        objectFit={objectFit}
        className={`${className} transition-opacity duration-500 ${
          imageLoading ? "opacity-0" : "opacity-100"
        }`}
        onError={() => setImageError(true)}
        onLoad={() => setImageLoading(false)}
      />
    </div>
  );
}
