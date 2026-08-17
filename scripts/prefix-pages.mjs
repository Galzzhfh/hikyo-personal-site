import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";

const basePath = process.env.PAGES_BASE_PATH ?? "";
const clientDirectory = new URL("../dist/client/", import.meta.url);

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const url = new URL(entry.name + (entry.isDirectory() ? "/" : ""), directory);
    if (entry.isDirectory()) return findHtmlFiles(url);
    return entry.name.endsWith(".html") ? [url] : [];
  }));
  return nested.flat();
}

if (basePath) {
  const htmlFiles = await findHtmlFiles(clientDirectory);
  await Promise.all(htmlFiles.map(async (htmlPath) => {
    const html = await readFile(htmlPath, "utf8");
    const prefixed = html.replaceAll(
      /(?<![A-Za-z0-9_-])\/_next\//g,
      `${basePath}/_next/`,
    );
    await writeFile(htmlPath, prefixed);
  }));

}

for (const route of ["music", "doujin", "manage"]) {
  const routeDirectory = new URL(`${route}/`, clientDirectory);
  await mkdir(routeDirectory, { recursive: true });
  await copyFile(new URL(`${route}.html`, clientDirectory), new URL("index.html", routeDirectory));
}
