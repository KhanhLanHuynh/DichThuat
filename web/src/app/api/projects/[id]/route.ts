import { NextRequest, NextResponse } from "next/server";
import {
  loadProject,
  loadChapter,
  loadProjectManifest,
  listProjectSourceFiles,
  saveProjectTranslations,
  loadGlossaryTerms,
} from "@/lib/files";
import { getSessionUser, type AuthUser } from "@/lib/auth";
import { getLock } from "@/lib/locks";

async function requireUser(): Promise<AuthUser | null> {
  const user = await getSessionUser();
  if (user) return user;
  if (process.env.AUTH_DISABLED === "1") {
    return { username: "dev", role: "admin" };
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const source = req.nextUrl.searchParams.get("source");
  try {
    let data;
    if (source) {
      const manifest = await loadProjectManifest(id);
      const sourceFiles = await listProjectSourceFiles(manifest.series);
      const chapter = await loadChapter(id, source);
      data = { manifest, sourceFiles, currentSource: source, ...chapter };
    } else {
      data = await loadProject(id);
    }
    const manifest = data.manifest;
    const terms = await loadGlossaryTerms(
      manifest.glossary ?? ["glossary/terms.yaml"]
    );
    const lock = await getLock(id);
    const user = await requireUser();
    return NextResponse.json({ ...data, terms, lock, user });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Not found" },
      { status: 404 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as {
    sourcePath: string;
    hvParagraphs: string[];
    viParagraphs: string[];
  };
  try {
    const data = await saveProjectTranslations(
      id,
      body.sourcePath,
      body.hvParagraphs,
      body.viParagraphs
    );
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
