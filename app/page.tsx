/* eslint-disable @next/next/no-img-element */

import CgBackdrop from "./components/CgBackdrop";
import SakuraFall from "./components/SakuraFall";

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
          <a href="#notes">本子推荐</a>
          <a href={`${basePath}/music/`}>音乐</a>
          <a href="#about">关于</a>
        </nav>
        <a className="header-button" href={`${basePath}/music/`}>音乐室 <span>♪</span></a>
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
            <a className="primary-action" href="#notes">开始漫游 <span>→</span></a>
            <a className="secondary-action" href={`${basePath}/music/`}>播放音乐 <span>♪</span></a>
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
            <p>这里会放我认真读完、想再翻一次的本子。现在先用三个位置看看版式。</p>
            <a className="outline-button" href="#pick-list">推荐を見る <span>→</span></a>
          </div>
        </div>

        <div className="pick-grid" id="pick-list">
          <article className="pick-card pick-card-main">
            <img src={`${basePath}/cg/scene-01/00000001.webp`} alt="绿植环绕的日式室内场景" />
            <div className="pick-overlay">
              <p>SCENERY · SAMPLE 01</p>
              <h3>光が差す部屋</h3>
              <span>等待写下第一篇正式推荐</span>
            </div>
          </article>
          <article className="pick-card">
            <img src={`${basePath}/cg/scene-01/00000003.webp`} alt="夕光中的日式室内场景" loading="lazy" />
            <div className="pick-overlay">
              <p>ATMOSPHERE · SAMPLE 02</p>
              <h3>夕暮れの余韻</h3>
              <span>留给偏爱的画面与故事</span>
            </div>
          </article>
          <article className="pick-card pick-card-note">
            <p className="vertical-copy">好きなものを、好きなままに。</p>
            <div>
              <span>ARCHIVE NOTE</span>
              <h3>喜欢不需要<br />被匆忙解释。</h3>
              <p>以后可以继续增加分类、标签与完整文章页。</p>
            </div>
          </article>
        </div>
      </section>

      <section className="music-invite" aria-label="音乐播放器入口">
        <div className="mini-record" aria-hidden="true"><span>♪</span></div>
        <div>
          <p className="section-index">02 / INSTRUMENTAL ROOM</p>
          <h2>纯音乐，适合让时间慢一点。</h2>
          <p>独立音乐页已经准备好唱片播放器和三首合成试听样曲。</p>
        </div>
        <a className="light-button" href={`${basePath}/music/`}>进入音乐室 <span>→</span></a>
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
          <h2>这里是我的<br />快乐存档。</h2>
          <p>
            分享喜欢的二次元作品、同人誌、游戏与音乐。CG 背景会随着之后加入的差分继续变化，
            这个小站也会一点点长成真正属于我的秘境。
          </p>
          <dl>
            <div><dt>收藏内容</dt><dd>动画 · 游戏 · 同人誌 · 纯音乐</dd></div>
            <div><dt>视觉主题</dt><dd>差分 CG · 白色樱花 · 柔和光影</dd></div>
            <div><dt>本站状态</dt><dd><span /> 缓慢生长中</dd></div>
          </dl>
        </div>
      </section>

      <footer>
        <a className="brand" href="#top">秘境<small>ひきょう</small></a>
        <p>愿快乐在这里，被好好记住。</p>
        <div><span>PERSONAL ARCHIVE</span><span>© 2026</span></div>
      </footer>
    </main>
  );
}
