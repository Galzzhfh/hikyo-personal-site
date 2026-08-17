/* eslint-disable @next/next/no-img-element */

import CgBackdrop from "./components/CgBackdrop";
import SakuraFall from "./components/SakuraFall";
import AnimeQuote from "./components/AnimeQuote";
import HomeMusicButton from "./components/HomeMusicButton";
import Link from "next/link";

export default function Home() {
  const basePath = process.env.PAGES_BASE_PATH ?? "";

  return (
    <main>
      <SakuraFall />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="秘境，回到首页">
          秘境<small>ひきょう</small>
        </a>
        <nav aria-label="主导航">
          <Link href={`${basePath}/doujin`}>本子推荐</Link>
          <Link href={`${basePath}/music`}>音乐</Link>
          <a href="#about">关于</a>
        </nav>
        <Link className="header-button" href={`${basePath}/music`}>音乐室 <span>♪</span></Link>
      </header>

      <section className="hero" id="top">
        <CgBackdrop />
        <div className="hero-shade" />

        <div className="hero-copy">
          <p className="eyebrow"><span /> PERSONAL ANIME ARCHIVE</p>
          <h1>無聊中<br /><em>寻觅快乐</em></h1>
          <p className="hero-intro">
            动画、游戏、同人誌与纯音乐。<br />把偶然遇见的快乐，慢慢收进这里。
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href={`${basePath}/doujin`}>本子推荐 <span>→</span></Link>
            <Link className="secondary-action" href={`${basePath}/music`}>播放音乐 <span>♪</span></Link>
          </div>
        </div>

        <div className="cg-caption">
          <span>CG SEQUENCE 01</span>
          <p>光与焦点正在缓慢变化</p>
        </div>
        <a className="scroll-cue" href="#notes" aria-label="向下阅读">
          <span /> SCROLL
        </a>
      </section>

      <section className="recommendations" id="notes">
        <div className="recommendation-heading">
          <p className="section-index">01 / DOUJIN PICKS</p>
          <h2>同人誌の<br />おすすめ</h2>
          <div>
            <Link className="outline-button" href={`${basePath}/doujin`}>推荐を見る <span>→</span></Link>
          </div>
        </div>

        <div className="pick-grid" id="pick-list">
          <article className="pick-card pick-card-main">
            <img src={`${basePath}/cg/scene-01/00000001.webp`} alt="绿植环绕的日式室内场景" />
          </article>
          <article className="pick-card">
            <img src={`${basePath}/cg/scene-01/00000003.webp`} alt="夕光中的日式室内场景" loading="lazy" />
          </article>
          <article className="pick-card pick-card-note">
            <p className="vertical-copy">好きなものを、好きなままに。</p>
            <div>
              <span>ARCHIVE NOTE</span>
              <h3>楽しさを<br />探して。</h3>
            </div>
          </article>
        </div>
      </section>

      <section className="music-invite" aria-label="音乐播放器入口">
        <HomeMusicButton />
        <div>
          <p className="section-index">02 / INSTRUMENTAL ROOM</p>
          <h2>音乐鉴赏<small>音楽鑑賞</small></h2>
          <AnimeQuote />
        </div>
        <Link className="light-button" href={`${basePath}/music`}>进入音乐室 <span>→</span></Link>
      </section>

      <section className="motto" aria-label="网站标语">
        <p>無聊中寻觅快乐</p><span>✿</span><p>希望快乐成为永恒</p>
      </section>

      <section className="about" id="about">
        <div className="about-photo">
          <img src={`${basePath}/sakura-memory.jpg`} alt="逆光中的白色花枝" loading="lazy" />
          <span>ABOUT THIS LITTLE PLACE</span>
        </div>
        <div className="about-copy">
          <p className="section-index">03 / ABOUT</p>
          <h2>希望快乐<br />成为永恒</h2>
          <p>
            分享喜欢的二次元作品、同人誌、游戏与音乐。
          </p>
          <dl>
            <div><dt>收藏内容</dt><dd>动画 · 游戏 · 同人誌 · 纯音乐</dd></div>
          </dl>
        </div>
      </section>

      <footer>
        <a className="brand" href="#top">秘境<small>ひきょう</small></a>
        <p>無聊中寻觅快乐</p>
        <div><span>PERSONAL ARCHIVE</span><span>© 2026</span></div>
      </footer>
    </main>
  );
}
