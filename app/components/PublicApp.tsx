"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import type { DoujinPost } from "../../lib/doujin";
import AnimeQuote from "./AnimeQuote";
import CgBackdrop from "./CgBackdrop";
import HomeMusicButton from "./HomeMusicButton";
import SakuraFall from "./SakuraFall";
import DoujinGallery from "../doujin/DoujinGallery";
import MusicPlayer from "../music/MusicPlayer";

type PublicView = "home" | "doujin" | "music";

function viewFromHash(hash: string): PublicView {
  if (hash === "#doujin") return "doujin";
  if (hash === "#music") return "music";
  return "home";
}

export default function PublicApp({ basePath, posts }: { basePath: string; posts: DoujinPost[] }) {
  const [view, setView] = useState<PublicView>("home");

  useEffect(() => {
    function syncView() {
      const hash = window.location.hash;
      const nextView = viewFromHash(hash);
      setView(nextView);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
        const targetId = hash === "#about" ? "about" : hash === "#notes" ? "notes" : hash === "#top" ? "top" : "";
        if (targetId) document.getElementById(targetId)?.scrollIntoView();
        else window.scrollTo({ top: 0, behavior: "auto" });
      }));
    }

    const initialSync = window.setTimeout(syncView, 0);
    window.addEventListener("hashchange", syncView);
    return () => {
      window.clearTimeout(initialSync);
      window.removeEventListener("hashchange", syncView);
    };
  }, []);

  return (
    <>
      <SakuraFall />

      <main data-public-view="home" hidden={view !== "home"}>
        <header className="site-header">
          <a className="brand" href="#home" aria-label="秘境，回到首页">秘境<small>ひきょう</small></a>
          <nav aria-label="主导航">
            <a href="#doujin">本子推荐</a>
            <a href="#music">音乐</a>
            <a href="#about">关于</a>
          </nav>
          <a className="header-button" href="#music">音乐室 <span>♪</span></a>
        </header>

        <section className="hero" id="top">
          <CgBackdrop />
          <div className="hero-shade" />
          <div className="hero-copy">
            <p className="eyebrow"><span /> PERSONAL ANIME ARCHIVE</p>
            <h1>無聊中<br /><em>寻觅快乐</em></h1>
            <p className="hero-intro">动画、游戏、同人誌与纯音乐</p>
            <div className="hero-actions">
              <a className="primary-action" href="#doujin">本子推荐 <span>→</span></a>
              <a className="secondary-action" href="#music">播放音乐 <span>♪</span></a>
            </div>
          </div>
          <div className="cg-caption"><span>CG SEQUENCE 01</span><p>光与焦点正在缓慢变化</p></div>
          <a className="scroll-cue" href="#notes" aria-label="向下阅读"><span /> SCROLL</a>
        </section>

        <section className="recommendations" id="notes">
          <div className="recommendation-heading">
            <p className="section-index">01 / DOUJIN PICKS</p>
            <h2>同人誌の<br />おすすめ</h2>
            <div><a className="outline-button" href="#doujin">推荐を見る <span>→</span></a></div>
          </div>
          <div className="pick-grid" id="pick-list">
            <article className="pick-card pick-card-main"><img src={`${basePath}/cg/scene-01/00000001.webp`} alt="绿植环绕的日式室内场景" /></article>
            <article className="pick-card"><img src={`${basePath}/cg/scene-01/00000003.webp`} alt="夕光中的日式室内场景" loading="lazy" /></article>
            <article className="pick-card pick-card-note">
              <p className="vertical-copy">好きなものを、好きなままに。</p>
              <div><span>ARCHIVE NOTE</span><h3>楽しさを<br />探して。</h3></div>
            </article>
          </div>
        </section>

        <section className="music-invite" aria-label="音乐播放器入口">
          <HomeMusicButton />
          <div><p className="section-index">02 / INSTRUMENTAL ROOM</p><h2>音乐鉴赏<small>音楽鑑賞</small></h2><AnimeQuote /></div>
          <a className="light-button" href="#music">进入音乐室 <span>→</span></a>
        </section>

        <section className="motto" aria-label="网站标语"><p>無聊中寻觅快乐</p><span>✿</span><p>希望快乐成为永恒</p></section>

        <section className="about" id="about">
          <div className="about-photo"><img src={`${basePath}/sakura-memory.jpg`} alt="逆光中的白色花枝" loading="lazy" /><span>ABOUT THIS LITTLE PLACE</span></div>
          <div className="about-copy">
            <p className="section-index">03 / ABOUT</p>
            <h2>希望快乐<br />成为永恒</h2>
            <p>分享喜欢的二次元作品、同人誌、游戏与音乐。</p>
            <dl><div><dt>收藏内容</dt><dd>动画 · 游戏 · 同人誌 · 纯音乐</dd></div></dl>
          </div>
        </section>

        <footer>
          <a className="brand" href="#home">秘境<small>ひきょう</small></a>
          <p>無聊中寻觅快乐</p>
          <div><span>PERSONAL ARCHIVE</span><span>© 2026</span></div>
        </footer>
      </main>

      <main className="doujin-page" data-public-view="doujin" hidden={view !== "doujin"}>
        <header className="site-header doujin-header">
          <a className="brand" href="#home" aria-label="秘境，返回首页">秘境<small>ひきょう</small></a>
          <nav aria-label="主导航"><a href="#home">首页</a><a href="#music">音乐</a><a href="#about">关于</a></nav>
          <a className="owner-entry" href={`${basePath}/manage`} target="_blank" rel="noreferrer" aria-label="站主管理">✦</a>
        </header>
        <section className="doujin-hero">
          <CgBackdrop />
          <div className="doujin-hero-shade" />
          <div className="doujin-hero-copy"><p className="eyebrow"><span /> DOUJIN PICKS</p><h1>同人誌の<br />おすすめ</h1></div>
        </section>
        <section className="resource-section" aria-label="同人誌资源卡片"><DoujinGallery posts={posts} basePath={basePath} /></section>
      </main>

      <main className="music-page" data-public-view="music" hidden={view !== "music"}>
        <header className="site-header music-header">
          <a className="brand" href="#home" aria-label="秘境，返回首页">秘境<small>ひきょう</small></a>
          <nav aria-label="主导航"><a href="#home">首页</a><a href="#doujin">本子推荐</a><a href="#about">关于</a></nav>
          <a className="owner-entry" href={`${basePath}/manage/music`} target="_blank" rel="noreferrer" aria-label="站主管理">✦</a>
        </header>
        <section className="music-stage">
          <CgBackdrop />
          <div className="music-stage-shade" />
          <div className="music-intro"><p className="eyebrow"><span /> INSTRUMENTAL ROOM</p><h1>音楽室</h1></div>
          <MusicPlayer basePath={basePath} />
        </section>
      </main>
    </>
  );
}
