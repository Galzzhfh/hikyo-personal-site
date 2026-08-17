/* eslint-disable @next/next/no-img-element */

import type { Metadata } from "next";
import type { CSSProperties } from "react";
import CgBackdrop from "../components/CgBackdrop";
import SakuraFall from "../components/SakuraFall";
import postsData from "../../content/doujin-posts.json";
import type { DoujinPost } from "../../lib/doujin";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "同人誌推荐｜秘境",
  description: "同人誌推荐与资源收藏。",
};

const recommendations = postsData as DoujinPost[];

export default function DoujinPage() {
  const basePath = process.env.PAGES_BASE_PATH ?? "";

  return (
    <main className="doujin-page">
      <SakuraFall />

      <header className="site-header doujin-header">
        <a className="brand" href={`${basePath}/`} aria-label="秘境，返回首页">秘境<small>ひきょう</small></a>
        <nav aria-label="主导航">
          <a href={`${basePath}/`}>首页</a>
          <a href={`${basePath}/music`}>音乐</a>
          <a href={`${basePath}/#about`}>关于</a>
        </nav>
        <a className="owner-entry" href={`${basePath}/manage`} aria-label="站主管理">✦</a>
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
          {recommendations.map((item, index) => (
            <article
              className="resource-card"
              key={item.id}
              style={{ "--card-delay": `${Math.min(index, 10) * 70}ms` } as CSSProperties}
            >
              <div className="resource-cover">
                <img
                  src={`${basePath}/${item.cover}`}
                  alt={`${item.title} 封面`}
                  loading={index > 3 ? "lazy" : undefined}
                />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="resource-card-body">
                <p>{item.japaneseTitle}</p>
                <h2>{item.title}</h2>
                <p className="resource-card-summary">{item.excerpt}</p>
                <div className="resource-card-meta">
                  {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                {item.sourceUrl ? <a className="resource-link" href={item.sourceUrl} target="_blank" rel="noreferrer">查看收藏 <span>↗</span></a> : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
