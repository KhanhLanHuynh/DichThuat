import { Agent } from "@cursor/sdk";
import { CURSOR_MODEL, getCursorApiKey, getRepoCwd } from "./provider";

export async function runCursorAgent(
  system: string,
  user: string,
  onToken?: (token: string) => void
): Promise<string> {
  const agent = await Agent.create({
    apiKey: getCursorApiKey(),
    model: { id: CURSOR_MODEL },
    local: { cwd: getRepoCwd() },
  });

  try {
    const run = await agent.send(`${system}\n\n${user}`);
    let full = "";

    for await (const ev of run.stream()) {
      if (ev.type === "assistant") {
        for (const block of ev.message.content) {
          if (block.type === "text") {
            full += block.text;
            onToken?.(block.text);
          }
        }
      }
    }

    const result = await run.wait();
    if (result.status === "error") {
      throw new Error("Cursor agent run failed");
    }

    return (result.result ?? full).trim() || full.trim();
  } finally {
    await agent[Symbol.asyncDispose]();
  }
}

/** Extract a JSON array from agent output (may be wrapped in markdown fences). */
export function parseJsonArrayFromAgent(
  raw: string,
  expectedLength: number
): { lines: string[]; aligned: boolean; warning?: string } {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenceMatch?.[1] ?? trimmed).trim();

  try {
    const parsed = JSON.parse(candidate) as unknown;
    if (Array.isArray(parsed)) {
      const lines = parsed.map((item) =>
        typeof item === "string" ? item : String(item ?? "")
      );
      if (lines.length === expectedLength) {
        return { lines, aligned: true };
      }
      return {
        lines: padOrTrim(lines, expectedLength),
        aligned: false,
        warning: `Agent returned ${lines.length} lines · expected ${expectedLength}`,
      };
    }
  } catch {
    /* fall through */
  }

  const split = candidate.split("\n");
  if (split.length === expectedLength) {
    return { lines: split, aligned: true };
  }

  return {
    lines: padOrTrim(split, expectedLength),
    aligned: false,
    warning: `Could not parse JSON array; split into ${split.length} lines · expected ${expectedLength}`,
  };
}

function padOrTrim(lines: string[], n: number): string[] {
  if (lines.length >= n) return lines.slice(0, n);
  return [...lines, ...Array(n - lines.length).fill("")];
}
