import path from "path";

/** Web-owned corpus root (sources, translations, projects). */
export function getContentRoot(): string {
  return process.env.CONTENT_ROOT ?? path.join(process.cwd(), "data");
}

export function resolveContentPath(...segments: string[]): string {
  return path.join(getContentRoot(), ...segments);
}
