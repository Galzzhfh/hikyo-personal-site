import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("static export contains the finished personal archive", async () => {
  const html = await readFile(new URL("../dist/client/index.html", import.meta.url), "utf8");

  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /花隙/);
  assert.match(html, /無聊中寻觅快乐/);
  assert.match(html, /希望快乐成为永恒/);
  assert.match(html, /最近偏爱/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|taking shape/i);

  const pagesBasePath = process.env.PAGES_BASE_PATH ?? "";
  if (pagesBasePath) {
    assert.match(html, new RegExp(`${pagesBasePath}/_next/`));
    assert.match(html, new RegExp(`${pagesBasePath}/sakura-memory\\.jpg`));
    assert.doesNotMatch(html, /(?<![A-Za-z0-9_-])\/_next\//);
    assert.doesNotMatch(html, /(?<![A-Za-z0-9_-])\/sakura-memory\.jpg/);
  }

  await Promise.all([
    access(new URL("../dist/client/sakura-memory.jpg", import.meta.url)),
    access(new URL("../dist/client/og.png", import.meta.url)),
    access(new URL("../dist/client/favicon.jpg", import.meta.url)),
  ]);
});

test("starter preview files are removed", async () => {
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
