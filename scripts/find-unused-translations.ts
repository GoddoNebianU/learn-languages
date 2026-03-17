/**
 * 查找多余（未使用）的翻译键
 * 
 * 扫描翻译文件中的所有键，与代码中实际使用的键对比，找出多余的键
 * 
 * 用法: npx tsx scripts/find-unused-translations.ts [locale]
 * 示例: 
 *   npx tsx scripts/find-unused-translations.ts          # 检查所有语言
 *   npx tsx scripts/find-unused-translations.ts en-US    # 只检查 en-US
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
 * 代码中实际使用的翻译键
 */
interface UsedTranslations {
  // namespace -> Set of keys
  byNamespace: Map<string, Set<string>>;
  // 根级别的完整路径 (当使用 useTranslations() 无参数时)
  rootKeys: Set<string>;
}

/**
 * 从代码文件中提取使用的翻译键
 */
function extractUsedTranslationsFromFiles(files: string[]): UsedTranslations {
  const result: UsedTranslations = {
    byNamespace: new Map(),
    rootKeys: new Set(),
  };
  
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf-8");
    
    // 匹配 useTranslations("namespace") 或 getTranslations("namespace")
    const namespacePattern = /(?:useTranslations|getTranslations)\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
    
    // 检查是否有根级别的翻译 (无参数调用)
    const hasRootTranslations = /(?:useTranslations|getTranslations)\s*\(\s*\)/.test(content);
    
    // 收集该文件中的所有 namespace
    const namespaces: string[] = [];
    let match;
    
    while ((match = namespacePattern.exec(content)) !== null) {
      namespaces.push(match[1]);
    }
    
    // 匹配 t("key") 或 t('key') 或 t(`key`) 调用
    const tCallPattern = /\bt\s*\(\s*["'`]([^"'`]+)["'`]\s*(?:,|\))/g;
    
    const keysInFile = new Set<string>();
    
    while ((match = tCallPattern.exec(content)) !== null) {
      keysInFile.add(match[1]);
    }
    
    // 匹配带命名空间的 t 调用 t("namespace.key") - 跨 namespace 访问
    const crossNamespacePattern = /\bt\s*\(\s*["'`]([^.]+\.[^"'`]+)["'`]\s*(?:,|\))/g;
    
    // 将键添加到对应的 namespace
    for (const ns of namespaces) {
      if (!result.byNamespace.has(ns)) {
        result.byNamespace.set(ns, new Set());
      }
      
      for (const key of keysInFile) {
        // 检查是否是跨 namespace 访问 (包含点)
        const dotIndex = key.indexOf(".");
        if (dotIndex > 0) {
          const possibleNs = key.substring(0, dotIndex);
          const remainingKey = key.substring(dotIndex + 1);
          
          // 如果第一部分是已知的 namespace，则是跨 namespace 访问
          if (result.byNamespace.has(possibleNs) || possibleNs !== ns) {
            // 添加到对应的 namespace
            if (!result.byNamespace.has(possibleNs)) {
              result.byNamespace.set(possibleNs, new Set());
            }
            result.byNamespace.get(possibleNs)!.add(remainingKey);
            continue;
          }
        }
        
        result.byNamespace.get(ns)!.add(key);
      }
    }
    
    // 如果有根级别翻译，添加到 rootKeys
    if (hasRootTranslations) {
      for (const key of keysInFile) {
        result.rootKeys.add(key);
      }
    }
  }
  
  return result;
}

/**
 * 获取翻译对象中所有的键路径（带完整路径）
 */
function getAllTranslationKeys(
  obj: Record<string, unknown>,
  locale: string
): { namespace: string; key: string; fullPath: string }[] {
  const result: { namespace: string; key: string; fullPath: string }[] = [];
  
  // 获取顶层 namespace
  for (const ns of Object.keys(obj)) {
    const nsValue = obj[ns];
    
    if (typeof nsValue === "object" && nsValue !== null) {
      // 递归获取该 namespace 下的所有键
      const keys = getNestedKeys(nsValue as Record<string, unknown>);
      
      for (const key of keys) {
        result.push({
          namespace: ns,
          key: key,
          fullPath: `${ns}.${key}`,
        });
      }
    } else if (typeof nsValue === "string") {
      // 顶层直接是字符串值
      result.push({
        namespace: ns,
        key: "",
        fullPath: ns,
      });
    }
  }
  
  return result;
}

/**
 * 递归获取嵌套对象的键路径
 */
function getNestedKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys.push(...getNestedKeys(obj[key] as Record<string, unknown>, fullKey));
    } else if (typeof obj[key] === "string") {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * 检查键是否被代码使用
 */
function isKeyUsed(
  namespace: string,
  key: string,
  used: UsedTranslations
): boolean {
  // 检查该 namespace 下是否使用了该键
  const nsKeys = used.byNamespace.get(namespace);
  if (nsKeys) {
    // 检查精确匹配
    if (nsKeys.has(key)) {
      return true;
    }
    
    // 检查前缀匹配 (父级键被使用时，子键也算被使用)
    for (const usedKey of nsKeys) {
      if (key.startsWith(usedKey + ".") || usedKey.startsWith(key + ".")) {
        return true;
      }
    }
  }
  
  // 检查根级别使用
  for (const rootKey of used.rootKeys) {
    if (rootKey === `${namespace}.${key}` || rootKey.startsWith(`${namespace}.${key}.`)) {
      return true;
    }
  }
  
  // 检查跨 namespace 使用 (t("namespace.key") 形式)
  for (const [ns, keys] of used.byNamespace) {
    for (const k of keys) {
      // 检查是否是跨 namespace 访问
      if (k.includes(".")) {
        const fullKey = `${ns}.${k}`;
        if (fullKey === `${namespace}.${key}`) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * 主函数
 */
function main() {
  const targetLocale = process.argv[2];
  const localesToCheck = targetLocale 
    ? [targetLocale] 
    : ALL_LOCALES;
  
  console.log("🔍 扫描代码中使用的翻译键...\n");
  
  // 获取所有源代码文件
  const sourceFiles = getAllFiles(SRC_DIR, [".tsx", ".ts"]);
  
  console.log(`📁 扫描了 ${sourceFiles.length} 个文件`);
  
  // 提取代码中使用的翻译
  const usedTranslations = extractUsedTranslationsFromFiles(sourceFiles);
  
  console.log(`📝 发现 ${usedTranslations.byNamespace.size} 个命名空间被使用`);
  let totalKeys = 0;
  for (const keys of usedTranslations.byNamespace.values()) {
    totalKeys += keys.size;
  }
  console.log(`📝 发现 ${totalKeys} 个翻译键被使用\n`);
  
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
    
    // 获取翻译文件中的所有键
    const allTranslationKeys = getAllTranslationKeys(translations, locale);
    
    console.log(`📊 翻译文件中共有 ${allTranslationKeys.length} 个翻译键`);
    
    // 找出未使用的键
    const unusedKeys = allTranslationKeys.filter(
      item => !isKeyUsed(item.namespace, item.key, usedTranslations)
    );
    
    if (unusedKeys.length === 0) {
      console.log(`✅ 没有多余的翻译键`);
    } else {
      console.log(`\n⚠️  发现 ${unusedKeys.length} 个可能多余的翻译键:\n`);
      
      // 按 namespace 分组显示
      const groupedByNs = new Map<string, typeof unusedKeys>();
      for (const item of unusedKeys) {
        if (!groupedByNs.has(item.namespace)) {
          groupedByNs.set(item.namespace, []);
        }
        groupedByNs.get(item.namespace)!.push(item);
      }
      
      for (const [ns, items] of groupedByNs) {
        console.log(`📦 ${ns}`);
        for (const item of items) {
          console.log(`   ${item.key || "(root value)"}`);
        }
        console.log();
      }
      
      console.log("💡 提示: 这些键可能被动态使用（如 t(`prefix.${var}`)），请人工确认后再删除。");
    }
  }
  
  console.log("\n✨ 检查完成！");
}

main();
