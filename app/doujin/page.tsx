/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import CgBackdrop from "../components/CgBackdrop";
import SakuraFall from "../components/SakuraFall";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "同人誌推荐｜秘境",
  description: "同人誌推荐与资源收藏。",
};

const recommendations = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  image: String(index + 1).padStart(8, "0"),
}));

export default function DoujinPage() {
  const basePath = process.env.PAGES_BASE_PATH ?? "";

  return (
    <main className="doujin-page">
      <SakuraFall />

      <header className="site-header doujin-header">
        <a className="brand" href={`${basePath}/`} aria-label="秘境，返回首页">秘境<small>ひきょう</small></a>
        <nav aria-label="主导航">
          <a href={`${basePath}/`}>首页</a>
          <a href={`${basePath}/music/`}>音乐</a>
          <a href={`${basePath}/#about`}>关于</a>
        </nav>
        <a className="header-button" href={`${basePath}/`}>返回首页 <span>↗</span></a>
      </header>

      <section className="doujin-hero">
        <CgBackdrop />
        <div className="doujin-hero-shade" />
        <div className="doujin-hero-copy">
          <p className="eyebrow"><span /> DOUJIN PICKS</p>
          <h1>同人誌の<br />おすすめ</h1>
        </div>
      </section>

      <section className="resource-section" aria-label="同人誌资源卡片">
        <div className="resource-grid">
          {recommendations.map((item) => (
            <article className="resource-card" key={item.id}>
              <div className="resource-cover">
                <img
                  src={`${basePath}/cg/scene-01/${item.image}.webp`}
                  alt={`同人誌推荐位 ${String(item.id).padStart(2, "0")} 封面占位图`}
                  loading={item.id > 4 ? "lazy" : undefined}
                />
                <span>{String(item.id).padStart(2, "0")}</span>
              </div>
              <div className="resource-card-body">
                <h2>推荐位 {String(item.id).padStart(2, "0")}</h2>
                <div className="resource-card-meta">
                  <span>同人誌</span>
                  <span>待补充</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
