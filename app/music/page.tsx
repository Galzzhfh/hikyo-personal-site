import type { Metadata } from "next";
import CgBackdrop from "../components/CgBackdrop";
import SakuraFall from "../components/SakuraFall";
import MusicPlayer from "./MusicPlayer";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "音乐室｜秘境",
  description: "光ある場所へ · 忍",
  openGraph: { title: "音乐室｜秘境", description: "光ある場所へ · 忍" },
  twitter: { card: "summary", title: "音乐室｜秘境", description: "光ある場所へ · 忍" },
};

export default function MusicPage() {
  const basePath = process.env.PAGES_BASE_PATH ?? "";

  return (
    <main className="music-page">
      <SakuraFall />
      <header className="site-header music-header">
        <a className="brand" href={`${basePath}/`} aria-label="秘境，返回首页">秘境<small>ひきょう</small></a>
        <nav aria-label="主导航">
          <a href={`${basePath}/`}>首页</a><a href={`${basePath}/doujin`}>本子推荐</a><a href={`${basePath}/#about`}>关于</a>
        </nav>
        <a className="owner-entry" href={`${basePath}/manage/music`} aria-label="站主管理">✦</a>
      </header>
      <section className="music-stage">
        <CgBackdrop />
        <div className="music-stage-shade" />
        <div className="music-intro">
          <p className="eyebrow"><span /> INSTRUMENTAL ROOM</p>
          <h1>音楽室</h1>
        </div>
        <MusicPlayer basePath={basePath} />
      </section>
    </main>
  );
}
