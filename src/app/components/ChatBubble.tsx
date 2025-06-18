import Image from "next/image";
import PlaceholderImage from "./PlaceholderImage";
import { useState, useEffect } from "react";

interface Product {
  name: string;
  price: string;
  specs: string;
  pros: string;
  image: string;
  sourceUrl: string;
}

interface ChatBubbleProps {
  isExpanded: boolean;
  messages: Array<{
    id: string;
    role: string;
    parts: Array<{ type: string; text: string }>;
  }>;
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onToggleExpanded: () => void;
  onClose: () => void;
  chickSize: number;
  isScrolled: boolean;
}

export default function ChatBubble({
  isExpanded,
  messages,
  input,
  onInputChange,
  onSubmit,
  onToggleExpanded,
  onClose,
  chickSize,
  isScrolled,
}: ChatBubbleProps) {
  const [isTyping, setIsTyping] = useState(false);

  // Show typing indicator when waiting for response
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      setIsTyping(true);
      // Hide typing after a short delay (will be replaced by actual response)
      const timer = setTimeout(() => setIsTyping(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [messages]);
  // Helper function to extract products from message content
  const extractProducts = (content: string): Product[] => {
    const startMarker = "__PRODUCT_DATA_START__";
    const endMarker = "__PRODUCT_DATA_END__";
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);

    if (startIndex !== -1 && endIndex !== -1) {
      const productDataString = content
        .substring(startIndex + startMarker.length, endIndex)
        .trim();
      try {
        const products = JSON.parse(productDataString);
        return Array.isArray(products) ? products : [];
      } catch (error) {
        console.error("Error parsing product data in chat:", error);
        return [];
      }
    }
    return [];
  };

  // Helper function to clean message content (remove product data markers)
  const cleanMessageContent = (content: string): string => {
    const startMarker = "__PRODUCT_DATA_START__";
    const endMarker = "__PRODUCT_DATA_END__";
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker);

    if (startIndex !== -1 && endIndex !== -1) {
      return (
        content.substring(0, startIndex) +
        content.substring(endIndex + endMarker.length)
      ).trim();
    }
    return content;
  };
  const visibleMessages = isExpanded
    ? messages.filter((m) => m.role === "user" || m.role === "assistant")
    : messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-2);

  if (isExpanded) {
    // Full screen chat overlay
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-30 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col border border-gray-700 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center">
              <div className="w-12 h-12 relative mr-3">
                <Image
                  src="/barnabus_transparent.png"
                  alt="TechChick Avatar"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full filter brightness-90"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-400">Barnabus</h3>
                <p className="text-sm text-gray-400">Your Tech Expert</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onToggleExpanded}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                title="Minimize"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 12a1 1 0 001 1h10a1 1 0 100-2H5a1 1 0 00-1 1z" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {" "}
            {messages.filter((m) => m.role === "user" || m.role === "assistant")
              .length === 0 && (
              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-400">
                <p className="text-sm text-gray-300">
                  👋 Hi! Ask me anything about computers, phones, or tech
                  devices!
                </p>
              </div>
            )}{" "}
            {messages
              .filter((m) => m.role === "user" || m.role === "assistant")
              .map((message) => {
                const content = message.parts
                  .map((part) => (part.type === "text" ? part.text : ""))
                  .join("");
                const products = extractProducts(content);
                const cleanContent = cleanMessageContent(content);

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="max-w-2xl">
                      <div
                        className={`p-4 rounded-lg ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-gray-100 border border-yellow-400/20"
                        }`}
                      >
                        {" "}
                        {message.role === "assistant" && (
                          <div className="text-xs text-yellow-400 mb-2 flex items-center animate-pulse">
                            🐔 TechChick
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">
                          {cleanContent}
                        </div>
                      </div>{" "}
                      {/* Product cards in chat - Better grid layout */}
                      {products.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-full">
                          {products.map((product, index) => (
                            <div
                              key={index}
                              className="bg-gray-800 rounded-xl overflow-hidden border border-gray-600 hover:border-yellow-400 transition-all hover:scale-[1.02] flex flex-col"
                            >
                              <div className="relative w-full h-40">
                                <PlaceholderImage
                                  src={product.image}
                                  alt={product.name}
                                  layout="fill"
                                  objectFit="cover"
                                  className="opacity-90"
                                  productType={
                                    product.name
                                      .toLowerCase()
                                      .includes("laptop")
                                      ? "laptop"
                                      : product.name
                                          .toLowerCase()
                                          .includes("phone")
                                      ? "phone"
                                      : product.name
                                          .toLowerCase()
                                          .includes("desktop")
                                      ? "desktop"
                                      : product.name
                                          .toLowerCase()
                                          .includes("tablet")
                                      ? "tablet"
                                      : "device"
                                  }
                                />
                              </div>
                              <div className="p-4 flex-grow flex flex-col">
                                <h4 className="font-bold text-yellow-400 text-sm mb-2 line-clamp-2">
                                  {product.name}
                                </h4>
                                <p className="text-lg font-bold text-white mb-2">
                                  {product.price}
                                </p>
                                <p className="text-xs text-gray-300 mb-3 flex-grow line-clamp-2">
                                  {product.specs}
                                </p>
                                <div className="bg-gray-700/50 p-2 rounded-lg mb-3">
                                  <p className="text-xs text-gray-200 line-clamp-2">
                                    <span className="text-yellow-400">💡</span>{" "}
                                    {product.pros}
                                  </p>
                                </div>
                                <a
                                  href={product.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-center bg-yellow-400 hover:bg-yellow-300 text-gray-800 font-bold py-2 px-3 rounded-lg text-xs transition-colors mt-auto"
                                >
                                  View Deal
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
          {/* Input */}{" "}
          <form
            onSubmit={onSubmit}
            className="p-6 border-t border-gray-700 flex gap-3"
          >
            <input
              className="flex-1 p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all"
              value={input}
              placeholder="Ask TechChick anything... 💬"
              onChange={onInputChange}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-600 disabled:text-gray-400 text-gray-800 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              Send 🚀
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Compact chat bubble positioned under avatar
  if (!isScrolled) return null;
  return (
    <div
      className="fixed z-20 transition-all duration-500"
      style={{
        right: "1.5rem",
        top: `${2 + chickSize / 16 + 4}rem`, // Position under avatar
        width: "240px", // Made even narrower from 280px
      }}
    >
      {/* Speech bubble container */}
      <div className="bg-gray-900 bg-opacity-95 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 relative mr-2">
              <Image
                src="/barnabus_transparent.png"
                alt="TechChick Avatar"
                layout="fill"
                objectFit="cover"
                className="rounded-full filter brightness-90"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-yellow-400">Barnabus</h3>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onToggleExpanded}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
              title="Expand"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zM16 4a1 1 0 00-1-1h-4a1 1 0 000 2h1.586l-2.293 2.293a1 1 0 101.414 1.414L14 6.414V8a1 1 0 002 0V4z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors text-xs"
            >
              ✕
            </button>
          </div>
        </div>
        {/* Messages (last 2) */}
        <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
          {visibleMessages.length === 0 && (
            <div className="bg-gray-800 p-3 rounded-lg border-l-2 border-yellow-400">
              <p className="text-xs text-gray-300">
                👋 Hi! Ask me about tech devices!
              </p>
            </div>
          )}{" "}
          {visibleMessages.map((message) => {
            const content = message.parts
              .map((part) => (part.type === "text" ? part.text : ""))
              .join("");
            const products = extractProducts(content);
            const cleanContent = cleanMessageContent(content);

            return (
              <div key={message.id} className="space-y-2">
                <div
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-2 rounded-lg text-xs ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-100 border border-yellow-400/20"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="text-xs text-yellow-400 mb-1">🐔</div>
                    )}
                    <div className="whitespace-pre-wrap">
                      {cleanContent.length > 150
                        ? `${cleanContent.substring(0, 150)}...`
                        : cleanContent}
                    </div>
                  </div>
                </div>

                {/* Compact product cards */}
                {products.length > 0 && (
                  <div className="grid grid-cols-1 gap-2">
                    {products.slice(0, 2).map((product, index) => (
                      <div
                        key={index}
                        className="bg-gray-800 rounded-lg p-2 border border-gray-600 hover:border-yellow-400 transition-all"
                      >
                        {" "}
                        <div className="flex gap-2">
                          <div className="relative w-12 h-12 flex-shrink-0">
                            <PlaceholderImage
                              src={product.image}
                              alt={product.name}
                              layout="fill"
                              objectFit="cover"
                              className="rounded opacity-90"
                              productType={
                                product.name.toLowerCase().includes("laptop")
                                  ? "laptop"
                                  : product.name.toLowerCase().includes("phone")
                                  ? "phone"
                                  : product.name
                                      .toLowerCase()
                                      .includes("desktop")
                                  ? "desktop"
                                  : product.name
                                      .toLowerCase()
                                      .includes("tablet")
                                  ? "tablet"
                                  : "device"
                              }
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-yellow-400 text-xs truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-white font-bold">
                              {product.price}
                            </p>
                            <a
                              href={product.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-800 font-bold py-1 px-2 rounded text-xs transition-colors mt-1"
                            >
                              View
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                    {products.length > 2 && (
                      <button
                        onClick={onToggleExpanded}
                        className="text-yellow-400 text-xs hover:text-yellow-300 text-center py-1"
                      >
                        +{products.length - 2} more products
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Input */}{" "}
        <form
          onSubmit={onSubmit}
          className="p-3 border-t border-gray-700 flex gap-2"
        >
          <input
            className="flex-1 p-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400/20 transition-all text-xs"
            value={input}
            placeholder="Ask about tech... 💡"
            onChange={onInputChange}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-600 text-gray-800 px-3 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 disabled:scale-100 text-xs"
          >
            💬
          </button>
        </form>
      </div>

      {/* Speech bubble pointer */}
      <div
        className="absolute -top-2 right-8 w-0 h-0"
        style={{
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderBottom: "8px solid rgba(17, 24, 39, 0.95)",
        }}
      />
    </div>
  );
}
