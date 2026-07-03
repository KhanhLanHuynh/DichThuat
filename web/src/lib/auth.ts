import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type UserRole = "translator" | "reviewer" | "admin";

export interface AuthUser {
  username: string;
  role: UserRole;
}

const COOKIE_NAME = "dichthuat_session";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

/** Parse AUTH_USERS env: "lan:translator,mai:reviewer" */
export function parseAuthUsers(): Map<string, UserRole> {
  const raw = process.env.AUTH_USERS ?? "admin:admin";
  const map = new Map<string, UserRole>();
  for (const part of raw.split(",")) {
    const [user, role] = part.trim().split(":");
    if (user && role) {
      map.set(user, role as UserRole);
    }
  }
  return map;
}

export function verifyCredentials(
  username: string,
  password: string
): AuthUser | null {
  const users = parseAuthUsers();
  const expectedPassword = process.env.AUTH_PASSWORD ?? "dichthuat";
  if (!users.has(username) || password !== expectedPassword) return null;
  return { username, role: users.get(username)! };
}

export async function createSession(user: AuthUser): Promise<string> {
  return new SignJWT({ username: user.username, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      username: payload.username as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
