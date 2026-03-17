/**
 * 查找缺失的翻译键
 * 
 * 扫描代码中使用的翻译键，与翻译文件对比，找出缺失的键
 * 
 * 用法: npx tsx scripts/find-missing-translations.ts [locale]
 * 示例: 
 *   npx tsx scripts/find-missing-translations.ts          # 检查所有语言
 *   npx tsx scripts/find-missing-translations.ts en-US    # 只检查 en-US
 */

import * as fs from "fs";
import * as path from "path";

const SRC_DIR = "./src";
const MESSAGES_DIR = "./messages";

// 所有支持的语言
const ALL_LOCALES = [
  "en-US",
  "zh-CN", 
  "ja-JP",
  "ko-KR",
  "de-DE",
  "fr-FR",
  "it-IT",
  "ug-CN",
];

interface FileTranslationUsage {
  file: string;
  namespace: string;
  keys: Set<string>;
}

/**
 * 递归获取目录下所有文件
 */
function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, extensions));
    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * 从代码文件中提取翻译使用情况
 */
function extractTranslationsFromFile(filePath: string): FileTranslationUsage[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const usages: FileTranslationUsage[] = [];
  
  // 匹配 useTranslations("namespace") 或 getTranslations("namespace")
  const namespacePattern = /(?:useTranslations|getTranslations)\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
  
  // 匹配没有参数的 useTranslations() 或 getTranslations() - 使用根级别
  const rootNamespacePattern = /(?:useTranslations|getTranslations)\s*\(\s*\)/g;
  
  // 首先找到所有的 namespace 声明
  const namespaces: { name: string; isRoot: boolean }[] = [];
  let match;
  
  while ((match = namespacePattern.exec(content)) !== null) {
    namespaces.push({ name: match[1], isRoot: false });
  }
  
  // 检查是否有根级别的翻译
  let hasRootTranslations = false;
  while ((match = rootNamespacePattern.exec(content)) !== null) {
    hasRootTranslations = true;
  }
  
  if (namespaces.length === 0 && !hasRootTranslations) {
    return usages;
  }
  
  // 匹配 t("key") 或 t('key') 或 t(`key`) 调用
  // 支持简单键、嵌套键、带插值的键
  const tCallPattern = /\bt\s*\(\s*["'`]([^"'`]+)["'`]\s*(?:,|\))/g;
  
  const allKeys = new Set<string>();
  
  while ((match = tCallPattern.exec(content)) !== null) {
    allKeys.add(match[1]);
  }
  
  // 匹配模板字面量动态键 t(`prefix.${variable}`)
  const dynamicTCallPattern = /\bt\s*\(\s*`([^`]+)\$\{[^}]+\}([^`]*)`\s*(?:,|\))/g;
  while ((match = dynamicTCallPattern.exec(content)) !== null) {
    // 标记为动态键，前缀部分
    const prefix = match[1];
    if (prefix) {
      allKeys.add(`[DYNAMIC PREFIX: ${prefix}]`);
    }
  }
  
  if (allKeys.size === 0) {
    return usages;
  }
  
  // 为每个 namespace 创建使用记录
  for (const ns of namespaces) {
    usages.push({
      file: filePath,
      namespace: ns.name,
      keys: allKeys,
    });
  }
  
  // 如果有根级别翻译，添加一个特殊的 namespace
  if (hasRootTranslations) {
    usages.push({
      file: filePath,
      namespace: "__ROOT__",
      keys: allKeys,
    });
  }
  
  return usages;
}

/**
 * 获取翻译对象中所有的键路径
 */
function getAllKeysFromTranslation(obj: Record<string, unknown>, prefix = ""): Set<string> {
  const keys = new Set<string>();
  
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.add(fullKey);
    
    if (typeof obj[key] === "object" && obj[key] !== null) {
      const nestedKeys = getAllKeysFromTranslation(
        obj[key] as Record<string, unknown>,
        fullKey
      );
      nestedKeys.forEach(k => keys.add(k));
    }
  }
  
  return keys;
}

/**
 * 检查键是否存在于翻译对象中
 */
function keyExistsInTranslation(key: string, namespace: string, translations: Record<string, unknown>): boolean {
  // 处理根级别翻译
  if (namespace === "__ROOT__") {
    const parts = key.split(".");
    let current: unknown = translations;
    
    for (const part of parts) {
      if (typeof current !== "object" || current === null) {
        return false;
      }
      current = (current as Record<string, unknown>)[part];
    }
    
    return typeof current === "string";
  }
  
  // 处理带命名空间的翻译
  const nsTranslations = translations[namespace];
  if (!nsTranslations || typeof nsTranslations !== "object") {
    return false;
  }
  
  const parts = key.split(".");
  let current: unknown = nsTranslations;
  
  for (const part of parts) {
    if (typeof current !== "object" || current === null) {
      return false;
    }
    current = (current as Record<string, unknown>)[part];
  }
  
  return typeof current === "string";
}

/**
 * 主函数
 */
function main() {
  const targetLocale = process.argv[2];
  const localesToCheck = targetLocale 
    ? [targetLocale] 
    : ALL_LOCALES;
  
  console.log("🔍 扫描代码中的翻译使用情况...\n");
  
  // 获取所有源代码文件
  const sourceFiles = [
    ...getAllFiles(SRC_DIR, [".tsx", ".ts"]),
  ];
  
  // 提取所有翻译使用
  const allUsages: FileTranslationUsage[] = [];
  for (const file of sourceFiles) {
    allUsages.push(...extractTranslationsFromFile(file));
  }
  
  console.log(`📁 扫描了 ${sourceFiles.length} 个文件`);
  console.log(`📝 发现 ${allUsages.length} 个翻译使用声明\n`);
  
  // 检查每种语言
  for (const locale of localesToCheck) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🌐 检查语言: ${locale}`);
    console.log("=".repeat(60));
    
    const translationPath = path.join(MESSAGES_DIR, `${locale}.json`);
    
    if (!fs.existsSync(translationPath)) {
      console.log(`❌ 翻译文件不存在: ${translationPath}`);
      continue;
    }
    
    let translations: Record<string, unknown>;
    try {
      const content = fs.readFileSync(translationPath, "utf-8");
      translations = JSON.parse(content);
    } catch (e) {
      console.log(`❌ 翻译文件解析失败: ${translationPath}`);
      console.log(e);
      continue;
    }
    
    const missingKeys: { file: string; namespace: string; key: string }[] = [];
    
    for (const usage of allUsages) {
      for (const key of usage.keys) {
        // 跳过动态键标记
        if (key.startsWith("[DYNAMIC PREFIX:")) {
          continue;
        }
        
        if (!keyExistsInTranslation(key, usage.namespace, translations)) {
          missingKeys.push({
            file: usage.file,
            namespace: usage.namespace,
            key: key,
          });
        }
      }
    }
    
    if (missingKeys.length === 0) {
      console.log(`✅ 没有缺失的翻译键`);
    } else {
      console.log(`\n❌ 发现 ${missingKeys.length} 个缺失的翻译键:\n`);
      
      // 按文件分组显示
      const groupedByFile = new Map<string, typeof missingKeys>();
      for (const item of missingKeys) {
        const file = item.file;
        if (!groupedByFile.has(file)) {
          groupedByFile.set(file, []);
        }
        groupedByFile.get(file)!.push(item);
      }
      
      for (const [file, items] of groupedByFile) {
        console.log(`📄 ${file}`);
        for (const item of items) {
          const nsDisplay = item.namespace === "__ROOT__" ? "(root)" : item.namespace;
          console.log(`   [${nsDisplay}] ${item.key}`);
        }
        console.log();
      }
    }
  }
  
  console.log("\n✨ 检查完成！");
}

main();
