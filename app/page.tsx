/* eslint-disable @next/next/no-img-element */

export default function Home() {
  return (
    <main>
      <div className="petals" aria-hidden="true">
        <span>✦</span><span>✦</span><span>✦</span><span>✦</span><span>✦</span>
      </div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="花隙，回到首页">
          花隙<span>。</span>
        </a>
        <nav aria-label="主导航">
          <a href="#notes">随笔</a>
          <a href="#favorites">收藏</a>
          <a href="#about">关于</a>
        </nav>
        <a className="header-link" href="#notes">翻阅近况 <span>↘</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> PERSONAL ARCHIVE · 2026</p>
          <h1>
            在無聊的<br />
            <em>缝隙</em>里，<br />
            收藏快乐。
          </h1>
          <p className="hero-intro">
            这里放着让我眼睛一亮的动画、游戏、音乐，
            以及生活里那些不值得忘记的小事。
          </p>
          <a className="primary-action" href="#notes">
            开始漫游 <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="hero-visual">
          <div className="photo-card">
            <div className="photo-frame">
              <img src="/sakura-memory.jpg" alt="阳光下盛开的白色花枝" />
              <div className="photo-glow" />
            </div>
            <p><span>春日标本</span><small>NO. 001</small></p>
          </div>
          <div className="orbit-note" aria-hidden="true">
            <span>日常收集家</span>
            <b>✿</b>
          </div>
        </div>

        <div className="hero-status">
          <p><span>NOW PLAYING</span> 靠近一点点 · Favorite playlist</p>
          <p><span>RECENT MOOD</span> 春困 / 放空 / 期待</p>
        </div>
        <a className="scroll-cue" href="#notes" aria-label="向下阅读">
          <span /> SCROLL TO WANDER
        </a>
      </section>

      <section className="first-note" id="notes">
        <p className="section-index">01 / RECENT NOTES</p>
        <div>
          <p className="note-date">AUG. 16, 2026 · 日常随笔</p>
          <h2>一些喜欢的东西，<br />值得被认真记住。</h2>
          <p>第一篇文章的位置。以后可以在这里写下一次心动、一段旋律，或一个通关后的夜晚。</p>
          <a href="#favorites">先看看收藏 <span>→</span></a>
        </div>
      </section>

      <section className="notes-grid" aria-label="近期文章">
        <article className="note-card note-card-featured">
          <div className="note-art note-art-anime" aria-hidden="true">
            <span>映</span>
            <small>01</small>
          </div>
          <div className="note-card-copy">
            <p>动画 · 8 MIN READ</p>
            <h3>重看旧动画时，<br />我在寻找什么？</h3>
            <span>2026.08.12</span>
          </div>
        </article>

        <article className="note-card">
          <div className="note-art note-art-music" aria-hidden="true">
            <span>♪</span>
            <small>02</small>
          </div>
          <div className="note-card-copy">
            <p>音乐 · PLAYLIST</p>
            <h3>最近反复播放的<br />五首歌</h3>
            <span>2026.08.03</span>
          </div>
        </article>

        <article className="note-card">
          <div className="note-art note-art-game" aria-hidden="true">
            <span>雨</span>
            <small>03</small>
          </div>
          <div className="note-card-copy">
            <p>游戏 · SCREENSHOT</p>
            <h3>把游戏里的雨天<br />存进相册</h3>
            <span>2026.07.26</span>
          </div>
        </article>
        <p className="sample-note">目前是内容样刊，之后换成你的真实分享就好。</p>
      </section>

      <section className="favorites" id="favorites">
        <div className="section-heading">
          <p className="section-index">02 / CURRENT FAVORITES</p>
          <h2>最近偏爱。</h2>
          <p>把一时的喜欢郑重收好。点击卡片，可以展开一张简短的推荐便笺。</p>
        </div>

        <div className="favorite-list">
          <details name="favorite">
            <summary>
              <span className="favorite-number">01</span>
              <span className="favorite-title"><small>ANIME</small>适合慢慢沉进去的故事</span>
              <span className="favorite-mark">映</span>
              <span className="favorite-toggle" aria-hidden="true">＋</span>
            </summary>
            <div className="favorite-detail">
              <p>不是追求热闹，而是喜欢那些看完以后还会在心里下很久小雨的作品。</p>
              <span>氛围 / 日常 / 余韵</span>
            </div>
          </details>

          <details name="favorite">
            <summary>
              <span className="favorite-number">02</span>
              <span className="favorite-title"><small>MUSIC</small>适合戴上耳机的夜晚</span>
              <span className="favorite-mark">音</span>
              <span className="favorite-toggle" aria-hidden="true">＋</span>
            </summary>
            <div className="favorite-detail">
              <p>有些歌不是背景音，它们会替说不清的心情找到一个刚刚好的形状。</p>
              <span>夜行 / 循环 / 放空</span>
            </div>
          </details>

          <details name="favorite">
            <summary>
              <span className="favorite-number">03</span>
              <span className="favorite-title"><small>GAME</small>会让人忘记时间的小世界</span>
              <span className="favorite-mark">游</span>
              <span className="favorite-toggle" aria-hidden="true">＋</span>
            </summary>
            <div className="favorite-detail">
              <p>喜欢探索、收集和偶然撞见的故事，也喜欢通关之后舍不得离开的那一刻。</p>
              <span>探索 / 叙事 / 收藏</span>
            </div>
          </details>

          <details name="favorite">
            <summary>
              <span className="favorite-number">04</span>
              <span className="favorite-title"><small>FOUND</small>一切不方便归类的惊喜</span>
              <span className="favorite-mark">拾</span>
              <span className="favorite-toggle" aria-hidden="true">＋</span>
            </summary>
            <div className="favorite-detail">
              <p>一张照片、一家小店、一句突然记住的话——快乐本来就不必被严格分类。</p>
              <span>日常 / 摄影 / 偶遇</span>
            </div>
          </details>
        </div>
      </section>

      <section className="motto" aria-label="网站标语">
        <p>無聊中寻觅快乐</p>
        <span>✿</span>
        <p>希望快乐成为永恒</p>
      </section>

      <section className="about" id="about">
        <div className="about-photo">
          <img src="/sakura-memory.jpg" alt="逆光中的白色花枝" loading="lazy" />
          <span>ABOUT THIS LITTLE PLACE</span>
        </div>
        <div className="about-copy">
          <p className="section-index">03 / ABOUT</p>
          <h2>你好，这里是<br />我的快乐存档。</h2>
          <p>
            我相信喜欢一件东西时，认真说出「为什么喜欢」本身就是一件很幸福的事。
            所以建了这个小站，慢慢存放动画、游戏、音乐、照片与一些日常碎片。
          </p>
          <dl>
            <div><dt>正在喜欢</dt><dd>动画 · 游戏 · 音乐 · 摄影</dd></div>
            <div><dt>更新频率</dt><dd>随缘，但每次都认真</dd></div>
            <div><dt>本站状态</dt><dd><span /> 缓慢生长中</dd></div>
          </dl>
        </div>
      </section>

      <footer>
        <a className="brand" href="#top">花隙<span>。</span></a>
        <p>愿你也能在無聊的缝隙里，捡到一点快乐。</p>
        <div><span>PERSONAL ARCHIVE</span><span>© 2026</span></div>
      </footer>
    </main>
  );
}
