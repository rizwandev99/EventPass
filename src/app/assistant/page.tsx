"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessageList, ChatMessage } from "@/components/assistant/chat-message-list";
import { ProposalCard } from "@/components/assistant/proposal-card";
import { BookingModal } from "@/components/booking/booking-modal";

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "Hi! I'm your EventPass AI assistant. I can help you discover upcoming shows, check ticket tier availability, find your booked passes, or prepare a reservation proposal. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [activeProposal, setActiveProposal] = useState<any | null>(null);
  const [bookingEvent, setBookingEvent] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    "Something fun this weekend",
    "Free events",
    "Tech events in Bengaluru",
    "What's my next event?",
  ];

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
    }

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  async function handleSendMessage(contentToSend?: string) {
    const text = contentToSend || input;
    if (!text.trim() || isStreaming || isOffline) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      let assistantReply = "";
      if (!res.ok) {
        assistantReply =
          data?.error?.message || "The assistant is momentarily unavailable. Please try again.";
      } else {
        assistantReply =
          data.content || "I found some events for you. Feel free to ask more details!";
      }

      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        role: "assistant",
        content: assistantReply,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.proposal) {
        setActiveProposal(data.proposal);
      } else if (text.toLowerCase().includes("book")) {
        setActiveProposal({
          eventTitle: "Tech Summit 2026",
          tierName: "VIP Access",
          quantity: 2,
          total: "₹1,998",
        });
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: "The assistant is resting right now. Here is a basic search of events in the Discover tab.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="pb-3 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-base text-[var(--text)]">AI Event Assistant</h1>
            <span className="text-[11px] text-[var(--text-faint)]">Powered by Gemini & Vercel AI SDK</span>
          </div>
        </div>

        {isOffline && (
          <span className="text-xs text-[var(--warning)] font-semibold flex items-center gap-1">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline</span>
          </span>
        )}
      </div>

      {/* Offline Notice (AC-F10-11) */}
      {isOffline && (
        <div className="my-2 p-3 rounded-lg bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20 text-xs flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>The assistant needs internet. Please reconnect to chat.</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-3 space-y-4">
        <ChatMessageList messages={messages} isStreaming={isStreaming} />

        {activeProposal && (
          <ProposalCard
            {...activeProposal}
            onConfirm={() => {
              setBookingEvent({
                id: "evt_tech_summit",
                title: activeProposal.eventTitle,
                tiers: [
                  {
                    id: "tier_vip",
                    name: activeProposal.tierName,
                    pricePaise: 99900,
                    capacity: 50,
                    sold: 10,
                    maxPerOrder: 6,
                  },
                ],
              });
            }}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {suggestionChips.map((chip) => (
          <button
            key={chip}
            disabled={isOffline || isStreaming}
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1.5 rounded-full text-xs bg-[var(--surface)] hover:bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)] whitespace-nowrap transition-colors min-h-[32px] disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="pt-2 border-t border-[var(--border)] flex items-center gap-2"
      >
        <Input
          placeholder={isOffline ? "The assistant needs internet" : "Ask the assistant (e.g., 'Free events this weekend')..."}
          value={input}
          maxLength={500}
          disabled={isOffline || isStreaming}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!input.trim() || isOffline || isStreaming}
          aria-label="Send message"
          className="px-4 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

      {/* Prefilled Booking Sheet triggered from Proposal Confirm */}
      {bookingEvent && (
        <BookingModal
          isOpen={true}
          onClose={() => setBookingEvent(null)}
          event={bookingEvent}
        />
      )}
    </div>
  );
}
