import Image from "next/image";
import { Message } from "@ai-sdk/react";

interface ChatBubbleProps {
  message: Message;
  isLast: boolean;
  isLoading: boolean;
}

// This is a safer way to parse the assistant's message.
function parseAssistantMessage(
  content: string,
  isLast: boolean,
  isLoading: boolean
): { visibleContent: string; showThinking: boolean } {
  // Goal: Extract `chatMessage` without parsing the whole object, which can be incomplete.

  // Case 1: Content is not JSON-like, just plain text.
  if (!content.trim().startsWith("{")) {
    return { visibleContent: content, showThinking: false };
  }

  // Case 2: Content is JSON-like. Try to extract chatMessage.
  try {
    const chatMessageMatch = content.match(
      /"chatMessage"\s*:\s*"((?:[^"\\]|\\.)*)"/
    );
    if (chatMessageMatch && chatMessageMatch[1]) {
      // We have a match. The content of chatMessage can have escaped chars.
      // Using JSON.parse on a quoted string is a safe way to unescape.
      const visibleContent = JSON.parse(`"${chatMessageMatch[1]}"`);
      return { visibleContent, showThinking: false };
    }
  } catch (e) {
    // This would only happen if the matched string inside chatMessage is malformed, which is very unlikely.
    // We can just ignore and fall through.
    console.error("Could not unescape chat message content", e);
  }

  // Case 3: JSON-like, but no chatMessage found yet.
  // If we are streaming, it's normal. Show "Thinking...".
  if (isLast && isLoading) {
    // Avoid showing "Thinking..." if we are clearly just streaming the UI part.
    const isJustUiStreaming = content.trim().startsWith('{"ui"');
    if (!isJustUiStreaming) {
      return { visibleContent: "", showThinking: true };
    }
  }

  // Case 4: Fallback. It's a JSON-like string but we can't get a message from it.
  // (e.g., only UI data, or malformed). Don't show anything in the bubble.
  return { visibleContent: "", showThinking: false };
}

export default function ChatBubble({
  message,
  isLast,
  isLoading,
}: ChatBubbleProps) {
  // More robust check to ensure message and its properties are valid.
  if (
    !message ||
    typeof message.role !== "string" ||
    typeof message.content !== "string"
  ) {
    return null;
  }

  const isUser = message.role === "user";
  const bubbleClasses = isUser
    ? "bg-purple-600 text-white rounded-br-none"
    : "bg-gray-700 text-white rounded-bl-none";

  let content = message.content;
  let showThinking = false;

  if (message.role === "assistant") {
    const result = parseAssistantMessage(content, isLast, isLoading);
    content = result.visibleContent;
    showThinking = result.showThinking;
  }

  // Don't render empty bubbles unless it's the assistant thinking.
  if (!content && !showThinking) {
    return null;
  }

  return (
    <div className={`flex items-end gap-2 my-2 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="flex-shrink-0 self-start">
          <Image
            src="/barnabus.png"
            alt="Barnabus"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
      )}
      <div
        className={`max-w-md p-3 rounded-lg shadow-md ${bubbleClasses} animate-bubble-pop-in`}
      >
        {showThinking ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            <span className="text-sm">Thinking...</span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm">{content}</p>
        )}
      </div>
    </div>
  );
}
