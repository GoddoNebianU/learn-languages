/**
 * 查找多余的翻译键
 * 用法: npx tsx scripts/find-unused-translations.ts [locale]
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

function getUsedKeys(content: string): Map<string, Set<string>> {
  const used = new Map<string, Set<string>>();
  const bindings = getBindings(content);
  
  for (const [varName, ns] of bindings) {
    const pattern = new RegExp(`\\b${varName}\\s*\\(\\s*("[^"]*"|'[^']*'|\`[^\`]*\`)(?:\\s*,|\\s*\\))`, "g");
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const key = parseString(match[1]);
      if (key) {
        if (!used.has(ns)) used.set(ns, new Set());
        used.get(ns)!.add(key);
      }
    }
  }
  
  return used;
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

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys.push(...flattenKeys(obj[key] as Record<string, unknown>, fullKey));
    } else if (typeof obj[key] === "string") {
      keys.push(fullKey);
    }
  }
  return keys;
}

function isUsed(fullKey: string, used: Map<string, Set<string>>): boolean {
  const parts = fullKey.split(".");
  
  for (let i = 1; i < parts.length; i++) {
    const ns = parts.slice(0, i).join(".");
    const key = parts.slice(i).join(".");
    
    const nsKeys = used.get(ns);
    if (nsKeys) {
      if (nsKeys.has(key)) return true;
      for (const k of nsKeys) {
        if (key.startsWith(k + ".")) return true;
      }
    }
  }
  
  const rootKeys = used.get("__ROOT__");
  return rootKeys?.has(fullKey) ?? false;
}

function main() {
  const locales = process.argv[2] ? [process.argv[2]] : ALL_LOCALES;
  
  const files = getFiles(SRC_DIR);
  const allUsed = new Map<string, Set<string>>();
  
  for (const f of files) {
    const used = getUsedKeys(fs.readFileSync(f, "utf-8"));
    for (const [ns, keys] of used) {
      if (!allUsed.has(ns)) allUsed.set(ns, new Set());
      for (const k of keys) allUsed.get(ns)!.add(k);
    }
  }
  
  console.log(`Scanned ${files.length} files, ${allUsed.size} namespaces\n`);
  
  for (const locale of locales) {
    console.log(`\n${"=".repeat(50)}\nLocale: ${locale}\n${"=".repeat(50)}`);
    
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
    
    const trans = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const allKeys = flattenKeys(trans);
    const unused = allKeys.filter(k => !isUsed(k, allUsed));
    
    console.log(`Total: ${allKeys.length} keys`);
    
    if (unused.length === 0) {
      console.log("No unused translations!");
    } else {
      console.log(`\n${unused.length} potentially unused:\n`);
      const grouped = new Map<string, string[]>();
      for (const k of unused) {
        const [ns, ...rest] = k.split(".");
        if (!grouped.has(ns)) grouped.set(ns, []);
        grouped.get(ns)!.push(rest.join("."));
      }
      for (const [ns, keys] of grouped) {
        console.log(`${ns}`);
        for (const k of keys) console.log(`  ${k}`);
        console.log();
      }
    }
  }
  
  console.log("\nDone!");
}

main();
