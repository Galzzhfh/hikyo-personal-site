import type { Metadata } from "next";
import CgBackdrop from "../../components/CgBackdrop";
import SakuraFall from "../../components/SakuraFall";
import gamesData from "../../../content/game-posts.json";
import type { GamePost } from "../../../lib/game";
import VisualArchiveEditor from "../VisualArchiveEditor";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "游戏管理｜秘境",
  description: "秘境游戏推荐管理。",
  robots: { index: false, follow: false },
};

export default function GameManagePage() {
  const basePath = process.env.PAGES_BASE_PATH ?? "";
  return (
    <main className="manage-page">
      <SakuraFall />
      <header className="site-header manage-header">
        <a className="brand" href={`${basePath}/`} aria-label="秘境，返回首页">秘境<small>ひきょう</small></a>
        <nav aria-label="管理导航"><a href={`${basePath}/manage`}>本子管理</a><a href={`${basePath}/manage/anime`}>动画管理</a><a href={`${basePath}/manage/music`}>音乐管理</a></nav>
        <a className="header-button" href={`${basePath}/#games`}>返回游戏 <span>↗</span></a>
      </header>
      <section className="manage-hero"><CgBackdrop /><div className="doujin-hero-shade" /><div className="manage-hero-copy"><p className="eyebrow"><span /> OWNER GAME EDITOR</p><h1>游戏管理<small>ゲームを記録する</small></h1></div></section>
      <VisualArchiveEditor initialItems={gamesData as GamePost[]} basePath={basePath} kind="game" />
    </main>
  );
}
