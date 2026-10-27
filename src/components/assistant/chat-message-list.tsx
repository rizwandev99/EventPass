import React from "react";
import { Sparkles, User } from "lucide-react";
import { clsx } from "clsx";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  proposal?: any;
}

export interface ChatMessageListProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
}

export function ChatMessageList({ messages, isStreaming = false }: ChatMessageListProps) {
  return (
    <div className="space-y-4 py-4">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={msg.id}
            data-testid="chat-message"
            className={clsx("flex items-start gap-3", isUser ? "flex-row-reverse" : "flex-row")}
          >
            <div
              className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold",
                isUser
                  ? "bg-[var(--surface-raised)] text-[var(--text)] border border-[var(--border)]"
                  : "bg-[var(--accent)] text-white shadow-sm"
              )}
            >
              {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            <div
              className={clsx(
                "rounded-2xl px-4 py-3 text-sm max-w-sm sm:max-w-md leading-relaxed whitespace-pre-line",
                isUser
                  ? "bg-[var(--accent)] text-white rounded-tr-none shadow-sm"
                  : "bg-[var(--surface-raised)] text-[var(--text)] border border-[var(--border)] rounded-tl-none shadow-sm"
              )}
            >
              {msg.content}
            </div>
          </div>
        );
      })}

      {isStreaming && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div
            data-testid="typing-indicator"
            className="rounded-2xl px-4 py-3 bg-[var(--surface-raised)] border border-[var(--border)] rounded-tl-none flex items-center gap-1.5"
          >
            <div className="w-2 h-2 rounded-full bg-[var(--text-faint)] animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-[var(--text-faint)] animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-[var(--text-faint)] animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}
    </div>
  );
}
