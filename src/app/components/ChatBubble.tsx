import Image from "next/image";
import { Message } from "@ai-sdk/react";

interface ChatBubbleProps {
  message: Message;
  isLast: boolean;
  isLoading: boolean;
}

export default function ChatBubble({
  message,
  isLast,
  isLoading,
}: ChatBubbleProps) {
  const isUser = message.role === "user";
  const bubbleClasses = isUser
    ? "bg-purple-600 text-white rounded-br-none"
    : "bg-gray-700 text-white rounded-bl-none";

  let content = message.content;
  let showThinking = false;

  if (message.role === "assistant") {
    try {
      const jsonMatch = message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        content = parsed.chatMessage || "";
        if (!content && isLast && isLoading) {
          showThinking = true;
        }
      } else if (isLast && isLoading) {
        showThinking = true;
        content = "";
      }
    } catch (e) {
      if (isLast && isLoading) {
        showThinking = true;
        content = "";
      } else {
        content = message.content.replace(/{\s*\"ui\":[\s\S]*/, "").trim();
      }
    }
  }

  if (!content && !showThinking) {
    return null;
  }

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <Image
            src="/barnabus.png"
            alt="Barnabus"
            width={32}
            height={32}
            className="rounded-full"
          />
        </div>
      )}
      <div className={`max-w-md p-3 rounded-lg ${bubbleClasses}`}>
        {showThinking ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            <span>Thinking...</span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </div>
  );
}
