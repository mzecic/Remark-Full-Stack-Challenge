"use client";
import { useChat, type Message } from "@ai-sdk/react";
import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import Image from "next/image";
import ProductCard from "./components/ProductCard";
import ChatBubble from "./components/ChatBubble";

const ChatInputComponent = ({
  handleSubmit,
  input,
  handleInputChange,
  messages,
  isChatLoading,
  className,
}: {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  input: string;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => void;
  messages: Message[];
  isChatLoading: boolean;
  className?: string;
}) => (
  <form onSubmit={handleSubmit} className={className}>
    <input
      className="w-full p-4 rounded-lg bg-gray-800/50 border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition"
      value={input}
      onChange={handleInputChange}
      placeholder={
        messages.length > 0 ? "Ask a follow-up..." : "Ask Barnabus anything..."
      }
      disabled={isChatLoading}
    />
  </form>
);

interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Product {
  name: string;
  type: string;
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
    handleSubmit: originalHandleSubmit,
    append,
    setMessages,
    isLoading: isChatLoading,
  } = useChat({
    api: "/api/chat",
  });

  const [scrollY, setScrollY] = useState(0);
  const [dynamicPrompts, setDynamicPrompts] = useState<string[]>([]);
  const [uiState, setUiState] = useState<{
    products: Product[];
    explanations: { title: string; text: string }[];
    dynamicComponent?: string;
  }>({
    products: [],
    explanations: [],
  });
  const [currentStep, setCurrentStep] = useState(0); // 0: initial, 1: use cases
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showScrollButton, setShowScrollButton] = useState(true);
  const [isChatPaneVisible, setIsChatPaneVisible] = useState(false);

  const currentYear = new Date().getFullYear();

  const fetchAndSetDynamicPrompts = useCallback(async () => {
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
      setDynamicPrompts([
        "I need a laptop for college under $800",
        `What's the best gaming laptop in ${currentYear}?`,
        "Should I buy an iPhone or an Android?",
        "Help me build a PC for video editing",
      ]);
    }
  }, [currentYear]);

  useEffect(() => {
    fetchAndSetDynamicPrompts();
  }, [fetchAndSetDynamicPrompts]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Hide button if the main content is 10% or more visible
        setShowScrollButton(entry.intersectionRatio < 0.1);
      },
      { threshold: 0.1 }
    );

    observer.observe(mainContent);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "assistant" && !isChatLoading) {
      const content = lastMessage.content;
      if (!content || content.length < 10) {
        return;
      }
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error("No JSON found in completed response:", content);
          return;
        }
        const jsonString = jsonMatch[0];
        let parsed = JSON.parse(jsonString);
        if (typeof parsed === "string") parsed = JSON.parse(parsed);

        if (parsed && typeof parsed === "object") {
          setUiState({
            products: Array.isArray(parsed.ui?.products)
              ? parsed.ui.products
              : [],
            explanations: Array.isArray(parsed.ui?.explanations)
              ? parsed.ui.explanations
              : [],
            dynamicComponent: parsed.ui?.dynamicComponent || undefined,
          });
        }
      } catch (error) {
        console.error("JSON parse error for completed response:", error);
      }
    } else if (
      isChatLoading &&
      messages[messages.length - 1]?.role === "user"
    ) {
      setUiState({ products: [], explanations: [] });
    }
  }, [messages, isChatLoading]);

  const handleStartOver = () => {
    setMessages([]);
    setUiState({ products: [], explanations: [] });
    fetchAndSetDynamicPrompts();
    setCurrentStep(0);
    setSelectedCategory("");
  };

  const handleCategorySelect = (categoryId: string) => {
    const category = productCategories.find((c) => c.id === categoryId);
    if (category) {
      setSelectedCategory(category.name);
      setCurrentStep(1);
    }
  };

  const handleUseCaseSelect = (useCaseId: string) => {
    const useCase = useCases.find((u) => u.id === useCaseId);
    if (useCase) {
      const message = `I'm looking for a ${selectedCategory} for ${useCase.name} use. Can you help me find the perfect option?`;
      append({
        role: "user",
        content: message,
      });
    }
  };

  const handleScrollClick = () => {
    const section = document.getElementById("main-content");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;
    originalHandleSubmit(e);
  };

  const handlePromptClick = (prompt: string) => {
    append({ role: "user", content: prompt });
  };

  const isScrolled = scrollY > 300;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white relative overflow-x-hidden">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center relative px-8 text-center mt-20 pt-20">
        <div
          className="transition-all duration-500 ease-out mb-4"
          style={{
            width: `${isScrolled ? 150 : 220}px`,
            height: `${isScrolled ? 150 : 220}px`,
            opacity: isScrolled ? 0.9 : 1,
          }}
        >
          <div className="relative w-full h-full">
            <Image
              src="/barnabus_transparent.png"
              alt="TechChick Avatar"
              layout="fill"
              objectFit="cover"
              className="rounded-full filter brightness-90"
            />
          </div>
        </div>

        <div
          className={`transition-all duration-1000 ${
            scrollY > 100
              ? "opacity-0 transform -translate-y-20"
              : "opacity-100"
          }`}
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Meet Barnabus
          </h1>
          <p className="text-lg mb-6 text-gray-300 max-w-sm">
            Your AI-powered tech expert who&apos;ll help you find the perfect
            computer, phone, or gadget for your needs.
          </p>
        </div>

        <button
          onClick={handleScrollClick}
          className={`bottom-10 mt-20 left-1/2 flex flex-col items-center animate-bounce cursor-pointer group focus:outline-none transition-opacity duration-300 ${
            showScrollButton ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <span className="text-sm text-gray-400 mb-2 group-hover:text-yellow-400 transition-colors">
            Scroll to explore
          </span>
          <div className="w-8 h-14 border-2 border-gray-400 group-hover:border-yellow-400 rounded-full flex justify-center items-start p-1 transition-colors">
            <div className="w-1 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        </button>
      </div>

      {/* Main Content Area */}
      <main
        id="main-content"
        className="p-8 sm:p-8 mt-10 md:w-4xl lg:w-6xl xl:w-7xl mx-auto md:h-4xl"
      >
        <div className="max-w-7xl mx-auto bg-black/20 backdrop-blur-sm rounded-3xl border border-gray-700/50 shadow-2xl p-6 sm:p-8">
          {/* Chat Input Form - only when no messages */}
          {messages.length === 0 && (
            <ChatInputComponent
              className="mb-8"
              handleSubmit={handleSubmit}
              input={input}
              handleInputChange={handleInputChange}
              messages={messages}
              isChatLoading={isChatLoading}
            />
          )}

          {/* Conditional Content */}
          {messages.length === 0 && !isChatLoading ? (
            <>
              {currentStep === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Categories */}
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-yellow-400">
                      Explore by Category
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {productCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategorySelect(category.id)}
                          className="bg-gray-800/50 hover:bg-gray-700/50 p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-600 hover:border-yellow-400 text-left"
                        >
                          <div className="text-3xl mb-3">{category.icon}</div>
                          <h4 className="text-lg font-bold">{category.name}</h4>
                          <p className="text-gray-400 text-sm">
                            {category.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Examples */}
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-yellow-400">
                      Or Try an Example
                    </h3>
                    <div className="space-y-4">
                      {dynamicPrompts.slice(0, 4).map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handlePromptClick(prompt)}
                          className="w-full bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left transition-all hover:scale-102 border border-gray-600 hover:border-yellow-400/50"
                        >
                          <p className="text-sm text-gray-300">
                            &quot;{prompt}&quot;
                          </p>
                          <div className="text-xs text-yellow-400 mt-2">
                            Click to ask →
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
              )}
            </>
          ) : (
            // Chat/Results View
            <>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Pane (40%) - Chat */}
                <div
                  className={`w-full md:w-2/5 flex-col ${
                    isChatPaneVisible ? "flex" : "hidden"
                  } md:flex`}
                >
                  <h3 className="text-2xl font-bold mb-4 text-yellow-400 flex-shrink-0">
                    Chat
                  </h3>
                  <div className="space-y-4 overflow-y-auto custom-scrollbar flex-grow pr-2 -mr-2 max-h-[60vh]">
                    {messages.map((m, i) => (
                      <ChatBubble
                        key={m.id}
                        message={m}
                        isLast={i === messages.length - 1}
                        isLoading={isChatLoading}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex-shrink-0">
                    <ChatInputComponent
                      handleSubmit={handleSubmit}
                      input={input}
                      handleInputChange={handleInputChange}
                      messages={messages}
                      isChatLoading={isChatLoading}
                    />
                  </div>
                </div>

                {/* Right Pane (60%) - Results */}
                <div
                  className={`w-full md:w-3/5 ${
                    isChatPaneVisible ? "hidden" : "block"
                  } md:block`}
                >
                  {isChatLoading && messages.length > 0 && (
                    <div className="flex justify-center items-center pt-10 h-full">
                      <div className="text-center">
                        <Image
                          src="/barnabus_typing.png"
                          alt="Barnabus Typing"
                          width={100}
                          height={100}
                          className="mx-auto"
                        />
                        <p className="text-lg text-gray-400 mt-4 animate-pulse">
                          Barnabus is thinking...
                        </p>
                        <div className="mt-4 flex items-center justify-center space-x-1">
                          <div
                            className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isChatLoading &&
                    (uiState.products.length > 0 ||
                      uiState.explanations.length > 0) && (
                      <div className="animate-fade-in">
                        {uiState.products.length > 0 && (
                          <>
                            <h2 className="text-3xl font-bold mb-2 text-yellow-400">
                              🐔 Your Perfect Matches!
                            </h2>
                            <p className="text-lg text-gray-300 mb-6">
                              Here are the top recommendations for your needs:
                            </p>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {uiState.products.map((product, index) => (
                                <div
                                  key={index}
                                  className="animate-card-entrance"
                                  style={{
                                    animationDelay: `${index * 100}ms`,
                                  }}
                                >
                                  <ProductCard product={product} />
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        {uiState.explanations.length > 0 && (
                          <div className="mt-8">
                            <h3 className="text-2xl font-bold mb-4 text-yellow-400">
                              💡 Why These Recommendations?
                            </h3>
                            <div className="space-y-4">
                              {uiState.explanations.map((explanation, idx) => (
                                <div
                                  key={idx}
                                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700"
                                >
                                  <h4 className="text-md font-bold text-yellow-400 mb-2">
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
                        {uiState.dynamicComponent && (
                          <div className="w-full flex justify-center items-center mt-6">
                            <div
                              className="animate-fade-in"
                              dangerouslySetInnerHTML={{
                                __html: uiState.dynamicComponent,
                              }}
                            />
                          </div>
                        )}
                        <div className="hidden md:flex gap-4 justify-center mt-8">
                          <button
                            onClick={handleStartOver}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold transition-all"
                          >
                            🔄 Start Over
                          </button>
                        </div>
                      </div>
                    )}
                  {!isChatLoading &&
                    messages.length > 1 &&
                    uiState.products.length === 0 &&
                    uiState.explanations.length === 0 && (
                      <div className="flex flex-col justify-center items-center pt-10 h-full animate-fade-in">
                        <Image
                          src="/barnabus_triggered.png"
                          alt="Barnabus is triggered"
                          width={200}
                          height={200}
                          className="mx-auto rounded-lg"
                        />
                        <p className="text-lg text-red-400 mt-4 font-semibold">
                          Wha?! I don't understand. Try rephrasing your request.
                        </p>
                        <div className="hidden md:flex gap-4 justify-center mt-8">
                          <button
                            onClick={handleStartOver}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold transition-all"
                          >
                            🔄 Start Over
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              </div>
              {/* Mobile bottom bar */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-gray-700/50 p-4 flex justify-center items-center gap-4 z-20">
                <button
                  onClick={handleStartOver}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all text-sm"
                >
                  🔄 Start Over
                </button>
                <button
                  onClick={() => setIsChatPaneVisible(!isChatPaneVisible)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-5 py-2.5 rounded-lg font-semibold transition-all text-sm"
                >
                  {isChatPaneVisible ? "View Results" : "View Chat"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
