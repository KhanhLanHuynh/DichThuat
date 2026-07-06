import { NextRequest, NextResponse } from "next/server";
import { loadProjectManifest } from "@/lib/files";
import { getSessionUser, type AuthUser } from "@/lib/auth";
import {
  addGlossaryTerm,
  GlossaryTermExistsError,
  updateGlossaryTerm,
} from "@/lib/glossary-update";

async function requireUser(): Promise<AuthUser | null> {
  const user = await getSessionUser();
  if (user) return user;
  if (process.env.AUTH_DISABLED === "1") {
    return { username: "dev", role: "admin" };
  }
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    zh?: string;
    hv?: string;
    vi?: string;
  };

  const zh = body.zh?.trim();
  const hv = body.hv?.trim();
  const vi = body.vi?.trim();

  if (!zh) {
    return NextResponse.json({ error: "zh is required" }, { status: 400 });
  }
  if (!hv) {
    return NextResponse.json({ error: "hv is required" }, { status: 400 });
  }
  if (!vi) {
    return NextResponse.json({ error: "vi is required" }, { status: 400 });
  }

  try {
    const manifest = await loadProjectManifest(id);
    const glossaryPaths = manifest.glossary ?? ["glossary/terms.yaml"];
    const term = await updateGlossaryTerm(glossaryPaths, zh, hv, vi);
    return NextResponse.json({ term });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Glossary update failed" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    zh?: string;
    hv?: string;
    vi?: string;
  };

  const zh = body.zh?.trim();
  const hv = body.hv?.trim();
  const vi = body.vi?.trim();

  if (!zh) {
    return NextResponse.json({ error: "zh is required" }, { status: 400 });
  }
  if (!hv) {
    return NextResponse.json({ error: "hv is required" }, { status: 400 });
  }
  if (!vi) {
    return NextResponse.json({ error: "vi is required" }, { status: 400 });
  }

  try {
    const manifest = await loadProjectManifest(id);
    const glossaryPaths = manifest.glossary ?? ["glossary/terms.yaml"];
    const term = await addGlossaryTerm(
      glossaryPaths,
      manifest.series,
      zh,
      hv,
      vi
    );
    return NextResponse.json({ term }, { status: 201 });
  } catch (e) {
    if (e instanceof GlossaryTermExistsError) {
      return NextResponse.json(
        { error: e.message, existingTerm: e.existingTerm },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Glossary add failed" },
      { status: 500 }
    );
  }
}
