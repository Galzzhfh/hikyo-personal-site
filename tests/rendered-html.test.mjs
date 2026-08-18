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
  assert.doesNotMatch(html, /CG SEQUENCE 01|光与焦点正在缓慢变化/);
  assert.doesNotMatch(html, /——|二次元语录|海贼王/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|taking shape/i);

  const pagesBasePath = process.env.PAGES_BASE_PATH ?? "";
  if (pagesBasePath) {
    assert.match(html, new RegExp(`${pagesBasePath}/_next/`));
    assert.match(html, new RegExp(`${pagesBasePath}/cg/scene-01/00000001\\.webp`));
    assert.match(html, new RegExp(`${pagesBasePath}/cg/scene-02/00000336\\.webp`));
    assert.match(html, /href="#music"/);
    assert.doesNotMatch(html, new RegExp(`href="${pagesBasePath}/(?:doujin|music|manage)/"`));
    assert.doesNotMatch(html, /(?<![A-Za-z0-9_-])\/_next\//);
    assert.doesNotMatch(html, /src="\/cg\//);
  }
});

test("music room stays mounted inside the public app", async () => {
  const [html, player, provider, css] = await Promise.all([
    readFile(new URL("index.html", clientUrl), "utf8"),
    readFile(new URL("../app/music/MusicPlayer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/MusicProvider.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(html, /音楽室/);
  assert.match(html, /光ある場所へ/);
  assert.match(html, /song-cover\.jpg/);
  assert.match(html, /1367154014/);
  assert.match(html, /track-list/);
  assert.match(html, /owner-entry/);
  assert.doesNotMatch(html, /<iframe/);
  assert.doesNotMatch(html, /触碰唱片|在网易云打开|播放这张唱片/);
  assert.match(player, /soft-spectrum/);
  assert.match(provider, /music-is-playing/);
  assert.match(provider, /playbackError/);
  assert.equal(JSON.parse(await readFile(new URL("../content/music-tracks.json", import.meta.url), "utf8"))[0].songId, "2737806685");
  assert.match(css, /music-breathe/);
  assert.match(css, /spectrum-wave/);
});

test("doujin recommendations are rendered as openable cards without likes or sorting", async () => {
  const [html, gallery, postsSource] = await Promise.all([
    readFile(new URL("index.html", clientUrl), "utf8"),
    readFile(new URL("../app/doujin/DoujinGallery.tsx", import.meta.url), "utf8"),
    readFile(new URL("../content/doujin-posts.json", import.meta.url), "utf8"),
  ]);
  const posts = JSON.parse(postsSource);

  assert.match(html, /同人誌の.*おすすめ/s);
  assert.match(html, /resource-grid/);
  for (const post of posts) assert.match(html, new RegExp(post.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(html, /owner-entry/);
  assert.match(gallery, /setSelectedPost/);
  assert.match(gallery, /role="dialog"/);
  assert.match(gallery, /reader-canvas/);
  assert.match(gallery, /is-long-strip/);
  assert.match(gallery, /ArrowLeft/);
  assert.match(gallery, /ArrowRight/);
  assert.match(gallery, /aria-label={`打开 \${item.title}`}/);
  assert.doesNotMatch(gallery, /like|sortMode|hikyo-doujin-device/i);
  assert.doesNotMatch(html, />管理投稿</);
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
  assert.match(editorSource, /multiple/);
  assert.match(editorSource, /一次最多上传 20 张阅读页/);
  assert.match(editorSource, /每张漫画长图或阅读页请控制在 20 MB 以内/);
  assert.match(editorSource, /OneDrive \/ SharePoint 图片直链/);
  assert.match(editorSource, /isSupportedRemoteImage/);
  assert.match(editorSource, /本地上传和网盘直链请选择一种阅读来源/);
});

test("remote manga images stay outside GitHub and load through the reader", async () => {
  const [gallery, postsSource] = await Promise.all([
    readFile(new URL("../app/doujin/DoujinGallery.tsx", import.meta.url), "utf8"),
    readFile(new URL("../content/doujin-posts.json", import.meta.url), "utf8"),
  ]);
  const posts = JSON.parse(postsSource);
  const remoteImages = posts.flatMap((post) => post.images ?? []).filter((source) => source.startsWith("https://"));

  assert.ok(remoteImages.length > 0);
  assert.match(remoteImages[0], /\.sharepoint\.com\//);
  assert.match(gallery, /doujinImageSource/);
  assert.match(gallery, /isRemoteDoujinImage/);
});

test("game and anime recommendations open full resource details", async () => {
  const [html, archiveGallery, gamesSource] = await Promise.all([
    readFile(new URL("index.html", clientUrl), "utf8"),
    readFile(new URL("../app/archive/ArchiveGallery.tsx", import.meta.url), "utf8"),
    readFile(new URL("../content/game-posts.json", import.meta.url), "utf8"),
  ]);
  const games = JSON.parse(gamesSource);

  assert.match(html, /ゲームの.*おすすめ/s);
  assert.match(html, /アニメの.*おすすめ/s);
  for (const game of games) assert.match(html, new RegExp(game.title));
  assert.match(archiveGallery, /archive-detail/);
  assert.match(archiveGallery, /archive-preview-stage/);
  assert.match(archiveGallery, /selectedItem\.thoughts/);
  assert.match(archiveGallery, /window\.history\.pushState/);
});

test("game and anime editors support owner CRUD and preview uploads", async () => {
  const [gameHtml, animeHtml, editorSource] = await Promise.all([
    readFile(new URL("manage/games.html", clientUrl), "utf8"),
    readFile(new URL("manage/anime.html", clientUrl), "utf8"),
    readFile(new URL("../app/manage/VisualArchiveEditor.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(gameHtml, /游戏管理/);
  assert.match(animeHtml, /动画管理/);
  assert.match(editorSource, /deleteItem/);
  assert.match(editorSource, /multiple/);
  assert.match(editorSource, /content\/game-posts\.json/);
  assert.match(editorSource, /content\/anime-posts\.json/);
  assert.doesNotMatch(gameHtml + animeHtml, /github_pat_[A-Za-z0-9_]+/);
});

test("owner editors prevent duplicate GitHub submissions", async () => {
  const [doujinEditor, musicEditor, visualEditor, githubClient] = await Promise.all([
    readFile(new URL("../app/manage/DoujinEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manage/music/MusicEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/manage/VisualArchiveEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/github-owner.ts", import.meta.url), "utf8"),
  ]);

  assert.match(doujinEditor, /operationInFlightRef\.current/);
  assert.match(musicEditor, /operationInFlightRef\.current/);
  assert.match(visualEditor, /operationInFlightRef\.current/);
  assert.match(githubClient, /readRepositoryJsonSnapshot/);
  assert.match(githubClient, /expectedHeadSha/);
  assert.match(githubClient, /Update is not a fast forward/);
});

test("Pages deployment supports custom domains and trailing-slash management routes", async () => {
  const [workflow, prefixScript] = await Promise.all([
    readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"),
    readFile(new URL("../scripts/prefix-pages.mjs", import.meta.url), "utf8"),
  ]);

  assert.match(workflow, /id: pages/);
  assert.match(workflow, /steps\.pages\.outputs\.base_path/);
  assert.match(workflow, /steps\.pages\.outputs\.base_url/);
  assert.doesNotMatch(workflow, /repo_name=/);
  assert.match(prefixScript, /"manage\/games"/);
  assert.match(prefixScript, /"manage\/anime"/);
  await Promise.all([
    access(new URL("manage/games/index.html", clientUrl)),
    access(new URL("manage/anime/index.html", clientUrl)),
  ]);
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

test("public navigation uses hash views so the music provider is not reloaded", async () => {
  const [publicApp, doujinRoute, musicRoute] = await Promise.all([
    readFile(new URL("../app/components/PublicApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/doujin/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/music/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(publicApp, /href="#doujin"/);
  assert.match(publicApp, /href="#music"/);
  assert.match(publicApp, /href="#games"/);
  assert.match(publicApp, /href="#anime"/);
  assert.match(publicApp, /data-public-view="home"/);
  assert.match(publicApp, /data-public-view="doujin"/);
  assert.match(publicApp, /data-public-view="music"/);
  assert.match(publicApp, /data-public-view="games"/);
  assert.match(publicApp, /data-public-view="anime"/);
  assert.match(publicApp, /hash\.startsWith\("#games\/"\)/);
  assert.match(publicApp, /hash\.startsWith\("#anime\/"\)/);
  assert.match(doujinRoute, /PublicViewRedirect[^>]+view="doujin"/);
  assert.match(musicRoute, /PublicViewRedirect[^>]+view="music"/);
  assert.doesNotMatch(publicApp, /next\/link/);
});

test("time theme follows the clock and can be adjusted manually", async () => {
  const [control, css] = await Promise.all([
    readFile(new URL("../app/components/ThemeControl.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(control, /hikyo-theme-mode/);
  assert.match(control, /auto.*day.*night/s);
  assert.match(control, /getHours/);
  assert.match(css, /data-time-theme="day"/);
  assert.match(css, /data-time-theme="night"/);
});

test("falling sakura mixes white and pink petals", async () => {
  const [sakura, css] = await Promise.all([
    readFile(new URL("../app/components/SakuraFall.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(sakura, /220 126 155/);
  assert.match(sakura, /247 188 206/);
  assert.match(sakura, /255 255 255/);
  assert.match(css, /--petal-color/);
  assert.match(css, /--petal-glow/);
});
