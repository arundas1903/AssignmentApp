#!/usr/bin/env node
/**
 * Build SMS Country Map and publish into the portfolio repo at public/a2patlas/
 * so it is served at https://arundas.me/a2patlas/
 *
 * Usage:
 *   node scripts/publish-to-arundas-me.mjs /path/to/portfolio
 *   # or with PORTFOLIO_DIR env
 *   PORTFOLIO_DIR=../portfolio npm run publish:arundas
 */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const appRoot = resolve(__dirname, "..");
const portfolioDir = resolve(
  process.env.PORTFOLIO_DIR || process.argv[2] || ""
);

if (!portfolioDir || portfolioDir === resolve("")) {
  console.error(
    "Usage: node scripts/publish-to-arundas-me.mjs /path/to/portfolio"
  );
  process.exit(1);
}

const publicDir = join(portfolioDir, "public");
const target = join(publicDir, "a2patlas");

if (!existsSync(publicDir)) {
  console.error(`Portfolio public/ not found at ${publicDir}`);
  process.exit(1);
}

console.log("Building SMS Country Map...");
const build = spawnSync("npm", ["run", "build"], {
  cwd: appRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (build.status !== 0) process.exit(build.status ?? 1);

const dist = join(appRoot, "dist");
if (!existsSync(dist)) {
  console.error("Build did not produce dist/");
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(dist, target, { recursive: true });
console.log(`Published build to ${target}`);
console.log("Next: commit & push the portfolio repo to deploy https://arundas.me/a2patlas/");
