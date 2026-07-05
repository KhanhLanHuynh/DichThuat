"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { buildViMarkdownForRender } from "@/lib/footnotes";

interface FootnotePreviewProps {
  bodyParagraphs: string[];
  footnoteBlock: string;
  className?: string;
  onFootnoteClick?: (id: string, anchor: DOMRect) => void;
}

function footnoteIdFromHref(href: string): string | null {
  const match = href.match(/^#user-content-fn-(.+)$/);
  return match ? match[1] : null;
}

export function FootnotePreview({
  bodyParagraphs,
  footnoteBlock,
  className = "",
  onFootnoteClick,
}: FootnotePreviewProps) {
  const markdown = useMemo(
    () => buildViMarkdownForRender(bodyParagraphs, footnoteBlock),
    [bodyParagraphs, footnoteBlock]
  );

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onFootnoteClick) return;
    const target = e.target as HTMLElement;
    const link = target.closest('a[href^="#user-content-fn-"]');
    if (!link) return;
    e.preventDefault();
    const id = footnoteIdFromHref(link.getAttribute("href") ?? "");
    if (!id) return;
    onFootnoteClick(id, link.getBoundingClientRect());
  };

  if (!markdown.trim()) {
    return (
      <div className={`flex h-full items-center justify-center text-sm text-muted ${className}`}>
        (empty)
      </div>
    );
  }

  return (
    <div
      className={`footnote-preview overflow-auto px-4 py-3 ${className}`}
      onClick={handleClick}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
