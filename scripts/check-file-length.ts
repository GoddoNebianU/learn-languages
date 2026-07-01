import * as fs from "node:fs";
import * as path from "node:path";

const MAX_LINES = 400;
const ROOT = process.cwd();

function walk(dir: string, out: string[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.[tc]sx?$/.test(entry.name)) out.push(full);
  }
}

const files: string[] = [];
for (const d of ["src", "scripts"]) {
  if (fs.existsSync(path.join(ROOT, d))) walk(d, files);
}

const violations = files
  .map((f) => ({ file: f, lines: fs.readFileSync(f, "utf8").split("\n").length }))
  .filter((x) => x.lines > MAX_LINES)
  .sort((a, b) => b.lines - a.lines);

if (violations.length > 0) {
  console.error(`FAIL: ${violations.length} file(s) exceed ${MAX_LINES} lines:\n`);
  for (const v of violations) console.error(`  ${v.lines}  ${v.file}`);
  process.exit(1);
}
console.log(`PASS: all ${files.length} source file(s) ≤ ${MAX_LINES} lines.`);
