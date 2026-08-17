import type { Metadata } from "next";
import Link from "next/link";
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
        <Link className="brand" href={`${basePath}/`} aria-label="秘境，返回首页">秘境<small>ひきょう</small></Link>
        <nav aria-label="主导航">
          <Link href={`${basePath}/`}>首页</Link><Link href={`${basePath}/doujin`}>本子推荐</Link><Link href={`${basePath}/#about`}>关于</Link>
        </nav>
        <Link className="header-button" href={`${basePath}/`}>返回首页 <span>↗</span></Link>
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
