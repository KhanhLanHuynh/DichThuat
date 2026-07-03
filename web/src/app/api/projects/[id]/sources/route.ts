import { NextRequest, NextResponse } from "next/server";
import {
  deleteSourceFile,
  loadChapter,
  loadProjectManifest,
  sanitizeSourceRelativePath,
  uploadSourceFile,
} from "@/lib/files";
import { getSessionUser, type AuthUser } from "@/lib/auth";

async function requireUser(): Promise<AuthUser | null> {
  const user = await getSessionUser();
  if (user) return user;
  if (process.env.AUTH_DISABLED === "1") {
    return { username: "dev", role: "admin" };
  }
  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const overwrite = req.nextUrl.searchParams.get("overwrite") === "1";

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const relativePathField = formData.get("relativePath");
  const relativePath =
    typeof relativePathField === "string" && relativePathField.trim()
      ? relativePathField.trim()
      : file.name;

  try {
    const manifest = await loadProjectManifest(id);
    const series = manifest.series;

    sanitizeSourceRelativePath(series, relativePath);

    const content = await file.text();

    const { sourcePath, sourceFiles } = await uploadSourceFile(
      series,
      relativePath,
      content,
      { overwrite }
    );

    const chapter = await loadChapter(id, sourcePath);

    return NextResponse.json({
      manifest,
      sourceFiles,
      currentSource: sourcePath,
      ...chapter,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    const code = e instanceof Error ? (e as Error & { code?: string }).code : undefined;
    if (code === "EXISTS") {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    if (
      message.includes("Invalid") ||
      message.includes("extension") ||
      message.includes("empty")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sourcePath = req.nextUrl.searchParams.get("source");
  if (!sourcePath?.trim()) {
    return NextResponse.json({ error: "Missing source path" }, { status: 400 });
  }

  try {
    const manifest = await loadProjectManifest(id);
    const { sourceFiles } = await deleteSourceFile(manifest.series, sourcePath);

    const nextSource = sourceFiles[0];
    if (nextSource) {
      const chapter = await loadChapter(id, nextSource);
      return NextResponse.json({
        manifest,
        sourceFiles,
        currentSource: nextSource,
        ...chapter,
      });
    }

    return NextResponse.json({
      manifest,
      sourceFiles: [],
      currentSource: "",
      sourcePath: "",
      resolvedHvPath: "",
      resolvedViPath: "",
      zhParagraphs: [],
      hvParagraphs: [],
      viParagraphs: [],
      alignment: { ok: true },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed";
    const code = e instanceof Error ? (e as Error & { code?: string }).code : undefined;
    if (code === "NOT_FOUND") {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    if (
      message.includes("Invalid") ||
      message.includes("extension") ||
      message.includes("under series")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
