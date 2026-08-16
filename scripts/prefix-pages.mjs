import { readFile, writeFile } from "node:fs/promises";

const basePath = process.env.PAGES_BASE_PATH ?? "";

if (basePath) {
  const htmlPath = new URL("../dist/client/index.html", import.meta.url);
  const html = await readFile(htmlPath, "utf8");
  const prefixed = html
    .replaceAll(/(?<![A-Za-z0-9_-])\/_next\//g, `${basePath}/_next/`)
    .replaceAll(/(?<![A-Za-z0-9_-])\/sakura-memory\.jpg/g, `${basePath}/sakura-memory.jpg`);
  await writeFile(htmlPath, prefixed);
}
