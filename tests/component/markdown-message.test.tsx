import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MarkdownMessage } from "@/components/assistant/markdown-message";

describe("MarkdownMessage Component", () => {
  it("renders plain text paragraphs properly", () => {
    render(<MarkdownMessage content="Hello world, this is a plain message." />);
    expect(screen.getByText("Hello world, this is a plain message.")).toBeInTheDocument();
  });

  it("renders bold and italic tokens correctly without raw markdown asterisks", () => {
    const { container } = render(
      <MarkdownMessage content="Here is **bold text** and *italic text* and `inline code`." />
    );

    const strongEl = container.querySelector("strong");
    expect(strongEl).toBeInTheDocument();
    expect(strongEl?.textContent).toBe("bold text");

    const emEl = container.querySelector("em");
    expect(emEl).toBeInTheDocument();
    expect(emEl?.textContent).toBe("italic text");

    const codeEl = container.querySelector("code");
    expect(codeEl).toBeInTheDocument();
    expect(codeEl?.textContent).toBe("inline code");

    // Must not show raw markdown markers like '**' or '`'
    expect(container.textContent).not.toContain("**");
    expect(container.textContent).not.toContain("`");
  });

  it("renders real Gemini output with event titles and attributes cleanly", () => {
    const realGeminiOutput = `Here are the free events currently available in our catalog:

**Free Community Open Mic Night** (COMEDY)
* **City:** Bengaluru
* **Venue:** Koramangala Community Hall
* **Date:** 2026-11-01
* **Price:** Free

**Gurugram Open Source & Rust Developers Meetup** (TECH)
* **City:** Gurugram
* **Venue:** Cyber City Co-Working Space
* **Date:** 2026-11-05
* **Price:** Free`;

    const { container } = render(<MarkdownMessage content={realGeminiOutput} />);

    expect(screen.getByText("Here are the free events currently available in our catalog:")).toBeInTheDocument();
    expect(screen.getByText("Free Community Open Mic Night")).toBeInTheDocument();
    expect(screen.getByText("Gurugram Open Source & Rust Developers Meetup")).toBeInTheDocument();

    const listItems = container.querySelectorAll("li");
    expect(listItems.length).toBe(8);

    // Verify zero raw markdown markers remain in text
    expect(container.textContent).not.toContain("**");
    expect(container.textContent).not.toContain("* **");
  });
});
