import type { Metadata } from "next";
import CgBackdrop from "../../components/CgBackdrop";
import SakuraFall from "../../components/SakuraFall";
import tracksData from "../../../content/music-tracks.json";
import type { MusicTrack } from "../../../lib/music";
import MusicEditor from "./MusicEditor";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "音乐管理｜秘境",
  description: "秘境音乐曲目管理。",
  robots: { index: false, follow: false },
};

export default function MusicManagePage() {
  const basePath = process.env.PAGES_BASE_PATH ?? "";

  return (
    <main className="manage-page">
      <SakuraFall />
      <header className="site-header manage-header">
        <a className="brand" href={`${basePath}/`} aria-label="秘境，返回首页">秘境<small>ひきょう</small></a>
        <nav aria-label="管理导航">
          <a href={`${basePath}/manage`}>投稿管理</a>
          <a href={`${basePath}/manage/games`}>游戏管理</a>
          <a href={`${basePath}/manage/anime`}>动画管理</a>
          <a href={`${basePath}/doujin`}>本子推荐</a>
          <a href={`${basePath}/music`}>音乐室</a>
        </nav>
        <a className="header-button" href={`${basePath}/music`}>返回音乐 <span>↗</span></a>
      </header>
      <section className="manage-hero">
        <CgBackdrop />
        <div className="doujin-hero-shade" />
        <div className="manage-hero-copy">
          <p className="eyebrow"><span /> OWNER MUSIC EDITOR</p>
          <h1>音乐管理<small>音楽を記録する</small></h1>
        </div>
      </section>
      <MusicEditor initialTracks={tracksData as MusicTrack[]} basePath={basePath} />
    </main>
  );
}
