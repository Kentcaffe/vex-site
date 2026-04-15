#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(label, command, args, env = process.env) {
  console.log(`[startup] ${label}`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env,
  });
  return result.status ?? 1;
}

function startNext() {
  const port = process.env.PORT;
  const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
  const args = ["start", "-H", "0.0.0.0"];
  if (port) {
    args.push("-p", port);
  } else {
    console.warn("[startup] PORT is not set. Next.js default port will be used.");
  }

  const status = run("Starting Next.js server", process.execPath, [nextBin, ...args]);
  process.exit(status);
}

console.log("[startup] Boot sequence started (Prisma startup tasks disabled).");
console.log(`[startup] NODE_ENV=${process.env.NODE_ENV || "(unset)"} RENDER=${process.env.RENDER || "false"}`);
startNext();
