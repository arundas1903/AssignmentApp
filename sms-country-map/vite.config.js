import { defineConfig } from "vite";

// Default: https://arundas.me/a2patlas/
// Override for project Pages: VITE_BASE=/AssignmentApp/ npm run build
export default defineConfig({
  base: process.env.VITE_BASE || "/a2patlas/",
});
