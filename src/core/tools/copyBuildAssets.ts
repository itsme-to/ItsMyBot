import { cpSync, statSync } from "node:fs";
import { extname } from "node:path";

const assetExtensions = new Set([".json", ".yml"]);

cpSync("src", "build", {
  recursive: true,
  filter: (source) => statSync(source).isDirectory() || assetExtensions.has(extname(source)),
});
