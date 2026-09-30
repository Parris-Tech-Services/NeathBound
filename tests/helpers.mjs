import { readFile } from "node:fs/promises";
import { loadContent } from "../src/game/content.js";

export const readContentJson = async (name) =>
  JSON.parse(await readFile(new URL(`../content/${name}.json`, import.meta.url), "utf8"));

export const content = await loadContent(readContentJson);

export function memoryStorage() {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), data };
}
