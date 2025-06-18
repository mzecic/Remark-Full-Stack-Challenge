import Image from "next/image";
import { useEffect, useRef } from "react";

interface ChatBubbleProps {
  messages: Array<{
    id: string;
    role: string;
    parts: Array<{ type: string; text: string }>;
  }>;
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  chickSize: number;
  isScrolled: boolean;
  chatMessage?: string;
}

export default function ChatBubble({
  messages,
  input,
  onInputChange,
  onSubmit,
  onClose,
  chickSize,
  isScrolled,
  chatMessage,
  onStartNew,
  isLoading,
}: ChatBubbleProps & { onStartNew?: () => void; isLoading?: boolean }) {
  const messagesEndRef = useRef<HTMLDivElement>(null); // Scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatMessage]); // Also scroll when chatMessage updates

  // Remove big chat overlay, only render the small chat
  if (!isScrolled) return null;

  // Small chat bubble (now taller, scrollable, and shows all messages)
  return (
    <div
      className="fixed z-20 transition-all duration-500"
      style={{
        right: "1.5rem",
        top: `${2 + chickSize / 16 + 4}rem`,
        width: "320px",
        maxHeight: "60vh",
        height: "auto",
      }}
    >
      <div className="bg-gray-900 bg-opacity-95 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-2xl flex flex-col max-h-full">
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
            {onStartNew && (
              <button
                onClick={onStartNew}
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-3 py-1 rounded-lg border border-yellow-500 shadow-sm transition-all duration-200 text-xs flex items-center gap-1"
                title="Start New Chat"
              >
                <span className="text-lg">🔄</span> New
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors text-xs"
            >
              ✕
            </button>
          </div>
        </div>{" "}
        {/* Messages (scrollable, all recent) */}
        <div
          className="p-3 space-y-2 overflow-y-auto custom-scrollbar"
          id="chat-messages-list"
          style={{ maxHeight: "300px", minHeight: "150px" }}
        >
          {/* Show welcome if no messages and not loading */}
          {messages.length === 0 && !isLoading && (
            <div className="bg-gray-800 p-3 rounded-lg border-l-2 border-yellow-400">
              <p className="text-xs text-gray-300">
                👋 Hi! Ask me about tech devices!
              </p>
            </div>
          )}
          {/* Only show the last user and last assistant message if not loading */}
          {!isLoading &&
            (() => {
              const lastUserIdx = [...messages]
                .reverse()
                .findIndex((m) => m.role === "user");
              const lastAssistantIdx = [...messages]
                .reverse()
                .findIndex((m) => m.role === "assistant");
              const userIdx =
                lastUserIdx !== -1 ? messages.length - 1 - lastUserIdx : -1;
              const assistantIdx =
                lastAssistantIdx !== -1
                  ? messages.length - 1 - lastAssistantIdx
                  : -1;
              const toShow = [];
              if (userIdx !== -1) toShow.push(messages[userIdx]);
              if (
                assistantIdx !== -1 &&
                (assistantIdx > userIdx || userIdx === -1)
              )
                toShow.push(messages[assistantIdx]);
              return toShow.map((message, idx) => {
                const content = message.parts
                  .map((part) => (part.type === "text" ? part.text : ""))
                  .join("");
                const isAssistant = message.role === "assistant";
                const isLatestAssistant =
                  isAssistant && idx === toShow.length - 1;
                // Skip empty user messages
                if (!content && message.role === "user") return null;
                // Only show assistant messages if fully processed (chatMessage exists)
                if (isAssistant) {
                  if (isLatestAssistant) {
                    if (!chatMessage) return null;
                    // Show the parsed chatMessage for the latest assistant message
                    return (
                      <div key={message.id || idx} className="space-y-2">
                        <div className="flex justify-start">
                          <div className="max-w-[85%] p-2 rounded-lg text-xs bg-gray-800 text-gray-100 border border-yellow-400/20">
                            <div className="whitespace-pre-wrap">
                              {chatMessage}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    // For previous assistant messages, skip
                    return null;
                  }
                }
                // User message
                return (
                  <div key={message.id || idx} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] p-2 rounded-lg text-xs bg-blue-600 text-white">
                        <div className="whitespace-pre-wrap">{content}</div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          {/* Loading animation if waiting for Barnabus */}
          {isLoading && (
            <div className="flex justify-start mt-2">
              <div className="flex items-center gap-2 animate-fade-in">
                <Image
                  src="/barnabus_typing.png"
                  alt="Barnabus typing"
                  width={32}
                  height={32}
                  className="animate-bounce"
                />
                <span className="text-yellow-400 animate-pulse">
                  Barnabus is thinking...
                </span>
                <span className="ml-1 animate-bounce">💬</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
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
