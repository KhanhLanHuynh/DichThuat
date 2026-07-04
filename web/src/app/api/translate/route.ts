import { NextRequest } from "next/server";
import { joinParagraphs } from "@/lib/paragraphs";
import { loadChapter, loadProjectManifest, loadGlossaryTerms } from "@/lib/files";
import {
  buildHanVietPrompt,
  buildHanVietChapterPrompt,
  buildVietnamesePrompt,
  buildVietnameseChapterPrompt,
  filterGlossaryForText,
} from "@/lib/ai/prompt-context";
import { parseJsonArrayFromAgent, runCursorAgent } from "@/lib/ai/translate";
import { getSessionUser, type AuthUser } from "@/lib/auth";
import {
  updateGlossaryFromHanViet,
  updateGlossaryFromVietnamese,
} from "@/lib/glossary-update";

export const runtime = "nodejs";
export const maxDuration = 300;

async function requireUser(): Promise<AuthUser | null> {
  const user = await getSessionUser();
  if (user) return user;
  if (process.env.AUTH_DISABLED === "1") {
    return { username: "dev", role: "admin" };
  }
  return null;
}

interface TranslateBody {
  projectId: string;
  sourcePath?: string;
  layer: "hv" | "vi";
  scope?: "chapter" | "paragraph";
  paragraphIndex?: number;
  editorHv?: string[];
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = (await req.json()) as TranslateBody;

  const manifest = await loadProjectManifest(body.projectId);
  const sourcePath = body.sourcePath ?? manifest.source;
  const data = await loadChapter(body.projectId, sourcePath);
  const scope = body.scope ?? "chapter";

  const hvParagraphs = body.editorHv ?? data.hvParagraphs;
  const zhFull = joinParagraphs(data.zhParagraphs);
  const glossaryTerms = await loadGlossaryTerms(
    manifest.glossary ?? ["glossary/terms.yaml"]
  );
  const filteredGlossary = filterGlossaryForText(glossaryTerms, zhFull);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, payload: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)
        );
      };

      try {
        send("status", { phase: "preparing" });

        if (scope === "paragraph") {
          const index = body.paragraphIndex ?? 0;
          const zhLine = data.zhParagraphs[index] ?? "";
          const hvLine = hvParagraphs[index] ?? "";

          if (!zhLine.trim()) {
            send("paragraph", {
              paragraphIndex: index,
              text: "",
              layer: body.layer,
            });
            send("done", { layer: body.layer, total: 1 });
            return;
          }

          const prompt =
            body.layer === "hv"
              ? await buildHanVietPrompt({
                  zhLine,
                  glossary: filteredGlossary,
                  series: manifest.series,
                  sourcePath,
                })
              : await buildVietnamesePrompt({
                  zhLine,
                  hvLine,
                  glossary: filteredGlossary,
                  series: manifest.series,
                  sourcePath,
                });

          send("status", { phase: "translating" });

          const full = await runCursorAgent(
            prompt.system,
            prompt.user,
            (token) => {
              send("token", { paragraphIndex: index, token });
            }
          );

          send("paragraph", {
            paragraphIndex: index,
            text: full.trim(),
            layer: body.layer,
          });
          send("done", {
            layer: body.layer,
            total: 1,
            text: full,
            paragraphIndex: index,
          });
          return;
        }

        const total = data.zhParagraphs.length;
        send("progress", { index: 0, total });

        const chapterPrompt =
          body.layer === "hv"
            ? await buildHanVietChapterPrompt({
                zhParagraphs: data.zhParagraphs,
                glossary: filteredGlossary,
                series: manifest.series,
                sourcePath,
              })
            : await buildVietnameseChapterPrompt({
                zhParagraphs: data.zhParagraphs,
                hvParagraphs,
                glossary: filteredGlossary,
                series: manifest.series,
                sourcePath,
              });

        send("status", { phase: "translating" });

        const raw = await runCursorAgent(
          chapterPrompt.system,
          chapterPrompt.user
        );

        const { lines, aligned, warning } = parseJsonArrayFromAgent(
          raw,
          total
        );

        const hvResults: string[] = new Array(total).fill("");
        const viResults: string[] = new Array(total).fill("");

        send("status", { phase: "applying" });

        for (let i = 0; i < total; i++) {
          const trimmed = (lines[i] ?? "").trim();
          if (body.layer === "hv") {
            hvResults[i] = trimmed;
          } else {
            viResults[i] = trimmed;
          }
          send("paragraph", {
            paragraphIndex: i,
            text: trimmed,
            layer: body.layer,
          });
        }

        let glossaryAdded = 0;
        if (body.layer === "hv" || body.layer === "vi") {
          send("status", { phase: "glossary" });

          const glossaryResult =
            body.layer === "hv"
              ? await updateGlossaryFromHanViet({
                  zhParagraphs: data.zhParagraphs,
                  hvParagraphs: hvResults,
                  existingTerms: glossaryTerms,
                  series: manifest.series,
                })
              : await updateGlossaryFromVietnamese({
                  zhParagraphs: data.zhParagraphs,
                  hvParagraphs,
                  viParagraphs: viResults,
                  existingTerms: glossaryTerms,
                  series: manifest.series,
                });
          glossaryAdded = glossaryResult.added.length;
          send("glossary", {
            added: glossaryResult.added,
            count: glossaryAdded,
            warning: glossaryResult.warning,
          });
        }

        send("done", {
          layer: body.layer,
          total,
          glossaryAdded,
          alignmentWarning: aligned ? undefined : warning,
        });
      } catch (e) {
        send("error", {
          message: e instanceof Error ? e.message : "Translation failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
