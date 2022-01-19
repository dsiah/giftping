#!/usr/bin/env node
require("esbuild")
  .build({
    platform: "node",
    logLevel: "info",
    entryPoints: ["backend/index.ts"],
    outdir: "dist",
    watch: true,
    bundle: true,
    bundle: true,
    external: ["express", "pg-native", "argon2"],
  })
  .catch(() => process.exit(1));
