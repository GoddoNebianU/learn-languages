/**
 * 查找缺失的翻译键
 * 用法: npx tsx scripts/find-missing-translations.ts [locale]
 */

import * as fs from "fs";
import * as path from "path";

const SRC_DIR = "./src";
const MESSAGES_DIR = "./messages";
const ALL_LOCALES = ["en-US", "zh-CN", "ja-JP", "ko-KR", "de-DE", "fr-FR", "it-IT", "ug-CN"];

function parseString(s: string): string | null {
  s = s.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  if (s.startsWith("`") && s.endsWith("`") && !s.includes("${")) {
    return s.slice(1, -1);
  }
  return null;
}

function getBindings(content: string): Map<string, string> {
  const bindings = new Map<string, string>();
  const pattern = /(?:const|let|var)\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\s*\(\s*([^)]*)\s*\)/g;
  
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const varName = match[1];
    const arg = match[2].trim();
    bindings.set(varName, arg ? parseString(arg) || "" : "__ROOT__");
  }
  
  return bindings;
}

function getUsages(content: string, file: string): { file: string; line: number; ns: string; key: string }[] {
  const usages: { file: string; line: number; ns: string; key: string }[] = [];
  const bindings = getBindings(content);
  const lines = content.split("\n");
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const [varName, ns] of bindings) {
      const pattern = new RegExp(`\\b${varName}\\s*\\(\\s*("[^"]*"|'[^']*'|\`[^\`]*\`)(?:\\s*,|\\s*\\))`, "g");
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const key = parseString(match[1]);
        if (key) usages.push({ file, line: i + 1, ns, key });
      }
    }
  }
  
  return usages;
}

function getFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...getFiles(p));
    else if (entry.isFile() && /\.(tsx?|ts)$/.test(entry.name)) files.push(p);
  }
  return files;
}

function keyExists(key: string, ns: string, trans: Record<string, unknown>): boolean {
  let obj: unknown;
  
  if (ns === "__ROOT__") {
    obj = trans;
  } else {
    obj = trans[ns];
    if (typeof obj !== "object" || obj === null) {
      obj = trans;
      for (const part of ns.split(".")) {
        if (typeof obj !== "object" || obj === null) return false;
        obj = (obj as Record<string, unknown>)[part];
      }
    }
  }
  
  if (typeof obj !== "object" || obj === null) return false;
  
  for (const part of key.split(".")) {
    if (typeof obj !== "object" || obj === null) return false;
    obj = (obj as Record<string, unknown>)[part];
  }
  
  return typeof obj === "string";
}

function main() {
  const locales = process.argv[2] ? [process.argv[2]] : ALL_LOCALES;
  
  const files = getFiles(SRC_DIR);
  const usages: { file: string; line: number; ns: string; key: string }[] = [];
  
  for (const f of files) {
    usages.push(...getUsages(fs.readFileSync(f, "utf-8"), f));
  }
  
  const unique = new Map<string, { file: string; line: number; ns: string; key: string }>();
  for (const u of usages) {
    unique.set(`${u.file}:${u.line}:${u.ns}:${u.key}`, u);
  }
  
  console.log(`Scanned ${files.length} files, ${unique.size} usages\n`);
  
  for (const locale of locales) {
    console.log(`\n${"=".repeat(50)}\nLocale: ${locale}\n${"=".repeat(50)}`);
    
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
    
    const trans = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const missing = Array.from(unique.values()).filter(u => !keyExists(u.key, u.ns, trans));
    
    if (missing.length === 0) {
      console.log("All translations exist!");
    } else {
      console.log(`\nMissing ${missing.length} translations:\n`);
      const byFile = new Map<string, typeof missing>();
      for (const u of missing) {
        if (!byFile.has(u.file)) byFile.set(u.file, []);
        byFile.get(u.file)!.push(u);
      }
      for (const [file, list] of byFile) {
        console.log(file);
        for (const u of list) {
          console.log(`  L${u.line} [${u.ns === "__ROOT__" ? "root" : u.ns}] ${u.key}`);
        }
        console.log();
      }
    }
  }
  
  console.log("\nDone!");
}

main();
