import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyCredentials,
  createSession,
  COOKIE_NAME,
  getSessionUser,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { username: string; password: string };
  const user = verifyCredentials(body.username, body.password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = await createSession(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return NextResponse.json({ user });
}

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
