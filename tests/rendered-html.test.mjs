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
  assert.match(html, /楽しさを/);
  assert.match(html, /真実はいつもひとつ/);
  assert.match(html, /global-player/);
  assert.match(html, /1367154014/);
  assert.match(html, /希望快乐/);
  assert.match(html, /动画、游戏、同人誌与纯音乐/);
  assert.doesNotMatch(html, /把偶然遇见的快乐|纯音乐。/);
  assert.doesNotMatch(html, /视觉主题|本站状态|缓慢生长中/);
  assert.doesNotMatch(html, /现在先用三个位置看看版式/);
  assert.doesNotMatch(html, /花隙/);
  assert.doesNotMatch(html, /SCENERY · SAMPLE|ATMOSPHERE · SAMPLE|以后可以继续增加分类/);
  assert.doesNotMatch(html, /——|二次元语录|海贼王/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|taking shape/i);

  const pagesBasePath = process.env.PAGES_BASE_PATH ?? "";
  if (pagesBasePath) {
    assert.match(html, new RegExp(`${pagesBasePath}/_next/`));
    assert.match(html, new RegExp(`${pagesBasePath}/cg/scene-01/00000001\\.webp`));
    assert.match(html, new RegExp(`${pagesBasePath}/cg/scene-02/00000336\\.webp`));
    assert.match(html, new RegExp(`${pagesBasePath}/music`));
    assert.doesNotMatch(html, new RegExp(`href="${pagesBasePath}/(?:doujin|music|manage)/"`));
    assert.doesNotMatch(html, /(?<![A-Za-z0-9_-])\/_next\//);
    assert.doesNotMatch(html, /src="\/cg\//);
  }
});

test("music room is exported as a dedicated playable page", async () => {
  const html = await readFile(new URL("music.html", clientUrl), "utf8");

  assert.match(html, /音楽室/);
  assert.match(html, /光ある場所へ/);
  assert.match(html, /song-cover\.jpg/);
  assert.match(html, /1367154014/);
  assert.match(html, /track-list/);
  assert.match(html, /owner-entry/);
  assert.doesNotMatch(html, /<iframe/);
  assert.doesNotMatch(html, /触碰唱片|在网易云打开|播放这张唱片/);
});

test("doujin recommendations are exported as a dedicated resource grid", async () => {
  const html = await readFile(new URL("doujin.html", clientUrl), "utf8");

  assert.match(html, /同人誌の.*おすすめ/s);
  assert.match(html, /resource-grid/);
  assert.match(html, /resource-toolbar/);
  assert.match(html, /最多赞/);
  assert.match(html, /静かな午後/);
  assert.match(html, /好きなままに/);
  assert.match(html, /owner-entry/);
  assert.doesNotMatch(html, />管理投稿</);
});

test("doujin gallery supports persistent one-device likes and sorting", async () => {
  const [gallery, route, schema] = await Promise.all([
    readFile(new URL("../app/doujin/DoujinGallery.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/doujin-likes/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
  ]);

  assert.match(gallery, /hikyo-doujin-device-v1/);
  assert.match(gallery, /sortMode === "likes"/);
  assert.match(route, /onConflictDoNothing/);
  assert.match(schema, /doujin_likes_post_device_pk/);
});

test("owner editor is exported without embedding credentials", async () => {
  const html = await readFile(new URL("manage.html", clientUrl), "utf8");

  assert.match(html, /投稿管理/);
  assert.match(html, /GitHub 令牌/);
  assert.match(html, /站主验证/);
  assert.match(html, /进入管理/);
  assert.doesNotMatch(html, /github_pat_[A-Za-z0-9_]+/);
});

test("music editor is exported for owner-only track management", async () => {
  const html = await readFile(new URL("manage/music.html", clientUrl), "utf8");
  const editorSource = await readFile(new URL("../app/manage/music/MusicEditor.tsx", import.meta.url), "utf8");

  assert.match(html, /音乐管理/);
  assert.match(html, /站主验证/);
  assert.match(editorSource, /deleteTrack/);
  assert.match(editorSource, /删除曲目/);
  assert.doesNotMatch(html, /github_pat_[A-Za-z0-9_]+/);
});

test("doujin editor supports deleting posts", async () => {
  const editorSource = await readFile(new URL("../app/manage/DoujinEditor.tsx", import.meta.url), "utf8");
  assert.match(editorSource, /deletePost/);
  assert.match(editorSource, /删除投稿/);
  assert.match(editorSource, /operationInFlightRef/);
});

test("owner editors prevent duplicate GitHub submissions", async () => {
  const [doujinEditor, musicEditor, githubClient] = await Promise.all([
    readFile(new URL("../app/manage/DoujinEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manage/music/MusicEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/github-owner.ts", import.meta.url), "utf8"),
  ]);

  assert.match(doujinEditor, /operationInFlightRef\.current/);
  assert.match(musicEditor, /operationInFlightRef\.current/);
  assert.match(githubClient, /Update is not a fast forward/);
});

test("all visual assets are included in the export", async () => {
  await Promise.all([
    access(new URL("sakura-memory.jpg", clientUrl)),
    access(new URL("og-mikyo.png", clientUrl)),
    access(new URL("favicon.jpg", clientUrl)),
    access(new URL("song-cover.jpg", clientUrl)),
    ...Array.from({ length: 6 }, (_, index) => access(new URL(
      `cg/scene-01/${String(index + 1).padStart(8, "0")}.webp`,
      clientUrl,
    ))),
    ...["00000336", "00000338", "00000340", "00000342", "00000344", "00000346", "00000350"]
      .map((frame) => access(new URL(`cg/scene-02/${frame}.webp`, clientUrl))),
  ]);
});

test("starter preview files are removed", async () => {
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});

test("GitHub Pages navigation uses native links", async () => {
  const routeSources = await Promise.all([
    "../app/page.tsx",
    "../app/doujin/page.tsx",
    "../app/music/page.tsx",
    "../app/manage/page.tsx",
    "../app/manage/music/page.tsx",
  ].map((route) => readFile(new URL(route, import.meta.url), "utf8")));

  for (const source of routeSources) {
    assert.doesNotMatch(source, /next\/link/);
  }
});
