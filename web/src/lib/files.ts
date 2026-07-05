import fs from "fs/promises";
import path from "path";
import YAML from "yaml";
import { resolveContentPath } from "./content-root";
import { resolveRepoPath } from "./repo-root";
import type { GlossaryTerm } from "./glossary";
import {
  checkAlignment,
  joinParagraphs,
  splitParagraphs,
  alignParagraphArrays,
} from "./paragraphs";
import {
  isMdPath,
  parseMdBody,
  serializeMdBody,
} from "./markdown-body";
import {
  joinViBodyAndFootnotes,
  splitViBodyAndFootnotes,
} from "./footnotes";

export interface ProjectManifest {
  id: string;
  title: string;
  series: string;
  volume?: string;
  chapter?: string;
  source: string;
  hv: string;
  vi: string;
  glossary?: string[];
  status?: string;
  source_edition?: string;
}

export interface ProjectSummary {
  id: string;
  title: string;
  series: string;
  status?: string;
}

export interface ChapterData {
  sourcePath: string;
  resolvedHvPath: string;
  resolvedViPath: string;
  zhParagraphs: string[];
  hvParagraphs: string[];
  viParagraphs: string[];
  viFootnotes: string;
  alignment: ReturnType<typeof checkAlignment>;
  lastSaved?: { zh?: string; hv?: string; vi?: string };
}

export interface ProjectData extends ChapterData {
  manifest: ProjectManifest;
  sourceFiles: string[];
  currentSource: string;
}

interface TranslationFileState {
  path: string;
  frontmatter: Record<string, unknown>;
  hadFrontmatter: boolean;
}

const mdCache = new Map<string, TranslationFileState>();

function mdCacheKey(
  projectId: string,
  sourcePath: string,
  layer: "hv" | "vi"
): string {
  return `${projectId}:${sourcePath}:${layer}`;
}

async function contentFileExists(relPath: string): Promise<boolean> {
  try {
    await fs.access(resolveContentPath(relPath));
    return true;
  } catch {
    return false;
  }
}

/** Sanitize a relative path under sources/{series}/. */
export function sanitizeSourceRelativePath(
  series: string,
  relativePath: string
): string {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) {
    throw new Error("Invalid relative path");
  }
  const segments = normalized.split("/").filter(Boolean);
  if (segments.some((s) => s === "..")) {
    throw new Error("Invalid relative path");
  }
  const basename = segments[segments.length - 1] ?? "";
  if (!/\.zh\.md$/i.test(basename)) {
    throw new Error("Source file must have .zh.md extension");
  }
  const expectedPrefix = `sources/${series}/`;
  const fullLogical = `${expectedPrefix}${normalized}`;
  if (!fullLogical.startsWith(expectedPrefix)) {
    throw new Error("Path must be under series");
  }
  return normalized;
}

export function sourcePathForSeries(
  series: string,
  relativePath: string
): string {
  const rel = sanitizeSourceRelativePath(series, relativePath);
  return `sources/${series}/${rel}`.replace(/\\/g, "/");
}

/** Derive HV/VI paths from a source path by convention. */
export function deriveTranslationPaths(sourcePath: string): {
  hv: string;
  vi: string;
} {
  const base = sourcePath
    .replace(/^sources\//, "translations/")
    .replace(/\.zh\.md$/i, "");
  return { hv: `${base}.hv.md`, vi: `${base}.vi.md` };
}

/** List all *.zh.md under sources/{series}/ recursively. */
export async function listProjectSourceFiles(series: string): Promise<string[]> {
  const baseDir = resolveContentPath("sources", series);
  const results: string[] = [];

  async function walk(dir: string, relFromSeries: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const childRel = relFromSeries
        ? `${relFromSeries}/${entry.name}`
        : entry.name;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath, childRel);
      } else if (entry.isFile() && /\.zh\.md$/i.test(entry.name)) {
        results.push(`sources/${series}/${childRel}`.replace(/\\/g, "/"));
      }
    }
  }

  await walk(baseDir, "");
  return results.sort();
}

/** Prefer .md sibling when it exists on disk. */
export async function resolveTranslationPath(
  manifestPath: string
): Promise<string> {
  if (manifestPath.endsWith(".md")) {
    if (await contentFileExists(manifestPath)) return manifestPath;
    return manifestPath;
  }
  const mdPath = manifestPath.replace(/\.txt$/i, ".md");
  if (await contentFileExists(mdPath)) return mdPath;
  return manifestPath;
}

async function readContentFile(relPath: string): Promise<string> {
  const full = resolveContentPath(relPath);
  try {
    return await fs.readFile(full, "utf-8");
  } catch {
    return "";
  }
}

export async function readRepoFile(relPath: string): Promise<string> {
  const full = resolveRepoPath(relPath);
  try {
    return await fs.readFile(full, "utf-8");
  } catch {
    return "";
  }
}

async function writeContentFile(
  relPath: string,
  content: string
): Promise<void> {
  const full = resolveContentPath(relPath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, "utf-8");
}

async function contentFileMtime(relPath: string): Promise<string | undefined> {
  try {
    const stat = await fs.stat(resolveContentPath(relPath));
    return stat.mtime.toISOString();
  } catch {
    return undefined;
  }
}

function loadViFromRaw(raw: string): {
  paragraphs: string[];
  footnoteBlock: string;
} {
  const parsed = parseMdBody(raw);
  const split = splitViBodyAndFootnotes(parsed.bodyContent);
  return { paragraphs: split.bodyParagraphs, footnoteBlock: split.footnoteBlock };
}

function loadParagraphsFromRaw(
  relPath: string,
  raw: string,
  projectId: string,
  sourcePath: string,
  layer: "hv" | "vi"
): string[] {
  if (isMdPath(relPath)) {
    const parsed = parseMdBody(raw);
    mdCache.set(mdCacheKey(projectId, sourcePath, layer), {
      path: relPath,
      frontmatter: parsed.frontmatter,
      hadFrontmatter: parsed.hadFrontmatter,
    });
    if (layer === "vi") {
      return loadViFromRaw(raw).paragraphs;
    }
    return parsed.bodyParagraphs;
  }
  mdCache.delete(mdCacheKey(projectId, sourcePath, layer));
  return splitParagraphs(raw);
}

function loadViFootnotesFromRaw(relPath: string, raw: string): string {
  if (!isMdPath(relPath)) return "";
  return loadViFromRaw(raw).footnoteBlock;
}

function loadZhParagraphsFromRaw(relPath: string, raw: string): string[] {
  if (isMdPath(relPath)) {
    return parseMdBody(raw).bodyParagraphs;
  }
  return splitParagraphs(raw);
}

async function writeTranslationFile(
  projectId: string,
  sourcePath: string,
  layer: "hv" | "vi",
  relPath: string,
  paragraphs: string[],
  viFootnotes?: string
): Promise<void> {
  if (isMdPath(relPath)) {
    const cached = mdCache.get(mdCacheKey(projectId, sourcePath, layer));
    const bodyContent =
      layer === "vi"
        ? joinViBodyAndFootnotes(paragraphs, viFootnotes ?? "")
        : joinParagraphs(paragraphs);
    const content = serializeMdBody(
      cached?.frontmatter ?? {},
      splitParagraphs(bodyContent),
      cached?.hadFrontmatter ?? false
    );
    await writeContentFile(relPath, content);
  } else {
    await writeContentFile(relPath, joinParagraphs(paragraphs));
  }
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const dir = resolveContentPath("projects");
  try {
    const files = await fs.readdir(dir);
    const projects: ProjectSummary[] = [];
    for (const file of files) {
      if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;
      const raw = await fs.readFile(path.join(dir, file), "utf-8");
      const manifest = YAML.parse(raw) as ProjectManifest;
      const id = manifest.id ?? file.replace(/\.ya?ml$/, "");
      projects.push({
        id,
        title: manifest.title ?? id,
        series: manifest.series ?? id,
        status: manifest.status,
      });
    }
    return projects;
  } catch {
    return [];
  }
}

export async function loadProjectManifest(id: string): Promise<ProjectManifest> {
  const yamlPath = resolveContentPath("projects", `${id}.yaml`);
  const raw = await fs.readFile(yamlPath, "utf-8");
  const manifest = YAML.parse(raw) as ProjectManifest;
  manifest.id = manifest.id ?? id;
  return manifest;
}

export async function loadChapter(
  id: string,
  sourcePath: string
): Promise<ChapterData> {
  const derived = deriveTranslationPaths(sourcePath);
  const resolvedHvPath = await resolveTranslationPath(derived.hv);
  const resolvedViPath = await resolveTranslationPath(derived.vi);

  const zhRaw = await readContentFile(sourcePath);
  const hvExists = await contentFileExists(resolvedHvPath);
  const viExists = await contentFileExists(resolvedViPath);
  const hvRaw = hvExists ? await readContentFile(resolvedHvPath) : "";
  const viRaw = viExists ? await readContentFile(resolvedViPath) : "";

  const zhParagraphsRaw = loadZhParagraphsFromRaw(sourcePath, zhRaw);
  const hvParagraphsRaw = hvExists
    ? loadParagraphsFromRaw(resolvedHvPath, hvRaw, id, sourcePath, "hv")
    : zhParagraphsRaw.map(() => "");
  const viParagraphsRaw = viExists
    ? loadParagraphsFromRaw(resolvedViPath, viRaw, id, sourcePath, "vi")
    : zhParagraphsRaw.map(() => "");
  const viFootnotes = viExists ? loadViFootnotesFromRaw(resolvedViPath, viRaw) : "";

  const alignment = checkAlignment(
    zhParagraphsRaw,
    hvParagraphsRaw,
    viParagraphsRaw
  );
  const aligned = alignParagraphArrays(
    zhParagraphsRaw,
    hvParagraphsRaw,
    viParagraphsRaw
  );

  return {
    sourcePath,
    resolvedHvPath,
    resolvedViPath,
    zhParagraphs: aligned.zh,
    hvParagraphs: aligned.hv,
    viParagraphs: aligned.vi,
    viFootnotes,
    alignment,
    lastSaved: {
      zh: await contentFileMtime(sourcePath),
      hv: hvExists ? await contentFileMtime(resolvedHvPath) : undefined,
      vi: viExists ? await contentFileMtime(resolvedViPath) : undefined,
    },
  };
}

async function buildProjectData(
  id: string,
  sourcePath: string
): Promise<ProjectData> {
  const manifest = await loadProjectManifest(id);
  const sourceFiles = await listProjectSourceFiles(manifest.series);
  const chapter = await loadChapter(id, sourcePath);
  return {
    manifest,
    sourceFiles,
    currentSource: sourcePath,
    ...chapter,
  };
}

export async function loadProject(id: string): Promise<ProjectData> {
  const manifest = await loadProjectManifest(id);
  return buildProjectData(id, manifest.source);
}

export async function saveProjectTranslations(
  id: string,
  sourcePath: string,
  hvParagraphs: string[],
  viParagraphs: string[],
  viFootnotes = ""
): Promise<ProjectData> {
  const derived = deriveTranslationPaths(sourcePath);
  const resolvedHvPath = await resolveTranslationPath(derived.hv);
  const resolvedViPath = await resolveTranslationPath(derived.vi);

  const zhRaw = await readContentFile(sourcePath);
  const zhParagraphs = loadZhParagraphsFromRaw(sourcePath, zhRaw);

  if (await contentFileExists(resolvedHvPath)) {
    const hvRaw = await readContentFile(resolvedHvPath);
    loadParagraphsFromRaw(resolvedHvPath, hvRaw, id, sourcePath, "hv");
  }
  if (await contentFileExists(resolvedViPath)) {
    const viRaw = await readContentFile(resolvedViPath);
    loadParagraphsFromRaw(resolvedViPath, viRaw, id, sourcePath, "vi");
  }

  const aligned = alignParagraphArrays(
    zhParagraphs,
    hvParagraphs,
    viParagraphs
  );

  await writeTranslationFile(
    id,
    sourcePath,
    "hv",
    resolvedHvPath,
    aligned.hv
  );
  await writeTranslationFile(
    id,
    sourcePath,
    "vi",
    resolvedViPath,
    aligned.vi,
    viFootnotes
  );

  return buildProjectData(id, sourcePath);
}

export async function loadGlossaryTerms(paths: string[]): Promise<GlossaryTerm[]> {
  const { parseGlossaryYaml } = await import("./glossary");
  const all: GlossaryTerm[] = [];
  for (const p of paths) {
    const raw = await readContentFile(p);
    if (raw.trim()) all.push(...parseGlossaryYaml(raw));
  }
  const map = new Map<string, GlossaryTerm>();
  for (const t of all) {
    if (t.zh) map.set(t.zh, t);
  }
  return [...map.values()];
}

export interface UploadSourceResult {
  sourcePath: string;
  sourceFiles: string[];
}

export async function uploadSourceFile(
  series: string,
  relativePath: string,
  content: string,
  options?: { overwrite?: boolean }
): Promise<UploadSourceResult> {
  if (!content.trim()) {
    throw new Error("Source file cannot be empty");
  }

  const sourcePath = sourcePathForSeries(series, relativePath);

  if (!options?.overwrite && (await contentFileExists(sourcePath))) {
    const err = new Error("Source file already exists");
    (err as Error & { code?: string }).code = "EXISTS";
    throw err;
  }

  await writeContentFile(sourcePath, content);
  const sourceFiles = await listProjectSourceFiles(series);
  return { sourcePath, sourceFiles };
}

export interface DeleteSourceResult {
  deletedSource: string;
  sourceFiles: string[];
}

function validateSourcePathForSeries(
  series: string,
  sourcePath: string
): void {
  const expectedPrefix = `sources/${series}/`;
  const normalized = sourcePath.replace(/\\/g, "/");
  if (!normalized.startsWith(expectedPrefix)) {
    throw new Error("Path must be under series");
  }
  const basename = normalized.split("/").pop() ?? "";
  if (!/\.zh\.md$/i.test(basename)) {
    throw new Error("Source file must have .zh.md extension");
  }
  if (normalized.includes("..")) {
    throw new Error("Invalid relative path");
  }
}

async function unlinkContentFileIfExists(relPath: string): Promise<void> {
  if (!(await contentFileExists(relPath))) return;
  await fs.unlink(resolveContentPath(relPath));
}

export async function deleteSourceFile(
  series: string,
  sourcePath: string
): Promise<DeleteSourceResult> {
  validateSourcePathForSeries(series, sourcePath);

  if (!(await contentFileExists(sourcePath))) {
    const err = new Error("Source file not found");
    (err as Error & { code?: string }).code = "NOT_FOUND";
    throw err;
  }

  const derived = deriveTranslationPaths(sourcePath);
  const resolvedHvPath = await resolveTranslationPath(derived.hv);
  const resolvedViPath = await resolveTranslationPath(derived.vi);

  await unlinkContentFileIfExists(sourcePath);
  await unlinkContentFileIfExists(resolvedHvPath);
  await unlinkContentFileIfExists(resolvedViPath);

  const sourceFiles = await listProjectSourceFiles(series);
  return { deletedSource: sourcePath, sourceFiles };
}

