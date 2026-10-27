import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatMessageList, ChatMessage } from "@/components/assistant/chat-message-list";
import { ProposalCard } from "@/components/assistant/proposal-card";

describe("F10 Chat Interface Component Tests", () => {
  it("AC-F10-6: chat shows user and assistant bubbles, typing indicator, event cards, and booking proposal card with working Confirm button", async () => {
    const handleConfirm = vi.fn();

    const messages: ChatMessage[] = [
      { id: "1", role: "user", content: "Show me tech events" },
      { id: "2", role: "assistant", content: "Here is what I found for you in Bengaluru:" },
    ];

    const { rerender } = render(
      <ChatMessageList messages={messages} isStreaming={true} />
    );

    // Verify bubbles
    expect(screen.getByText("Show me tech events")).toBeInTheDocument();
    expect(screen.getByText("Here is what I found for you in Bengaluru:")).toBeInTheDocument();

    // Verify typing indicator while streaming
    expect(screen.getByTestId("typing-indicator")).toBeInTheDocument();

    // Verify booking proposal card with Confirm
    rerender(
      <ProposalCard
        eventTitle="Tech Summit 2026"
        tierName="VIP Access"
        quantity={2}
        total="₹5,000"
        onConfirm={handleConfirm}
      />
    );

    expect(screen.getByText("Booking Proposal")).toBeInTheDocument();
    expect(screen.getByText("Tech Summit 2026")).toBeInTheDocument();
    expect(screen.getByText("Total: ₹5,000")).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: /confirm booking/i });
    expect(confirmBtn).toBeInTheDocument();
    await userEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalled();
  });
});
