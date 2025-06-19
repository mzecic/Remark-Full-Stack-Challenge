import { Product } from "../types";

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
  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-400 transition-all duration-300 flex flex-col h-full group shadow-lg hover:shadow-2xl hover:shadow-yellow-400/20 hover:-translate-y-2 hover:scale-[1.02]">
      {/* Icon section, using only category icons */}
      <div className="relative w-full h-20 md:h-24 flex items-center justify-center bg-gradient-to-r from-yellow-400/10 to-orange-400/10">
        <span className="text-4xl md:text-5xl">
          {getProductIcon(product.type)}
        </span>
      </div>
      <div className="p-4 md:p-6 flex-grow flex flex-col relative">
        {/* Product name with hover effect */}
        <h3 className="text-lg md:text-xl font-bold text-yellow-400 mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors">
          {product.name}
        </h3>
        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3 md:mb-4">
          <p className="text-2xl md:text-3xl font-extrabold text-white group-hover:text-yellow-100 transition-colors">
            {product.price}
          </p>
        </div>
        {/* Specs with better formatting */}
        <div className="bg-gray-900/50 p-2 md:p-3 rounded-lg mb-3 md:mb-4 border border-gray-600 group-hover:border-gray-500 transition-colors">
          <p className="text-xs md:text-sm text-gray-300 line-clamp-3 leading-relaxed">
            {product.specs}
          </p>
        </div>
        {/* Barnabus recommendation with enhanced styling */}
        <div className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10 p-2 md:p-3 rounded-lg mb-3 md:mb-4 border-l-4 border-yellow-400 group-hover:border-yellow-300 transition-colors">
          <p className="text-xs md:text-sm text-gray-200">
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
