#!/usr/bin/env node
/** Convert a series glossary YAML file to CSV. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(__dirname, "..");

const inArg = process.argv[2] ?? "data/glossary/sheng-tianwang.yaml";
const inPath = path.isAbsolute(inArg) ? inArg : path.join(webRoot, inArg);
const outPath =
  process.argv[3] ??
  inPath.replace(/\.ya?ml$/i, ".csv");

const doc = yaml.parse(fs.readFileSync(inPath, "utf8"));
const terms = doc.terms ?? [];

const cols = ["zh", "hv", "vi", "notes", "sanskrit", "doctrine", "status"];

function esc(v) {
  if (v === undefined || v === null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const lines = [cols.join(",")];
for (const t of terms) {
  lines.push(cols.map((c) => esc(t[c])).join(","));
}

fs.writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${terms.length} rows to ${outPath}`);
