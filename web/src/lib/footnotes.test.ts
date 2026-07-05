import { describe, it, expect } from "vitest";
import {
  splitViBodyAndFootnotes,
  joinViBodyAndFootnotes,
  validateFootnoteRefs,
  nextFootnoteId,
  insertFootnoteMarker,
  parseFootnoteDefinitions,
  findFootnoteRefAtPos,
  updateFootnoteDefinition,
  removeFootnoteRefsFromText,
  removeFootnoteRefsFromParagraphs,
  FOOTNOTES_MARKER,
} from "./footnotes";

describe("splitViBodyAndFootnotes", () => {
  it("returns body-only when no footnotes", () => {
    const { bodyParagraphs, footnoteBlock } = splitViBodyAndFootnotes(
      "Line one\nLine two"
    );
    expect(bodyParagraphs).toEqual(["Line one", "Line two"]);
    expect(footnoteBlock).toBe("");
  });

  it("splits on marker", () => {
    const raw = `Body line[^1]

${FOOTNOTES_MARKER}
[^1]: Note text.`;
    const { bodyParagraphs, footnoteBlock } = splitViBodyAndFootnotes(raw);
    expect(bodyParagraphs).toEqual(["Body line[^1]"]);
    expect(footnoteBlock).toBe("[^1]: Note text.");
  });

  it("splits legacy trailing definitions", () => {
    const raw = "Body line[^1]\n\n[^1]: Legacy note.";
    const { bodyParagraphs, footnoteBlock } = splitViBodyAndFootnotes(raw);
    expect(bodyParagraphs).toEqual(["Body line[^1]"]);
    expect(footnoteBlock).toBe("[^1]: Legacy note.");
  });
});

describe("joinViBodyAndFootnotes", () => {
  it("round-trips with marker", () => {
    const body = ["Line one", "Line two[^1]"];
    const fn = "[^1]: Note.";
    const joined = joinViBodyAndFootnotes(body, fn);
    const split = splitViBodyAndFootnotes(joined);
    expect(split.bodyParagraphs).toEqual(body);
    expect(split.footnoteBlock).toBe(fn);
  });

  it("returns body only when footnote block empty", () => {
    expect(joinViBodyAndFootnotes(["A"], "")).toBe("A");
  });
});

describe("validateFootnoteRefs", () => {
  it("passes when refs match definitions", () => {
    const result = validateFootnoteRefs("text[^1]", "[^1]: ok");
    expect(result.ok).toBe(true);
    expect(result.orphans).toEqual([]);
  });

  it("detects orphan refs", () => {
    const result = validateFootnoteRefs("text[^9]", "[^1]: ok");
    expect(result.ok).toBe(false);
    expect(result.orphans).toEqual(["9"]);
  });

  it("detects empty definitions", () => {
    const result = validateFootnoteRefs("text[^1]", "[^1]: ");
    expect(result.ok).toBe(false);
    expect(result.empty).toEqual(["1"]);
  });
});

describe("nextFootnoteId", () => {
  it("returns 1 when none exist", () => {
    expect(nextFootnoteId("", "")).toBe("1");
  });

  it("returns 2 when [^1] exists", () => {
    expect(nextFootnoteId("word[^1]", "[^1]: note")).toBe("2");
  });
});

describe("insertFootnoteMarker", () => {
  it("inserts after selection end", () => {
    const text = "Hello world";
    const result = insertFootnoteMarker(text, 5, 5, "1");
    expect(result).toBe("Hello[^1] world");
  });

  it("inserts after selected range", () => {
    const text = "Hello world";
    const result = insertFootnoteMarker(text, 0, 5, "1");
    expect(result).toBe("Hello[^1] world");
  });
});

describe("findFootnoteRefAtPos", () => {
  const text = "Hello[^1] world[^2]!";

  it("returns match when pos is inside marker", () => {
    expect(findFootnoteRefAtPos(text, 7)).toEqual({
      id: "1",
      from: 5,
      to: 9,
    });
  });

  it("returns match at marker boundaries", () => {
    expect(findFootnoteRefAtPos(text, 5)?.id).toBe("1");
    expect(findFootnoteRefAtPos(text, 8)?.id).toBe("1");
    expect(findFootnoteRefAtPos(text, 9)?.id).toBe("1");
  });

  it("returns correct match for adjacent refs", () => {
    expect(findFootnoteRefAtPos(text, 17)?.id).toBe("2");
  });

  it("returns null outside any marker", () => {
    expect(findFootnoteRefAtPos(text, 0)).toBeNull();
    expect(findFootnoteRefAtPos(text, 3)).toBeNull();
    expect(findFootnoteRefAtPos(text, 11)).toBeNull();
  });

  it("does not match definition lines", () => {
    expect(findFootnoteRefAtPos("[^1]: note", 2)).toBeNull();
  });
});

describe("parseFootnoteDefinitions", () => {
  it("parses multiple lines", () => {
    const defs = parseFootnoteDefinitions("[^1]: A\n[^2]: B");
    expect(defs).toEqual([
      { id: "1", text: "A" },
      { id: "2", text: "B" },
    ]);
  });

  it("preserves internal spaces in footnote text", () => {
    const defs = parseFootnoteDefinitions("[^1]: hello world");
    expect(defs).toEqual([{ id: "1", text: "hello world" }]);
  });

  it("preserves trailing space in footnote text", () => {
    const defs = parseFootnoteDefinitions("[^1]: hello ");
    expect(defs).toEqual([{ id: "1", text: "hello " }]);
  });

  it("round-trips multi-word text via updateFootnoteDefinition", () => {
    const block = updateFootnoteDefinition("", "1", "word1 word2");
    const defs = parseFootnoteDefinitions(block);
    expect(defs).toEqual([{ id: "1", text: "word1 word2" }]);
  });
});

describe("removeFootnoteRefsFromText", () => {
  it("removes a single inline marker", () => {
    expect(removeFootnoteRefsFromText("text[^1] here", "1")).toBe("text here");
  });

  it("removes multiple markers with the same id", () => {
    expect(removeFootnoteRefsFromText("a[^1]b[^1]c", "1")).toBe("abc");
  });

  it("does not remove other ids", () => {
    expect(removeFootnoteRefsFromText("a[^1]b[^2]c", "1")).toBe("ab[^2]c");
  });

  it("does not strip definition syntax", () => {
    expect(removeFootnoteRefsFromText("[^1]: note", "1")).toBe("[^1]: note");
  });
});

describe("removeFootnoteRefsFromParagraphs", () => {
  it("strips matching id across paragraphs only", () => {
    const result = removeFootnoteRefsFromParagraphs(
      ["line[^1] one", "line[^2] two", "again[^1]"],
      "1"
    );
    expect(result).toEqual(["line one", "line[^2] two", "again"]);
  });
});
