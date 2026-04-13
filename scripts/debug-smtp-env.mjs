/**
 * Verifică ce citește Node din .env pentru SMTP (fără a afișa parola).
 * Rulare: node scripts/debug-smtp-env.mjs
 */
import "dotenv/config";

const host = process.env.SMTP_HOST ?? "";
const port = process.env.SMTP_PORT ?? "";
const user = process.env.SMTP_USER ?? "";
const pass = process.env.SMTP_PASS ?? "";
const secure = process.env.SMTP_SECURE ?? "(ne setat → implicit după port)";
const auth = process.env.SMTP_AUTH_METHOD ?? "(implicit LOGIN)";

console.log("--- SMTP din .env (valorile secrete NU se afișează) ---\n");
console.log("SMTP_HOST     :", host || "(LIPSĂ)");
console.log("SMTP_PORT     :", port || "(LIPSĂ)");
console.log("SMTP_SECURE   :", secure);
console.log("SMTP_AUTH_METHOD:", auth);
console.log("SMTP_USER     :", user || "(LIPSĂ)", "→ lungime", user.length);
console.log("SMTP_PASS     : lungime", pass.length, pass.length ? "(OK dacă > 0)" : "(LIPSĂ sau goală!)");
console.log("EMAIL_FROM    :", process.env.EMAIL_FROM ?? "(LIPSĂ)");

if (pass.includes("#")) {
  console.log("\n⚠ Parola conține '#'. În .env, tot ce e după # pe același rând poate fi tratat ca comentariu.");
  console.log('   Folosește ghilimele: SMTP_PASS="parola...cu#diez"');
}

if (pass !== pass.trim()) {
  console.log("\n⚠ Parola are spații la început/sfârșit — elimină-le în .env.");
}

console.log("\nDacă lungimea SMTP_PASS e 0 dar ai pus parolă în fișier, verifică ghilimele și caractere speciale (# $ `).");
