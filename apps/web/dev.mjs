/**
 * Cross-platform dev launcher for the `web` app.
 *
 * Replaces `dotenv-cli` to avoid the Windows CMD "Terminate batch job?" prompt
 * that causes Turbo to report a spurious exit-code-1 failure.
 *
 * Steps:
 *  1. Load .env.local (and .env as fallback) into process.env using Node's
 *     built-in --env-file flag (Node ≥ 20.6) or manual parsing.
 *  2. Spawn Vite's dev server via its JS API so that:
 *     - No intermediate CMD shell is spawned on Windows.
 *     - SIGINT / SIGTERM from Turbo shut down the child process cleanly.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Parse a .env file and merge vars into process.env (existing vars win). */
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    // Skip blanks and comments
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip inline comments (after un-quoted value)
    const commentIdx = value.search(/\s+#/);
    if (commentIdx !== -1) value = value.slice(0, commentIdx).trim();
    // Only set if not already defined (dotenv convention)
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

// Load .env first, then .env.local overrides (same precedence as Vite)
loadEnvFile(resolve(__dirname, ".env"));
loadEnvFile(resolve(__dirname, ".env.local"));

// Resolve the Vite bin that was installed in this package's node_modules
const viteBin = resolve(__dirname, "node_modules", "vite", "bin", "vite.js");

// Build the args: node --import ./instrument.server.mjs <viteBin> dev --port 3000
const args = [
  "--import",
  "./instrument.server.mjs",
  viteBin,
  "dev",
  "--port",
  "3000",
];

const child = spawn(process.execPath, args, {
  cwd: __dirname,
  stdio: "inherit",
  // Do NOT use shell:true — that's what causes the CMD "Terminate batch job?" on Windows
  shell: false,
});

// Forward signals so Turbo can shut down cleanly
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => child.kill(sig));
}

child.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
