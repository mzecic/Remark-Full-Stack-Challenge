"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ProductCard from "./components/ProductCard";
import ChatBubble from "./components/ChatBubble";

interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Product {
  name: string;
  price: string;
  specs: string;
  pros: string;
  image: string;
  sourceUrl: string;
}

const productCategories: ProductCategory[] = [
  {
    id: "laptop",
    name: "Laptops",
    icon: "💻",
    description: "Find your perfect laptop",
  },
  {
    id: "phone",
    name: "Phones",
    icon: "📱",
    description: "Discover the ideal smartphone",
  },
  {
    id: "desktop",
    name: "Desktops",
    icon: "🖥️",
    description: "Build or buy the perfect PC",
  },
  {
    id: "tablet",
    name: "Tablets",
    icon: "📲",
    description: "Portable computing power",
  },
];

const useCases = [
  {
    id: "gaming",
    name: "Gaming",
    icon: "🎮",
    description: "High-performance gaming setup",
  },
  {
    id: "work",
    name: "Work & Productivity",
    icon: "💼",
    description: "Professional and business use",
  },
  {
    id: "creative",
    name: "Creative Work",
    icon: "🎨",
    description: "Photo, video, and design work",
  },
  {
    id: "budget",
    name: "Budget-Friendly",
    icon: "💰",
    description: "Great value for money",
  },
];

export default function TechChickPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    setMessages,
    isLoading: isChatLoading,
  } = useChat();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedUseCase, setSelectedUseCase] = useState<string>("");
  const [showChat, setShowChat] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [currentProductCategory, setCurrentProductCategory] =
    useState<string>("");
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  const [dynamicPrompts, setDynamicPrompts] = useState<string[]>([]);
  const [uiState, setUiState] = useState<{
    products: Product[];
    explanations: { title: string; text: string }[];
    dynamicComponent?: string;
  }>({ products: [], explanations: [] });
  const [chatMessage, setChatMessage] = useState<string>("");

  const currentYear = new Date().getFullYear();

  // Function to fetch dynamic prompts, wrapped in useCallback for performance
  const fetchAndSetDynamicPrompts = useCallback(async () => {
    // Immediately clear existing prompts to show loading state
    setDynamicPrompts([]);
    try {
      const response = await fetch("/api/generate-prompts");
      if (!response.ok) throw new Error("API response not ok");
      const prompts = await response.json();
      if (Array.isArray(prompts) && prompts.length > 0) {
        setDynamicPrompts(prompts);
      } else {
        throw new Error("Invalid prompts format");
      }
    } catch (error) {
      console.error("Failed to fetch dynamic prompts, using fallback.", error);
      // Set fallback prompts on error
      setDynamicPrompts([
        "I need a laptop for college under $800",
        `What's the best gaming laptop in ${currentYear}?`,
        "Should I buy an iPhone or an Android?",
        "Help me build a PC for video editing",
      ]);
    }
  }, [currentYear]);

  // Fetch dynamic prompts on initial load
  useEffect(() => {
    fetchAndSetDynamicPrompts();
  }, [fetchAndSetDynamicPrompts]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []); // Parse AI response for product data from OpenAI
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // Only parse when streaming is complete and we have an assistant message
    if (lastMessage && lastMessage.role === "assistant" && !isChatLoading) {
      const content = lastMessage.parts
        .map((part) => (part.type === "text" ? part.text : ""))
        .join("");

      // Skip parsing if content is empty or too short
      if (!content || content.length < 10) {
        setIsLoadingRecommendations(false);
        return;
      }

      try {
        // More robust JSON extraction - find complete JSON objects
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          // No JSON found, but streaming is complete - this is an error state
          console.error("No JSON found in completed response:", content);
          setIsLoadingRecommendations(false);
          return;
        }

        const jsonString = jsonMatch[0];
        let parsed = JSON.parse(jsonString);

        if (typeof parsed === "string") {
          parsed = JSON.parse(parsed);
        }
        if (parsed && typeof parsed === "object") {
          // Successfully parsed - update UI
          setChatMessage(parsed.chatMessage || "");
          setUiState({
            products: Array.isArray(parsed.ui?.products)
              ? parsed.ui.products
              : [],
            explanations: Array.isArray(parsed.ui?.explanations)
              ? parsed.ui.explanations
              : [],
            dynamicComponent: parsed.ui?.dynamicComponent || undefined,
          });
          setCurrentStep(3);
          setIsLoadingRecommendations(false);
          return;
        }
      } catch {
        // JSON parsing failed on completed response
        console.error(
          "JSON parse error for completed response:",
          content.substring(0, 200) + "..."
        );
        setIsLoadingRecommendations(false);
        return;
      }
    }

    // If we're still streaming, keep the loading state
    if (isChatLoading && lastMessage && lastMessage.role === "user") {
      setIsLoadingRecommendations(true);
    }
  }, [messages, isChatLoading]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentStep(1);
  };
  const handleUseCaseSelect = (useCaseId: string) => {
    setSelectedUseCase(useCaseId);
    setCurrentStep(2);
    setIsLoadingRecommendations(true);

    // Reset chat when discussing a new product category
    if (currentProductCategory !== selectedCategory) {
      setCurrentProductCategory(selectedCategory);
      // Clear previous chat messages would go here if we had access to that functionality
    }

    // Auto-generate initial message based on selections
    const message = `I'm looking for a ${selectedCategory} for ${
      useCaseId === "budget" ? "budget-friendly" : useCaseId
    } use. Can you help me find the perfect option?`;

    append({
      role: "user",
      content: message,
    });
    setShowChat(true);
  };
  const handleStartOver = () => {
    setCurrentStep(0);
    setSelectedCategory("");
    setSelectedUseCase("");
    setShowChat(false);
    setIsLoadingRecommendations(false);
    // Clear the chat history
    setMessages([]); // Reset UI state
    setUiState({ products: [], explanations: [] });
    setChatMessage("");
    // Fetch new dynamic prompts
    fetchAndSetDynamicPrompts();
  };

  const handleScrollClick = () => {
    const section = document.getElementById("product-selection");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const chickSize = Math.max(150, 300 - scrollY * 0.3);
  const isScrolled = scrollY > 300;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white relative overflow-x-hidden">
      {" "}
      {/* TechChick Avatar */}
      <div
        className="fixed transition-all duration-500 ease-out z-0"
        style={{
          width: `${chickSize}px`,
          height: `${chickSize}px`,
          left: isScrolled ? "auto" : "30%",
          right: isScrolled ? "2rem" : "auto",
          top: isScrolled ? "2rem" : "35%",
          transform: isScrolled ? "scaleX(-1)" : "translate(-50%, -50%)",
          opacity: isScrolled ? 1 : 0.85,
        }}
      >
        <div className="relative w-full h-full">
          {/* Barnabus Image Avatar */}
          <Image
            src="/barnabus_transparent.png"
            alt="TechChick Avatar"
            layout="fill"
            objectFit="cover"
            className="rounded-full filter brightness-90"
          />
        </div>

        {/* Chat Toggle Button */}
        {isScrolled && (
          <button
            onClick={() => setShowChat(!showChat)}
            className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-yellow-400 hover:bg-yellow-300 text-gray-800 rounded-full p-2 shadow-lg transition-colors"
          >
            💬
          </button>
        )}
      </div>
      {/* New Chat Bubble Component */}{" "}
      {showChat && (
        <ChatBubble
          messages={messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            parts: msg.parts
              .filter((part) => part.type === "text")
              .map((part) => ({
                type: part.type,
                text: "text" in part ? part.text : "",
              })),
          }))}
          input={input}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onClose={() => setShowChat(false)}
          chickSize={chickSize}
          isScrolled={isScrolled}
          chatMessage={chatMessage}
          onStartNew={handleStartOver}
          isLoading={isLoadingRecommendations || isChatLoading}
        />
      )}
      {/* Hero Section */}
      <div className="h-screen flex flex-col items-center justify-center relative px-8 text-center">
        <div
          className={`transition-all duration-1000 ${
            scrollY > 100
              ? "opacity-0 transform -translate-y-20"
              : "opacity-100"
          }`}
        >
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Meet Barnabus
          </h1>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl">
            Your AI-powered tech expert who&apos;ll help you find the perfect
            computer, phone, or gadget for your needs. Let&apos;s build your
            ideal tech setup together!
          </p>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={handleScrollClick}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce cursor-pointer group focus:outline-none"
        >
          <span className="text-sm text-gray-400 mb-2 group-hover:text-yellow-400 transition-colors">
            Scroll to explore
          </span>
          <div className="w-8 h-14 border-2 border-gray-400 group-hover:border-yellow-400 rounded-full flex justify-center items-start p-1 transition-colors">
            <div className="w-1 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        </button>
      </div>{" "}
      {/* Product Selection Canvas */}
      <div
        id="product-selection"
        className="min-h-screen py-20 px-4 sm:px-8"
        style={{ marginTop: "20vh" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Step 1: Product Category Selection */}
          {currentStep === 0 && (
            <div className="text-center max-w-5xl mx-auto">
              <h2 className="text-4xl font-bold mb-4 text-yellow-400">
                What are you looking for?
              </h2>
              <p className="text-xl text-gray-300 mb-12">
                Choose the type of device you need
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {productCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="bg-gray-800 hover:bg-gray-700 p-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-600 hover:border-yellow-400"
                  >
                    <div className="text-6xl mb-4">{category.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {category.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}{" "}
          {/* Step 2: Use Case Selection */}
          {currentStep === 1 && (
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-4 text-yellow-400">
                How will you use your {selectedCategory}?
              </h2>
              <p className="text-xl text-gray-300 mb-12">
                Tell me about your primary use case
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {useCases.map((useCase) => (
                  <button
                    key={useCase.id}
                    onClick={() => handleUseCaseSelect(useCase.id)}
                    className="bg-gray-800 hover:bg-gray-700 p-8 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-600 hover:border-yellow-400 text-left"
                  >
                    <div className="flex items-center mb-4">
                      <div className="text-4xl mr-4">{useCase.icon}</div>
                      <h3 className="text-xl font-bold">{useCase.name}</h3>
                    </div>
                    <p className="text-gray-400">{useCase.description}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentStep(0)}
                className="mt-8 text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                ← Back to device selection
              </button>
            </div>
          )}{" "}
          {/* Step 3: Recommendations Loading */}
          {currentStep === 2 && (
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-4 text-yellow-400 animate-fade-in">
                Perfect! Let me find your options
              </h2>
              <p className="text-xl text-gray-300 mb-12 animate-fade-in delay-150">
                Looking for {selectedCategory} recommendations for{" "}
                {selectedUseCase} use<span className="loading-dots"></span>
              </p>

              <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 glow animate-fade-in delay-300">
                <div className="animate-pulse">
                  <div className="text-6xl mb-4 animate-bounce animate-float">
                    <Image
                      src="/barnabus_typing.png"
                      alt="TechChick Avatar"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-full filter brightness-90"
                    />
                  </div>
                  <p className="text-lg mb-4 animate-fade-in delay-450">
                    Barnabus is analyzing your needs and scraping the web for
                    the best images<span className="loading-dots"></span>
                  </p>
                  <div className="flex justify-center mb-4">
                    <div className="flex space-x-1">
                      <div
                        className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 h-3 rounded-full animate-gradient transition-all duration-1000"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-3 animate-pulse animate-fade-in delay-600">
                    {isLoadingRecommendations
                      ? "🔍 Finding the perfect matches and enhancing images..."
                      : "✨ Almost done!"}
                  </p>
                  <div className="mt-4 flex justify-center animate-fade-in delay-700">
                    <div className="flex space-x-2 text-2xl">
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0s" }}
                      >
                        💻
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      >
                        📱
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      >
                        🖥️
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.6s" }}
                      >
                        📲
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowChat(true)}
                className="mt-8 bg-yellow-400 hover:bg-yellow-300 text-gray-800 px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in delay-800"
              >
                💬 View Chat
              </button>
            </div>
          )}{" "}
          {/* Step 4: Dynamic Content from AI */}
          {currentStep === 3 && (
            <div className="text-center">
              {" "}
              {/* Show products in cards if available */}
              {uiState.products.length > 0 && (
                <>
                  <h2 className="text-4xl font-bold mb-4 text-yellow-400 animate-fade-in">
                    🐔 Barnabus Found Your Perfect Matches!
                  </h2>
                  <p className="text-xl text-gray-300 mb-12 animate-fade-in delay-150">
                    Here are the top recommendations for your needs:
                  </p>

                  <div className="products-grid mb-12 transition-all duration-700">
                    {uiState.products.map((product, index) => (
                      <div
                        key={index}
                        className="animate-card-entrance card-hover"
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </>
              )}
              {/* Show explanations if available */}
              {uiState.explanations.length > 0 && (
                <div className="mb-8 mt-8">
                  <h3 className="text-2xl font-bold mb-6 text-yellow-400">
                    💡 Why These Recommendations?
                  </h3>
                  <div className="grid grid-cols-1 max-w-3xl mx-auto gap-6">
                    {uiState.explanations.map((explanation, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 animate-fade-in"
                        style={{ animationDelay: `${idx * 200}ms` }}
                      >
                        <h4 className="text-lg font-bold text-yellow-400 mb-3">
                          {explanation.title}
                        </h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {explanation.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Show dynamic HTML content if available */}
              {uiState.dynamicComponent && (
                <div className="w-full flex justify-center items-center">
                  <div
                    className="animate-fade-in animate-slide-up mb-8 mx-auto"
                    dangerouslySetInnerHTML={{
                      __html: uiState.dynamicComponent,
                    }}
                  />
                </div>
              )}
              <div className="flex gap-4 justify-center flex-wrap animate-fade-in delay-300 mt-10">
                <button
                  onClick={handleStartOver}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  🔄 Start Over
                </button>
                <button
                  onClick={() => setShowChat(true)}
                  className="bg-yellow-400 hover:bg-yellow-300 text-gray-800 px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-yellow-400/30"
                >
                  💬 Chat with Barnabus
                </button>
              </div>
            </div>
          )}
          {/* Quick Examples Section */}
          {currentStep === 0 && (
            <div className="mt-20 bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700">
              <h3 className="text-2xl font-bold mb-6 text-center text-yellow-400">
                Or try these quick examples:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {" "}
                {(dynamicPrompts.length > 0
                  ? dynamicPrompts
                  : [
                      "Help me choose a laptop for college",
                      "What's the best phone for photography?",
                      "I need a gaming PC setup advice",
                      "Budget tablet recommendations",
                    ]
                ).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (question) {
                        setShowChat(true);
                        setCurrentStep(3);
                        append({
                          role: "user",
                          content: question,
                        });
                      }
                    }}
                    className={`bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left transition-all hover:scale-102 border border-gray-600 hover:border-yellow-400/50 ${
                      !question ? "animate-pulse bg-gray-600" : ""
                    }`}
                    disabled={!question}
                  >
                    {question ? (
                      <>
                        <div className="text-sm text-gray-300">
                          &quot;{question}&quot;
                        </div>
                        <div className="text-xs text-yellow-400 mt-2">
                          Click to ask →
                        </div>
                      </>
                    ) : (
                      <div className="h-10"></div> // Placeholder for loading state
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
