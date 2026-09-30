import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const contentPath = fileURLToPath(new URL("../content/storylets.json", import.meta.url));
let cache;

export async function storylets() {
  cache ??= JSON.parse(await readFile(contentPath, "utf8"));
  return cache;
}

export async function storylet(id) {
  return (await storylets()).find((entry) => entry.id === id);
}
