/**
 * 查找多余的翻译键
 * 用法: npx tsx scripts/find-unused-translations.ts [locale]
 */

import * as fs from "fs";
import * as path from "path";

const SRC_DIR = "./src";
const MESSAGES_DIR = "./messages";
const ALL_LOCALES = ["en-US", "zh-CN", "ja-JP", "ko-KR", "de-DE", "fr-FR", "it-IT", "ug-CN"];

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

function extractUsedKeys(content: string, bindings: Map<string, string>): Map<string, Set<string>> {
  const usedKeys = new Map<string, Set<string>>();
  
  for (const [varName, namespace] of bindings) {
    const callPattern = new RegExp(
      `\\b${varName}\\s*\\(\\s*("[^"]*"|'[^']*'|\`[^\`]*\`)(?:\\s*,|\\s*\\))`,
      "g"
    );
    
    let match;
    while ((match = callPattern.exec(content)) !== null) {
      const arg = match[1];
      const key = parseStringLiteral(arg);
      
      if (key !== null) {
        if (!usedKeys.has(namespace)) {
          usedKeys.set(namespace, new Set());
        }
        usedKeys.get(namespace)!.add(key);
      }
    }
  }
  
  return usedKeys;
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

function flattenTranslations(
  obj: Record<string, unknown>,
  prefix = ""
): string[] {
  const keys: string[] = [];
  
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    
    if (typeof value === "object" && value !== null) {
      keys.push(...flattenTranslations(value as Record<string, unknown>, fullKey));
    } else if (typeof value === "string") {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

function isKeyUsed(
  fullKey: string,
  usedKeys: Map<string, Set<string>>
): boolean {
  const parts = fullKey.split(".");
  
  for (let i = 1; i < parts.length; i++) {
    const namespace = parts.slice(0, i).join(".");
    const keyInNamespace = parts.slice(i).join(".");
    
    const nsKeys = usedKeys.get(namespace);
    if (nsKeys) {
      if (nsKeys.has(keyInNamespace)) return true;
      
      for (const usedKey of nsKeys) {
        if (keyInNamespace.startsWith(usedKey + ".")) return true;
      }
    }
  }
  
  const rootKeys = usedKeys.get("__ROOT__");
  if (rootKeys && rootKeys.has(fullKey)) return true;
  
  return false;
}

function main() {
  const targetLocale = process.argv[2];
  const localesToCheck = targetLocale ? [targetLocale] : ALL_LOCALES;
  
  console.log("Scanning source files...\n");
  
  const sourceFiles = getAllFiles(SRC_DIR, [".tsx", ".ts"]);
  const allUsedKeys = new Map<string, Set<string>>();
  
  for (const filePath of sourceFiles) {
    const content = fs.readFileSync(filePath, "utf-8");
    const bindings = extractTranslationBindings(content);
    const usedKeys = extractUsedKeys(content, bindings);
    
    for (const [ns, keys] of usedKeys) {
      if (!allUsedKeys.has(ns)) {
        allUsedKeys.set(ns, new Set());
      }
      for (const key of keys) {
        allUsedKeys.get(ns)!.add(key);
      }
    }
  }
  
  console.log(`Scanned ${sourceFiles.length} files`);
  console.log(`Found ${allUsedKeys.size} namespaces used\n`);
  
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
      continue;
    }
    
    const allKeys = flattenTranslations(translations);
    console.log(`Total ${allKeys.length} translation keys`);
    
    const unusedKeys = allKeys.filter(key => !isKeyUsed(key, allUsedKeys));
    
    if (unusedKeys.length === 0) {
      console.log("No unused translations!");
    } else {
      console.log(`\n${unusedKeys.length} potentially unused translations:\n`);
      
      const groupedByNs = new Map<string, string[]>();
      for (const key of unusedKeys) {
        const firstDot = key.indexOf(".");
        const ns = firstDot > 0 ? key.substring(0, firstDot) : key;
        const subKey = firstDot > 0 ? key.substring(firstDot + 1) : "";
        
        if (!groupedByNs.has(ns)) {
          groupedByNs.set(ns, []);
        }
        groupedByNs.get(ns)!.push(subKey || "(root)");
      }
      
      for (const [ns, keys] of groupedByNs) {
        console.log(`${ns}`);
        for (const key of keys) {
          console.log(`  ${key}`);
        }
        console.log();
      }
      
      console.log("Note: These may be used dynamically (e.g., t(`prefix.${var}`)). Review before deleting.");
    }
  }
  
  console.log("\nDone!");
}

main();
