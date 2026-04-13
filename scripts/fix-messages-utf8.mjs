/**
 * Repairs en.json / ro.json that mix valid UTF-8 with raw Latin-1 bytes (e.g. 0xB2 for ², 0xA9 for ©).
 * Reads stdin or file paths, writes UTF-8 that passes strict JSON + UTF-8 validation.
 */
import fs from "node:fs";

function tryReadUtf8Char(buf, i) {
  const b0 = buf[i];
  if (b0 < 0x80) return { cp: b0, len: 1 };
  if ((b0 & 0xe0) === 0xc0) {
    if (i + 1 >= buf.length) return null;
    const b1 = buf[i + 1];
    if ((b1 & 0xc0) !== 0x80) return null;
    const cp = ((b0 & 0x1f) << 6) | (b1 & 0x3f);
    if (cp < 0x80) return null;
    return { cp, len: 2 };
  }
  if ((b0 & 0xf0) === 0xe0) {
    if (i + 2 >= buf.length) return null;
    const b1 = buf[i + 1];
    const b2 = buf[i + 2];
    if ((b1 & 0xc0) !== 0x80 || (b2 & 0xc0) !== 0x80) return null;
    const cp = ((b0 & 0x0f) << 12) | ((b1 & 0x3f) << 6) | (b2 & 0x3f);
    if (cp < 0x800 || (cp >= 0xd800 && cp <= 0xdfff)) return null;
    return { cp, len: 3 };
  }
  if ((b0 & 0xf8) === 0xf0) {
    if (i + 3 >= buf.length) return null;
    const b1 = buf[i + 1];
    const b2 = buf[i + 2];
    const b3 = buf[i + 3];
    if ((b1 & 0xc0) !== 0x80 || (b2 & 0xc0) !== 0x80 || (b3 & 0xc0) !== 0x80) return null;
    const cp = ((b0 & 0x07) << 18) | ((b1 & 0x3f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f);
    if (cp < 0x10000 || cp > 0x10ffff) return null;
    return { cp, len: 4 };
  }
  return null;
}

/** Decode mixed UTF-8 + stray Latin-1 bytes to a JavaScript string. */
function decodeMixed(buf) {
  let out = "";
  for (let i = 0; i < buf.length; ) {
    const ch = tryReadUtf8Char(buf, i);
    if (ch) {
      out += String.fromCodePoint(ch.cp);
      i += ch.len;
    } else {
      out += String.fromCodePoint(buf[i]);
      i += 1;
    }
  }
  return out;
}

function fixFile(path) {
  const raw = fs.readFileSync(path);
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(raw);
    console.error(`${path}: already valid UTF-8`);
    return;
  } catch {
    /* repair */
  }
  const text = decodeMixed(raw);
  const parsed = JSON.parse(text);
  const out = JSON.stringify(parsed, null, 2) + "\n";
  fs.writeFileSync(path, out, "utf8");
  new TextDecoder("utf-8", { fatal: true }).decode(fs.readFileSync(path));
  JSON.parse(fs.readFileSync(path, "utf8"));
  console.error(`${path}: repaired and normalized`);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node scripts/fix-messages-utf8.mjs <file.json> ...");
  process.exit(1);
}
for (const f of files) fixFile(f);
