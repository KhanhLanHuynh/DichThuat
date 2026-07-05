import { NextRequest, NextResponse } from "next/server";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import {
  loadChapter,
  loadProjectManifest,
} from "@/lib/files";
import { joinViBodyAndFootnotes } from "@/lib/footnotes";
import { getSessionUser, type AuthUser } from "@/lib/auth";

async function requireUser(): Promise<AuthUser | null> {
  const user = await getSessionUser();
  if (user) return user;
  if (process.env.AUTH_DISABLED === "1") {
    return { username: "dev", role: "admin" };
  }
  return null;
}

const HTML_SHELL = (body: string) => `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>VI export</title>
  <style>
    body { font-family: "Noto Serif", "Times New Roman", serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.65; }
    sup { font-size: 0.75em; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
    section.footnotes,
    section[data-footnotes] {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e2e5ea;
      font-size: 0.875rem;
      color: #6b7280;
    }
    section[data-footnotes] ol { padding-left: 1.25em; }
    section[data-footnotes] li { margin-bottom: 0.35em; }
  </style>
</head>
<body>
${body}
</body>
</html>`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const format = req.nextUrl.searchParams.get("format") ?? "html";
  const source = req.nextUrl.searchParams.get("source");

  if (!source) {
    return NextResponse.json({ error: "Missing source parameter" }, { status: 400 });
  }

  if (format !== "html") {
    return NextResponse.json(
      { error: "Unsupported format; use html" },
      { status: 400 }
    );
  }

  try {
    await loadProjectManifest(id);
    const chapter = await loadChapter(id, source);
    const markdown = joinViBodyAndFootnotes(
      chapter.viParagraphs,
      chapter.viFootnotes
    );

    const processed = await remark()
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(markdown);
    const html = HTML_SHELL(String(processed));

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="export.vi.html"`,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Export failed" },
      { status: 500 }
    );
  }
}
