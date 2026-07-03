import { NextRequest, NextResponse } from "next/server";
import { acquireLock, releaseLock } from "@/lib/locks";
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
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await acquireLock(id, user.username);
  if (!result.ok) {
    return NextResponse.json({ error: "Locked", holder: result.holder }, { status: 423 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await releaseLock(id, user.username);
  return NextResponse.json({ ok: true });
}
