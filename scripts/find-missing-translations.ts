/**
 * 查找缺失的翻译键
 * 用法: npx tsx scripts/find-missing-translations.ts [locale]
 */

import * as fs from "fs";
import * as path from "path";

const SRC_DIR = "./src";
const MESSAGES_DIR = "./messages";
const ALL_LOCALES = ["en-US", "zh-CN", "ja-JP", "ko-KR", "de-DE", "fr-FR", "it-IT", "ug-CN"];

interface TranslationUsage {
  file: string;
  line: number;
  namespace: string;
  key: string;
  isDynamic: boolean;
}

function parseStringLiteral(s: string): string | null {
  s = s.trim();
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1);
  if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1);
  if (s.startsWith("`") && s.endsWith("`")) {
    return s.includes("${") || s.includes("+") ? null : s.slice(1, -1);
  }
  return null;
}

function extractTranslationBindings(content: string): Map<string, string> {
  const bindings = new Map<string, string>();
  
  const patterns = [
    /(?:const|let|var)\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\s*\(\s*([^)]*)\s*\)/g,
    /(?:const|let|var)\s*\{\s*(\w+)\s*\}\s*=\s*await\s+getTranslations\s*\(\s*([^)]*)\s*\)/g,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const varName = match[1];
      const arg = match[2].trim();
      if (arg === "") {
        bindings.set(varName, "__ROOT__");
      } else {
        const ns = parseStringLiteral(arg);
        if (ns !== null) bindings.set(varName, ns);
      }
    }
  }
  
  return bindings;
}

function extractTranslationCalls(
  content: string,
  filePath: string,
  bindings: Map<string, string>
): TranslationUsage[] {
  const usages: TranslationUsage[] = [];
  const lines = content.split("\n");
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    for (const [varName, namespace] of bindings) {
      const callPattern = new RegExp(
        `\\b${varName}\\s*\\(\\s*("[^"]*"|'[^']*'|\`[^\`]*\`)(?:\\s*,|\\s*\\))`,
        "g"
      );
      
      let match;
      while ((match = callPattern.exec(line)) !== null) {
        const arg = match[1];
        const key = parseStringLiteral(arg);
        
        if (key !== null) {
          usages.push({ file: filePath, line: lineNum, namespace, key, isDynamic: false });
        } else {
          usages.push({ file: filePath, line: lineNum, namespace, key: arg, isDynamic: true });
        }
      }
    }
  }
  
  return usages;
}

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) return files;
  
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function navigateToObject(obj: Record<string, unknown>, path: string): unknown {
  if (typeof obj[path] !== "undefined") return obj[path];
  
  let current: unknown = obj;
  for (const part of path.split(".")) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function keyExists(key: string, namespace: string, translations: Record<string, unknown>): boolean {
  let targetObj: unknown;
  
  if (namespace === "__ROOT__") {
    targetObj = translations;
  } else {
    targetObj = navigateToObject(translations, namespace);
  }
  
  if (typeof targetObj !== "object" || targetObj === null) return false;
  
  const target = targetObj as Record<string, unknown>;
  
  if (typeof target[key] === "string") return true;
  
  let current: unknown = target;
  for (const part of key.split(".")) {
    if (typeof current !== "object" || current === null) return false;
    current = (current as Record<string, unknown>)[part];
  }
  
  return typeof current === "string";
}

function main() {
  const targetLocale = process.argv[2];
  const localesToCheck = targetLocale ? [targetLocale] : ALL_LOCALES;
  
  console.log("Scanning source files...\n");
  
  const sourceFiles = getAllFiles(SRC_DIR, [".tsx", ".ts"]);
  const allUsages: TranslationUsage[] = [];
  
  for (const filePath of sourceFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    const bindings = extractTranslationBindings(content);
    const usages = extractTranslationCalls(content, filePath, bindings);
    allUsages.push(...usages);
  }
  
  const uniqueUsages = new Map<string, TranslationUsage>();
  for (const usage of allUsages) {
    const key = `${usage.file}:${usage.line}:${usage.namespace}:${usage.key}`;
    uniqueUsages.set(key, usage);
  }
  
  const dedupedUsages = Array.from(uniqueUsages.values());
  
  console.log(`Found ${sourceFiles.length} files, ${dedupedUsages.length} translation usages\n`);
  
  for (const locale of localesToCheck) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Locale: ${locale}`);
    console.log("=".repeat(60));
    
    const translationPath = path.join(MESSAGES_DIR, `${locale}.json`);
    
    if (!fs.existsSync(translationPath)) {
      console.log(`File not found: ${translationPath}`);
      continue;
    }
    
    let translations: Record<string, unknown>;
    try {
      translations = JSON.parse(fs.readFileSync(translationPath, "utf-8"));
    } catch (e) {
      console.log(`Failed to parse: ${translationPath}`);
      console.log(e);
      continue;
    }
    
    const missing: TranslationUsage[] = [];
    const dynamic: TranslationUsage[] = [];
    
    for (const usage of dedupedUsages) {
      if (usage.isDynamic) {
        dynamic.push(usage);
      } else if (!keyExists(usage.key, usage.namespace, translations)) {
        missing.push(usage);
      }
    }
    
    if (missing.length === 0 && dynamic.length === 0) {
      console.log("All translations exist!");
    } else {
      if (missing.length > 0) {
        console.log(`\nMissing ${missing.length} translations:\n`);
        
        const byFile = new Map<string, TranslationUsage[]>();
        for (const usage of missing) {
          if (!byFile.has(usage.file)) byFile.set(usage.file, []);
          byFile.get(usage.file)!.push(usage);
        }
        
        for (const [file, usages] of byFile) {
          console.log(file);
          for (const usage of usages) {
            const ns = usage.namespace === "__ROOT__" ? "(root)" : usage.namespace;
            console.log(`  L${usage.line} [${ns}] ${usage.key}`);
          }
          console.log();
        }
      }
      
      if (dynamic.length > 0) {
        console.log(`\n${dynamic.length} dynamic keys (manual review):\n`);
        
        const byFile = new Map<string, TranslationUsage[]>();
        for (const usage of dynamic) {
          if (!byFile.has(usage.file)) byFile.set(usage.file, []);
          byFile.get(usage.file)!.push(usage);
        }
        
        for (const [file, usages] of byFile) {
          console.log(file);
          for (const usage of usages) {
            const ns = usage.namespace === "__ROOT__" ? "(root)" : usage.namespace;
            console.log(`  L${usage.line} [${ns}] ${usage.key}`);
          }
        }
      }
    }
  }
  
  console.log("\nDone!");
}

main();
