import React from "react";
import { Sparkles, User } from "lucide-react";
import { clsx } from "clsx";
import { MarkdownMessage } from "@/components/assistant/markdown-message";

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
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold transition-transform duration-200",
                isUser
                  ? "bg-[var(--surface-raised)] text-[var(--text)] border border-[var(--border)]"
                  : "bg-[var(--accent)] text-white shadow-sm ring-2 ring-[var(--accent)]/20"
              )}
            >
              {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            <div
              className={clsx(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all duration-200",
                isUser
                  ? "bg-[var(--accent)] text-white rounded-tr-none shadow-sm max-w-[85%] sm:max-w-md"
                  : "bg-[var(--surface-raised)] text-[var(--text)] border border-[var(--border)] rounded-tl-none shadow-sm max-w-[92%] sm:max-w-xl md:max-w-2xl"
              )}
            >
              <MarkdownMessage content={msg.content} isUser={isUser} />
            </div>
          </div>
        );
      })}

      {isStreaming && (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shrink-0 ring-2 ring-[var(--accent)]/20 shadow-sm">
            <Sparkles className="w-4 h-4 animate-spin [animation-duration:3s]" />
          </div>
          <div
            data-testid="typing-indicator"
            className="rounded-2xl px-4 py-3 bg-[var(--surface-raised)] border border-[var(--border)] rounded-tl-none flex items-center gap-1.5 shadow-sm"
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
