import type { Metadata } from "next";
import CgBackdrop from "../../components/CgBackdrop";
import SakuraFall from "../../components/SakuraFall";
import animeData from "../../../content/anime-posts.json";
import type { AnimePost } from "../../../lib/anime";
import VisualArchiveEditor from "../VisualArchiveEditor";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "动画管理｜秘境",
  description: "秘境动画推荐管理。",
  robots: { index: false, follow: false },
};

export default function AnimeManagePage() {
  const basePath = process.env.PAGES_BASE_PATH ?? "";
  return (
    <main className="manage-page">
      <SakuraFall />
      <header className="site-header manage-header">
        <a className="brand" href={`${basePath}/`} aria-label="秘境，返回首页">秘境<small>ひきょう</small></a>
        <nav aria-label="管理导航"><a href={`${basePath}/manage`}>本子管理</a><a href={`${basePath}/manage/games`}>游戏管理</a><a href={`${basePath}/manage/music`}>音乐管理</a></nav>
        <a className="header-button" href={`${basePath}/#anime`}>返回动画 <span>↗</span></a>
      </header>
      <section className="manage-hero"><CgBackdrop basePath={basePath} /><div className="doujin-hero-shade" /><div className="manage-hero-copy"><p className="eyebrow"><span /> OWNER ANIME EDITOR</p><h1>动画管理<small>アニメを記録する</small></h1></div></section>
      <VisualArchiveEditor initialItems={animeData as AnimePost[]} basePath={basePath} kind="anime" />
    </main>
  );
}
