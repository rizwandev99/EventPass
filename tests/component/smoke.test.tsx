import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

function SmokeComponent({ title }: { title: string }) {
  return (
    <div data-testid="smoke-container" className="p-4 bg-surface text-text">
      <h1 className="text-xl font-bold">{title}</h1>
      <p>EventPass mobile-first ticketing harness</p>
    </div>
  );
}

describe("EventPass Component Smoke Suite", () => {
  it("renders React component in JSDOM environment", () => {
    render(<SmokeComponent title="Welcome to EventPass" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Welcome to EventPass");
    const container = screen.getByTestId("smoke-container");
    expect(container).toBeInTheDocument();
  });
});
