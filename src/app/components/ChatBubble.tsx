"use client";

import Image from "next/image";
import { Message } from "@ai-sdk/react";
import { useState, useEffect, useMemo } from "react";

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
  // Goal: Show the chat message only when the entire JSON object is received.

  // If the content doesn't look like JSON, it's either a plain text response
  // or the final, cleaned-up message from the onFinish handler. Display it.
  if (!content.trim().startsWith("{")) {
    return { visibleContent: content, showThinking: false };
  }

  // If it looks like JSON, try to parse it to see if it's complete.
  try {
    // If JSON.parse succeeds, the full object has been streamed.
    const parsed = JSON.parse(content);
    const chatMessage = parsed.chatMessage || "";
    // Now we have the final message, so we can display it.
    return { visibleContent: chatMessage, showThinking: false };
  } catch {
    // JSON.parse failed, which means the JSON is still streaming and incomplete.
    // If this is the last message and we're still loading, show "Thinking...".
    if (isLast && isLoading) {
      // Avoid showing "Thinking..." if we are clearly just streaming the UI part.
      const isJustUiStreaming = content.trim().startsWith('{"ui"');
      if (!isJustUiStreaming) {
        return { visibleContent: "", showThinking: true };
      }
    }
    // Otherwise, it's an incomplete/malformed JSON for a message that is no longer loading.
    // This can happen in edge cases. Best to show nothing.
    return { visibleContent: "", showThinking: false };
  }
}

export default function ChatBubble({
  message,
  isLast,
  isLoading,
}: ChatBubbleProps) {
  const [loadingMessage, setLoadingMessage] = useState("Thinking...");

  const { content, showThinking, isUser, bubbleClasses } = useMemo(() => {
    if (
      !message ||
      typeof message.role !== "string" ||
      typeof message.content !== "string"
    ) {
      return {
        content: "",
        showThinking: false,
        isUser: false,
        bubbleClasses: "",
      };
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

    return { content, showThinking, isUser, bubbleClasses };
  }, [message, isLast, isLoading]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (showThinking) {
      setLoadingMessage("Thinking...");
      timer = setTimeout(() => {
        setLoadingMessage("Almost there...");
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showThinking]);

  if (
    !message ||
    typeof message.role !== "string" ||
    typeof message.content !== "string"
  ) {
    return null;
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
            <span className="text-sm">{loadingMessage}</span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm">{content}</p>
        )}
      </div>
    </div>
  );
}
