import matter from "gray-matter";
import { joinParagraphs, splitParagraphs } from "./paragraphs";

export interface ParsedMd {
  frontmatter: Record<string, unknown>;
  bodyParagraphs: string[];
  hadFrontmatter: boolean;
}

/** Parse .md: strip leading YAML frontmatter only (not mid-file ---). */
export function parseMdBody(raw: string): ParsedMd {
  const hadFrontmatter = raw.trimStart().startsWith("---");
  const { data, content } = matter(raw, { excerpt: false });
  return {
    frontmatter: data as Record<string, unknown>,
    bodyParagraphs: splitParagraphs(content),
    hadFrontmatter,
  };
}

export function serializeMdBody(
  frontmatter: Record<string, unknown>,
  bodyParagraphs: string[],
  hadFrontmatter: boolean
): string {
  const body = joinParagraphs(bodyParagraphs);
  if (!hadFrontmatter || Object.keys(frontmatter).length === 0) {
    return body;
  }
  return matter.stringify(body, frontmatter);
}

export function isMdPath(filePath: string): boolean {
  return filePath.endsWith(".md");
}
