/**
 * Sincronizează messages/ro.json cu structura din messages/en.json:
 * - aceeași formă de chei (obligatoriu pentru next-intl)
 * - păstrează textele românești deja prezente în ro.json
 * - chei noi din en.json sunt completate cu engleza până se traduc manual
 *
 * Rulează: node scripts/build-ro-messages.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const enPath = path.join(root, "messages", "en.json");
const roPath = path.join(root, "messages", "ro.json");

/**
 * @param {unknown} enNode
 * @param {unknown} roNode
 * @returns {unknown}
 */
function mergeRoFromEn(enNode, roNode) {
  if (typeof enNode === "string") {
    return typeof roNode === "string" ? roNode : enNode;
  }
  if (typeof enNode === "number" || typeof enNode === "boolean") {
    return typeof roNode === typeof enNode ? roNode : enNode;
  }
  if (enNode === null) {
    return roNode === null ? roNode : enNode;
  }
  if (Array.isArray(enNode)) {
    if (!Array.isArray(roNode) || roNode.length !== enNode.length) {
      return enNode.map((item, i) => mergeRoFromEn(item, Array.isArray(roNode) ? roNode[i] : undefined));
    }
    return enNode.map((item, i) => mergeRoFromEn(item, roNode[i]));
  }
  if (typeof enNode === "object") {
    const out = {};
    const roObj = roNode !== null && typeof roNode === "object" && !Array.isArray(roNode) ? roNode : {};
    for (const k of Object.keys(enNode)) {
      out[k] = mergeRoFromEn(enNode[k], roObj[k]);
    }
    return out;
  }
  return enNode;
}

/**
 * @param {unknown} a
 * @param {unknown} b
 * @param {string} path
 */
function assertSameShape(a, b, path = "") {
  if (typeof a !== typeof b) throw new Error(`Type mismatch at ${path}`);
  if (a === null || b === null) {
    if (a !== b) throw new Error(`Null mismatch at ${path}`);
    return;
  }
  if (typeof a === "string") return;
  if (typeof a === "number" || typeof a === "boolean") {
    if (typeof b !== typeof a) throw new Error(`Type mismatch at ${path}`);
    return;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) throw new Error(`Array mismatch at ${path}`);
    for (let i = 0; i < a.length; i++) assertSameShape(a[i], b[i], `${path}[${i}]`);
    return;
  }
  const ak = Object.keys(a).sort();
  const bk = Object.keys(b).sort();
  if (ak.join(",") !== bk.join(",")) throw new Error(`Keys mismatch at ${path}: ${ak} vs ${bk}`);
  for (const k of ak) assertSameShape(a[k], b[k], path ? `${path}.${k}` : k);
}

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
let roExisting = {};
try {
  roExisting = JSON.parse(fs.readFileSync(roPath, "utf8"));
} catch {
  // primul run sau fișier lipsă
}

const ro = mergeRoFromEn(en, roExisting);
assertSameShape(en, ro);

fs.writeFileSync(roPath, JSON.stringify(ro, null, 2) + "\n", "utf8");
console.log("Wrote messages/ro.json — aceeași structură ca en.json, păstrat RO unde exista.");
