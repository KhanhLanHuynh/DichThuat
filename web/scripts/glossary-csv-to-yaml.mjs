#!/usr/bin/env node
/** Import glossary CSV into YAML: append new terms, update hv/vi on existing. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");
const glossaryDir = path.join(webRoot, "data/glossary");

const args = process.argv.slice(2).filter((a) => a !== "--dry-run");
const dryRun = process.argv.includes("--dry-run");

const csvArg = args[0] ?? "data/glossary/sheng-tianwang.csv";
const csvPath = path.isAbsolute(csvArg) ? csvArg : path.join(webRoot, csvArg);

const yamlArg =
  args[1] ?? csvPath.replace(/\.csv$/i, ".yaml");
const yamlPath = path.isAbsolute(yamlArg) ? yamlArg : path.join(webRoot, yamlArg);

const termsYamlPath = path.join(glossaryDir, "terms.yaml");
const series = path.basename(yamlPath, path.extname(yamlPath));

const COLS = ["zh", "hv", "vi", "notes", "sanskrit", "doctrine", "status"];

// --- CSV parsing (RFC-style, mirrors glossary-yaml-to-csv.mjs esc()) ---

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\r") {
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
      i++;
      continue;
    }
    field += c;
    i++;
  }
  row.push(field);
  if (row.length > 1 || row[0] !== "") rows.push(row);
  return rows;
}

function rowToTerm(headers, values) {
  const obj = {};
  for (let i = 0; i < headers.length; i++) {
    obj[headers[i]] = values[i] ?? "";
  }
  const zh = (obj.zh ?? "").trim();
  const hv = (obj.hv ?? "").trim();
  const vi = (obj.vi ?? "").trim();
  if (!zh || !hv || !vi) return null;

  const term = { zh, hv, vi };
  const notes = (obj.notes ?? "").trim();
  const sanskrit = (obj.sanskrit ?? "").trim();
  const status = (obj.status ?? "").trim();
  const doctrineRaw = (obj.doctrine ?? "").trim().toLowerCase();
  if (notes) term.notes = notes;
  if (sanskrit) term.sanskrit = sanskrit;
  if (status) term.status = status;
  if (doctrineRaw === "true" || doctrineRaw === "1" || doctrineRaw === "yes") {
    term.doctrine = true;
  }
  return term;
}

function normalizeTerm(term) {
  const hv = (term.hv ?? term.vi ?? "").trim();
  const vi = (term.vi ?? term.hv ?? "").trim();
  return { ...term, hv, vi };
}

function readYamlTerms(filePath) {
  if (!fs.existsSync(filePath)) return { raw: "", terms: [], map: new Map() };
  const raw = fs.readFileSync(filePath, "utf8");
  let doc;
  try {
    doc = yaml.parse(raw);
  } catch {
    throw new Error(`Failed to parse YAML: ${filePath}`);
  }
  const terms = (doc?.terms ?? []).map(normalizeTerm);
  const map = new Map(terms.map((t) => [t.zh, t]));
  return { raw, terms, map };
}

function findOwningFile(zh, targetMap, termsMap) {
  if (targetMap.has(zh)) return "target";
  if (termsMap.has(zh)) return "shared";
  return null;
}

// --- YAML block helpers (ported from glossary-update.ts) ---

function parseYamlScalar(raw) {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }
}

function zhFromTermLine(line) {
  const m = line.match(/^  - zh:\s*(.+)$/);
  if (!m) return null;
  return parseYamlScalar(m[1]);
}

function isTermStartLine(line) {
  return /^  - zh:/.test(line);
}

function isHvLine(line) {
  return /^    hv:/.test(line);
}

function isViLine(line) {
  return /^    vi:/.test(line);
}

function formatFieldLine(key, value) {
  return `    ${key}: ${JSON.stringify(value)}`;
}

function updateTermBlockInRaw(raw, zh, hv, vi) {
  const lines = raw.split("\n");
  const out = [];
  let i = 0;
  let found = false;

  while (i < lines.length) {
    const line = lines[i];
    if (!isTermStartLine(line)) {
      out.push(line);
      i++;
      continue;
    }

    const blockZh = zhFromTermLine(line);
    const block = [line];
    i++;

    while (i < lines.length && !isTermStartLine(lines[i])) {
      block.push(lines[i]);
      i++;
    }

    if (blockZh === zh) {
      found = true;
      let hvIdx = block.findIndex((l, idx) => idx > 0 && isHvLine(l));
      let viIdx = block.findIndex((l, idx) => idx > 0 && isViLine(l));

      const hvLine = formatFieldLine("hv", hv);
      const viLine = formatFieldLine("vi", vi);

      if (hvIdx >= 0) {
        block[hvIdx] = hvLine;
      } else if (viIdx >= 0) {
        block.splice(viIdx, 0, hvLine);
        viIdx++;
      } else {
        block.splice(1, 0, hvLine);
      }

      viIdx = block.findIndex((l, idx) => idx > 0 && isViLine(l));
      if (viIdx >= 0) {
        block[viIdx] = viLine;
      } else {
        const newHvIdx = block.findIndex((l, idx) => idx > 0 && isHvLine(l));
        block.splice(newHvIdx + 1, 0, viLine);
      }
    }

    out.push(...block);
  }

  if (!found) {
    throw new Error(`Glossary term not found in file: ${zh}`);
  }

  let result = out.join("\n");
  if (!result.endsWith("\n")) result += "\n";
  return result;
}

function applyUpdatesToRaw(raw, updates) {
  let result = raw;
  for (const { zh, hv, vi } of updates) {
    result = updateTermBlockInRaw(result, zh, hv, vi);
  }
  return result;
}

function formatTermYaml(term) {
  const lines = [`  - zh: ${JSON.stringify(term.zh)}`];
  if (term.hv) lines.push(`    hv: ${JSON.stringify(term.hv)}`);
  lines.push(`    vi: ${JSON.stringify(term.vi)}`);
  if (term.sanskrit) lines.push(`    sanskrit: ${JSON.stringify(term.sanskrit)}`);
  if (term.doctrine) lines.push(`    doctrine: true`);
  if (term.status) lines.push(`    status: ${JSON.stringify(term.status)}`);
  if (term.notes) lines.push(`    notes: ${JSON.stringify(term.notes)}`);
  return lines.join("\n");
}

function formatList(zhList, max = 20) {
  if (zhList.length === 0) return "";
  if (zhList.length <= max) return `: ${zhList.join(", ")}`;
  return ` (${zhList.length} terms)`;
}

// --- Main ---

if (!fs.existsSync(csvPath)) {
  console.error(`CSV not found: ${csvPath}`);
  process.exit(1);
}

const csvText = fs.readFileSync(csvPath, "utf8");
const csvRows = parseCsv(csvText);
if (csvRows.length < 1) {
  console.error("CSV is empty");
  process.exit(1);
}

const headers = csvRows[0].map((h) => h.trim());
for (const col of ["zh", "hv", "vi"]) {
  if (!headers.includes(col)) {
    console.error(`CSV missing required column: ${col}`);
    process.exit(1);
  }
}

const target = readYamlTerms(yamlPath);
const shared = readYamlTerms(termsYamlPath);

const seenZh = new Set();
const toAdd = [];
const toUpdateTarget = [];
const toUpdateShared = [];
const skippedUnchanged = [];
const skippedInvalid = [];
const skippedCsvDup = [];

for (let r = 1; r < csvRows.length; r++) {
  const term = rowToTerm(headers, csvRows[r]);
  if (!term) {
    skippedInvalid.push(r + 1);
    continue;
  }
  if (seenZh.has(term.zh)) {
    skippedCsvDup.push(term.zh);
    continue;
  }
  seenZh.add(term.zh);

  const owner = findOwningFile(term.zh, target.map, shared.map);
  if (!owner) {
    toAdd.push(term);
    continue;
  }

  const existing =
    owner === "target" ? target.map.get(term.zh) : shared.map.get(term.zh);
  if (existing.hv === term.hv && existing.vi === term.vi) {
    skippedUnchanged.push(term.zh);
    continue;
  }

  const update = { zh: term.zh, hv: term.hv, vi: term.vi };
  if (owner === "target") toUpdateTarget.push(update);
  else toUpdateShared.push(update);
}

const date = new Date().toISOString().slice(0, 10);
const prefix = dryRun ? "Would " : "";

if (!dryRun) {
  if (toUpdateShared.length > 0) {
    const updated = applyUpdatesToRaw(shared.raw, toUpdateShared);
    fs.writeFileSync(termsYamlPath, updated, "utf8");
  }

  if (toUpdateTarget.length > 0) {
    const updated = applyUpdatesToRaw(target.raw, toUpdateTarget);
    fs.writeFileSync(yamlPath, updated, "utf8");
    target.raw = updated;
  }

  if (toAdd.length > 0) {
    const block = [
      "",
      `  # CSV import ${date}`,
      ...toAdd.map((t) => formatTermYaml(t)),
      "",
    ].join("\n");

    if (!target.raw.trim()) {
      const header = [
        `# Glossary — ${series}`,
        `# Scope: series-specific terms`,
        "",
        `series: ${series}`,
        "",
        "terms:",
        block.trimEnd(),
        "",
      ].join("\n");
      fs.mkdirSync(path.dirname(yamlPath), { recursive: true });
      fs.writeFileSync(yamlPath, header, "utf8");
    } else {
      fs.appendFileSync(yamlPath, block, "utf8");
    }
  }
}

console.log(`${prefix}Added: ${toAdd.length}${formatList(toAdd.map((t) => t.zh))}`);
console.log(
  `${prefix}Updated: ${toUpdateTarget.length + toUpdateShared.length}${formatList([
    ...toUpdateTarget.map((t) => t.zh),
    ...toUpdateShared.map((t) => t.zh),
  ])}`
);
if (toUpdateShared.length > 0) {
  console.log(`  (${toUpdateShared.length} in terms.yaml)`);
}
if (toUpdateTarget.length > 0) {
  console.log(`  (${toUpdateTarget.length} in ${path.basename(yamlPath)})`);
}
console.log(`Skipped (unchanged): ${skippedUnchanged.length}${formatList(skippedUnchanged)}`);
console.log(`Skipped (invalid/missing zh|hv|vi): ${skippedInvalid.length}`);
console.log(`Skipped (duplicate in CSV): ${skippedCsvDup.length}${formatList(skippedCsvDup)}`);

if (dryRun) {
  console.log("\n(dry-run — no files written)");
} else if (toAdd.length + toUpdateTarget.length + toUpdateShared.length > 0) {
  console.log(`\nWrote changes to glossary under ${glossaryDir}`);
}
