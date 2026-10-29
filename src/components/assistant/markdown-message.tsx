import React from "react";

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
}

// Inline formatting parser
function parseInline(text: string, isUser?: boolean): React.ReactNode {
  if (!text) return null;

  // Regex to match bold (***, **, __), code (`), links ([text](url)), italic (*, _)
  const tokenRegex = /(\*\*\*[\s\S]+?\*\*\*|\*\*[\s\S]+?\*\*|__[\s\S]+?__|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*|_[^_]+_)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold + Italic: ***text***
    if (part.startsWith("***") && part.endsWith("***") && part.length >= 6) {
      const inner = part.slice(3, -3);
      return (
        <strong key={index} className="font-bold italic">
          {parseInline(inner, isUser)}
        </strong>
      );
    }

    // Bold: **text** or __text__
    if (
      (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
      (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
    ) {
      const inner = part.slice(2, -2);
      return (
        <strong
          key={index}
          className={
            isUser
              ? "font-semibold text-white"
              : "font-semibold text-[var(--text)] tracking-tight"
          }
        >
          {parseInline(inner, isUser)}
        </strong>
      );
    }

    // Inline code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          className={
            isUser
              ? "px-1.5 py-0.5 rounded text-xs font-mono bg-white/20 text-white"
              : "px-1.5 py-0.5 rounded text-xs font-mono bg-[var(--surface)] text-[var(--accent)] border border-[var(--border)]"
          }
        >
          {inner}
        </code>
      );
    }

    // Links: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={
            isUser
              ? "underline hover:opacity-80"
              : "text-[var(--accent)] hover:underline font-medium"
          }
        >
          {label}
        </a>
      );
    }

    // Italic: *text* or _text_
    if (
      (part.startsWith("*") && part.endsWith("*") && part.length >= 2) ||
      (part.startsWith("_") && part.endsWith("_") && part.length >= 2)
    ) {
      const inner = part.slice(1, -1);
      return (
        <em key={index} className="italic">
          {parseInline(inner, isUser)}
        </em>
      );
    }

    return part;
  });
}

type Block =
  | { type: "code"; content: string; lang?: string }
  | { type: "heading"; level: number; text: string }
  | { type: "blockquote"; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; lines: string[] };

function tokenizeBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];

  let inCode = false;
  let codeBuffer: string[] = [];
  let currentParagraph: string[] = [];
  let currentList: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: "paragraph", lines: [...currentParagraph] });
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: "list", items: [...currentList] });
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block toggle
    if (trimmed.startsWith("```")) {
      if (inCode) {
        blocks.push({ type: "code", content: codeBuffer.join("\n") });
        codeBuffer = [];
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Empty line separates blocks
    if (trimmed === "") {
      flushParagraph();
      flushList();
      continue;
    }

    // Heading
    if (trimmed.startsWith("#")) {
      flushParagraph();
      flushList();
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const text = trimmed.replace(/^#+\s*/, "");
      blocks.push({ type: "heading", level, text });
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "blockquote", text: trimmed.replace(/^>\s*/, "") });
      continue;
    }

    // List item (e.g., "* ", "- ", "• ", "+ ", or "1. ")
    const listMatch = trimmed.match(/^([*•\-+]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      currentList.push(listMatch[2]);
      continue;
    }

    // Normal text line
    flushList();
    currentParagraph.push(rawLine);
  }

  flushParagraph();
  flushList();

  return blocks;
}

export function MarkdownMessage({ content, isUser = false }: MarkdownMessageProps) {
  if (!content) return null;

  const blocks = tokenizeBlocks(content);

  return (
    <div className="space-y-3 leading-relaxed text-sm">
      {blocks.map((block, idx) => {
        if (block.type === "code") {
          return (
            <pre
              key={idx}
              className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] font-mono text-xs overflow-x-auto text-[var(--text)] my-2"
            >
              <code>{block.content}</code>
            </pre>
          );
        }

        if (block.type === "heading") {
          if (block.level === 1) {
            return (
              <h2
                key={idx}
                className="font-bold text-base text-[var(--text)] pt-1 border-b border-[var(--border)] pb-1"
              >
                {parseInline(block.text, isUser)}
              </h2>
            );
          }
          if (block.level === 2) {
            return (
              <h3
                key={idx}
                className="font-bold text-sm sm:text-base text-[var(--text)] pt-1"
              >
                {parseInline(block.text, isUser)}
              </h3>
            );
          }
          return (
            <h4
              key={idx}
              className="font-semibold text-sm text-[var(--text)] pt-0.5"
            >
              {parseInline(block.text, isUser)}
            </h4>
          );
        }

        if (block.type === "blockquote") {
          return (
            <blockquote
              key={idx}
              className="border-l-2 border-[var(--accent)] pl-3 italic text-[var(--text-muted)] text-xs sm:text-sm my-1"
            >
              {parseInline(block.text, isUser)}
            </blockquote>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={idx} className="space-y-1.5 my-1 text-sm list-none pl-0">
              {block.items.map((item, itemIdx) => {
                const isTitleLine =
                  item.startsWith("**") &&
                  !item.includes(":**") &&
                  !item.startsWith("**City") &&
                  !item.startsWith("**Venue") &&
                  !item.startsWith("**Date") &&
                  !item.startsWith("**Price");

                return (
                  <li
                    key={itemIdx}
                    className={
                      isTitleLine
                        ? "pt-1.5 pb-0.5 font-medium flex items-start gap-2"
                        : "flex items-start gap-2 text-[var(--text-muted)] pl-2"
                    }
                  >
                    <span
                      className={
                        isTitleLine
                          ? "w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 shrink-0"
                          : "w-1 h-1 rounded-full bg-[var(--text-faint)] mt-2 shrink-0"
                      }
                    />
                    <span className={isTitleLine ? "text-[var(--text)]" : ""}>
                      {parseInline(item, isUser)}
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Paragraph
        return (
          <p key={idx} className="leading-relaxed">
            {block.lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {lineIdx > 0 && <br />}
                {parseInline(line, isUser)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
