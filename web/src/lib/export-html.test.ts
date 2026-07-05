import { describe, it, expect } from "vitest";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { joinViBodyAndFootnotes } from "./footnotes";

async function markdownToHtml(markdown: string): Promise<string> {
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);
  return String(processed);
}

describe("HTML export footnote links", () => {
  it("renders clickable footnote ref and target ids", async () => {
    const md = joinViBodyAndFootnotes(
      ["Text with note[^1] here."],
      "[^1]: Footnote body."
    );
    const html = await markdownToHtml(md);

    expect(html).toContain('href="#user-content-fn-1"');
    expect(html).toContain('id="user-content-fn-1"');
    expect(html).toContain("Footnote body.");
  });
});
