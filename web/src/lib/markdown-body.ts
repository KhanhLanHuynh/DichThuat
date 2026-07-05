import matter from "gray-matter";
import { joinParagraphs, splitParagraphs } from "./paragraphs";

export interface ParsedMd {
  frontmatter: Record<string, unknown>;
  bodyContent: string;
  bodyParagraphs: string[];
  hadFrontmatter: boolean;
}

/** Parse .md: strip leading YAML frontmatter only (not mid-file ---). */
export function parseMdBody(raw: string): ParsedMd {
  const hadFrontmatter = raw.trimStart().startsWith("---");
  const { data, content } = matter(raw, { excerpt: false });
  const bodyContent = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return {
    frontmatter: data as Record<string, unknown>,
    bodyContent,
    bodyParagraphs: splitParagraphs(bodyContent),
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
