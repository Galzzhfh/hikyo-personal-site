import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const clientUrl = new URL("../dist/client/", import.meta.url);

test("home export uses the requested brand, copy, and CG sequence", async () => {
  const html = await readFile(new URL("index.html", clientUrl), "utf8");

  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /秘境/);
  assert.match(html, /ひきょう/);
  assert.match(html, /無聊中/);
  assert.match(html, /寻觅快乐/);
  assert.match(html, /同人誌の/);
  assert.match(html, /おすすめ/);
  assert.doesNotMatch(html, /花隙/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|taking shape/i);

  const pagesBasePath = process.env.PAGES_BASE_PATH ?? "";
  if (pagesBasePath) {
    assert.match(html, new RegExp(`${pagesBasePath}/_next/`));
    assert.match(html, new RegExp(`${pagesBasePath}/cg/scene-01/00000001\\.webp`));
    assert.match(html, new RegExp(`${pagesBasePath}/music`));
    assert.doesNotMatch(html, /(?<![A-Za-z0-9_-])\/_next\//);
    assert.doesNotMatch(html, /src="\/cg\//);
  }
});

test("music room is exported as a dedicated playable page", async () => {
  const html = await readFile(new URL("music.html", clientUrl), "utf8");

  assert.match(html, /音楽室/);
  assert.match(html, /夜桜の余白/);
  assert.match(html, /试听样曲/);
  assert.match(html, /MusicPlayer/);
});

test("all visual assets are included in the export", async () => {
  await Promise.all([
    access(new URL("sakura-memory.jpg", clientUrl)),
    access(new URL("og-mikyo.png", clientUrl)),
    access(new URL("favicon.jpg", clientUrl)),
    ...Array.from({ length: 6 }, (_, index) => access(new URL(
      `cg/scene-01/${String(index + 1).padStart(8, "0")}.webp`,
      clientUrl,
    ))),
  ]);
});

test("starter preview files are removed", async () => {
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
