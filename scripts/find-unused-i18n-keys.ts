/**
 * Find unused i18n keys — keys defined in messages/*.json but never
 * referenced from code via useTranslations / getTranslations.
 *
 * Approach (AST-based with the TypeScript compiler API, deliberately
 * CONSERVATIVE — may under-report unused keys, never flags a live key
 * as dead):
 *
 *   1. Flatten every locale JSON into dot-path keys; take their union.
 *   2. Parse each .ts/.tsx under src/. Per file, collect translator
 *      bindings:  const X = (useTranslations|getTranslations|await getTranslations)("ns")
 *      X may be bound to several namespaces in one file.
 *   3. Collect every literal call  X("key")  /  X.method("key")  where X
 *      is a translator var. Candidate full keys = ns + "." + key for each
 *      namespace bound to X in that file. A JSON key is "used" if it is
 *      among the candidates.
 *   4. Unused = defined − used. Also reports code references that match
 *      no JSON key (typos / missing keys) and files using dynamic keys
 *      (t(variable)) which static analysis cannot resolve.
 *
 * Usage:   npx tsx scripts/find-unused-i18n-keys.ts
 * (run from project root)
 */

import * as fs from "node:fs";
import * as path from "node:path";

import * as ts from "typescript";

const ROOT = process.cwd();
const MESSAGES_DIR = path.join(ROOT, "messages");
const SRC_DIR = path.join(ROOT, "src");
const HOOKS = new Set(["useTranslations", "getTranslations"]);

if (!fs.existsSync(MESSAGES_DIR)) {
  console.error(`messages/ not found at ${MESSAGES_DIR} (run from project root)`);
  process.exit(1);
}
if (!fs.existsSync(SRC_DIR)) {
  console.error(`src/ not found at ${SRC_DIR} (run from project root)`);
  process.exit(1);
}

// ---------- flatten JSON ----------
function flatten(obj: unknown, prefix: string, out: Map<string, unknown>) {
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
  } else {
    out.set(prefix, obj);
  }
}

// ---------- load locales ----------
const locales: Record<string, Map<string, unknown>> = {};
const keyToLocales = new Map<string, string[]>(); // key → locales that define it
for (const f of fs.readdirSync(MESSAGES_DIR)) {
  if (!f.endsWith(".json")) continue;
  const locale = f.replace(/\.json$/, "");
  const map = new Map<string, unknown>();
  flatten(JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, f), "utf8")), "", map);
  locales[locale] = map;
  for (const k of map.keys()) {
    if (!keyToLocales.has(k)) keyToLocales.set(k, []);
    keyToLocales.get(k)!.push(locale);
  }
}
const allKeys = new Set(keyToLocales.keys());
const localeNames = Object.keys(locales);

// ---------- helpers ----------
function literalText(node: ts.Node | undefined): string | null {
  if (!node) return null;
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
}

/** For a call expression, return the base identifier name (foo for both foo() and foo.bar()). */
function baseCalleeName(call: ts.CallExpression): string | null {
  const e = call.expression;
  if (ts.isIdentifier(e)) return e.text;
  if (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression)) return e.expression.text;
  return null;
}

/** Walk a method-call chain (a.slice().filter()…) down to its base identifier. */
function arrayReceiverName(node: ts.Expression): string | null {
  if (ts.isIdentifier(node)) return node.text;
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
    return arrayReceiverName(node.expression.expression);
  }
  return null;
}

// ---------- per-file analysis ----------
const usedKeys = new Set<string>();
const dynamicKeySites: string[] = [];
const rootNamespaceSites: string[] = []; // useTranslations() with no namespace

function literalStringValues(node: ts.Node): string[] | null {
  if (ts.isAsExpression(node)) node = node.expression;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return [node.text];
  if (ts.isArrayLiteralExpression(node)) {
    const out: string[] = [];
    for (const el of node.elements) {
      const v = literalStringValues(el);
      if (v === null) return null;
      out.push(...v);
    }
    return out;
  }
  return null;
}

function analyzeFile(filePath: string) {
  const text = fs.readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

  const walk = (visit: (n: ts.Node) => void) => {
    const go = (n: ts.Node) => { visit(n); ts.forEachChild(n, go); };
    go(sf);
  };

  const constObjArrays = new Map<string, Map<string, string[]>>();
  const constStrRecords = new Map<string, string[]>();
  walk((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
      let init = decl.initializer;
      if (ts.isAsExpression(init)) init = init.expression;
      const name = decl.name.text;

      if (ts.isArrayLiteralExpression(init) && init.elements.length > 0 &&
          init.elements.every(ts.isObjectLiteralExpression)) {
        const fields = new Map<string, string[]>();
        for (const el of init.elements) {
          if (!ts.isObjectLiteralExpression(el)) continue;
          for (const prop of el.properties) {
            if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) continue;
            const vals = literalStringValues(prop.initializer);
            if (vals === null) continue;
            const fname = prop.name.text;
            if (!fields.has(fname)) fields.set(fname, []);
            fields.get(fname)!.push(...vals);
          }
        }
        if (fields.size > 0) constObjArrays.set(name, fields);
        continue;
      }

      if (ts.isObjectLiteralExpression(init)) {
        const vals: string[] = [];
        let ok = true;
        for (const prop of init.properties) {
          if (!ts.isPropertyAssignment(prop)) { ok = false; break; }
          const v = literalStringValues(prop.initializer);
          if (v === null) { ok = false; break; }
          vals.push(...v);
        }
        if (ok && vals.length > 0) constStrRecords.set(name, vals);
      }
    }
  });

  const bindings = new Map<string, Set<string>>();
  const addBinding = (v: string, ns: string) => {
    let s = bindings.get(v);
    if (!s) { s = new Set(); bindings.set(v, s); }
    s.add(ns);
  };
  walk((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name)) continue;
      let init = decl.initializer;
      if (init && ts.isAwaitExpression(init)) init = init.expression;
      if (!init || !ts.isCallExpression(init)) continue;
      const callee = baseCalleeName(init);
      if (!callee || !HOOKS.has(callee) || ts.isPropertyAccessExpression(init.expression)) continue;
      const nsArg = init.arguments[0];
      const ns = nsArg ? literalText(nsArg) : null;
      if (ns === null) {
        rootNamespaceSites.push(
          `${filePath}:${sf.getLineAndCharacterOfPosition(decl.getStart()).line + 1}`,
        );
        continue;
      }
      addBinding(decl.name.text, ns);
    }
  });

  const cbParamToArray = new Map<string, string>();
  const cbParamDrops = new Set<string>();
  const ITER_METHODS = new Set(["map", "forEach", "flatMap", "filter", "some", "every", "find", "reduce"]);
  walk((node) => {
    if (!ts.isCallExpression(node)) return;
    const e = node.expression;
    if (!ts.isPropertyAccessExpression(e) || !ITER_METHODS.has(e.name.text)) return;
    const receiver = arrayReceiverName(e.expression);
    if (!receiver || !constObjArrays.has(receiver)) return;
    const cb = node.arguments[0];
    let paramName: string | null = null;
    if (ts.isArrowFunction(cb) && cb.parameters[0] && ts.isIdentifier(cb.parameters[0].name)) {
      paramName = cb.parameters[0].name.text;
    } else if (ts.isFunctionExpression(cb) && cb.parameters[0] && ts.isIdentifier(cb.parameters[0].name)) {
      paramName = cb.parameters[0].name.text;
    }
    if (!paramName) return;
    if (cbParamToArray.has(paramName)) cbParamDrops.add(paramName);
    else cbParamToArray.set(paramName, receiver);
  });
  for (const d of cbParamDrops) cbParamToArray.delete(d);

  const namespacesFor = (varName: string): string[] => {
    const s = bindings.get(varName);
    return s ? [...s] : [];
  };
  const markUsed = (namespaces: string[], key: string) => {
    for (const ns of namespaces) usedKeys.add(`${ns}.${key}`);
  };

  walk((node) => {
    if (!ts.isCallExpression(node)) return;
    const varName = baseCalleeName(node);
    if (!varName || !bindings.has(varName)) return;
    const arg = node.arguments[0];
    if (!arg) return;
    const namespaces = namespacesFor(varName);

    const lit = literalText(arg);
    if (lit !== null) { markUsed(namespaces, lit); return; }

    if (ts.isPropertyAccessExpression(arg) && ts.isIdentifier(arg.expression) &&
        ts.isIdentifier(arg.name)) {
      const arrName = cbParamToArray.get(arg.expression.text);
      const fieldVals = arrName ? constObjArrays.get(arrName)?.get(arg.name.text) : undefined;
      if (fieldVals) { fieldVals.forEach((v) => markUsed(namespaces, v)); return; }
    }

    if (ts.isElementAccessExpression(arg) && ts.isIdentifier(arg.expression)) {
      const vals = constStrRecords.get(arg.expression.text);
      if (vals) { vals.forEach((v) => markUsed(namespaces, v)); return; }
    }

    dynamicKeySites.push(
      `${filePath}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1}`,
    );
  });
}

function walkSrc(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkSrc(full);
    else if (/\.[tc]sx?$/.test(entry.name)) analyzeFile(full);
  }
}
walkSrc(SRC_DIR);

// ---------- results ----------
const unused = [...allKeys].filter((k) => !usedKeys.has(k)).sort();
const notInJson = [...usedKeys].filter((k) => !allKeys.has(k)).sort();

// group unused by top-level namespace
const byNs = new Map<string, string[]>();
for (const k of unused) {
  const ns = k.split(".", 1)[0];
  if (!byNs.has(ns)) byNs.set(ns, []);
  byNs.get(ns)!.push(k);
}

console.log(`Locales scanned: ${localeNames.length} (${localeNames.join(", ")})`);
console.log(`Distinct keys across all locales: ${allKeys.size}`);
console.log(`Keys referenced from code: ${usedKeys.size} (${notInJson.length} of those match no JSON key)`);

console.log(`\n=== ${unused.length} UNUSED key(s) across ${byNs.size} namespace(s) ===\n`);
for (const [ns, keys] of [...byNs.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`[${ns}]  (${keys.length})`);
  for (const k of keys) {
    const locs = keyToLocales.get(k)!;
    const note = locs.length === localeNames.length ? "" : `   ⚠ only in: ${locs.join(", ")}`;
    console.log(`  ${k}${note}`);
  }
  console.log();
}

if (notInJson.length) {
  console.log(`\n=== ${notInJson.length} code reference(s) matching NO JSON key (typo or missing key) ===`);
  for (const k of notInJson) console.log(`  ${k}`);
}
if (dynamicKeySites.length) {
  console.log(`\n=== ${dynamicKeySites.length} site(s) use dynamic keys (static analysis CANNOT resolve — manual review) ===`);
  for (const s of dynamicKeySites) console.log(`  ${s}`);
}
if (rootNamespaceSites.length) {
  console.log(`\n=== ${rootNamespaceSites.length} site(s) call useTranslations() with no/ non-literal namespace (root) ===`);
  for (const s of rootNamespaceSites) console.log(`  ${s}`);
}
