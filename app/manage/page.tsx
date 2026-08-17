import type { Metadata } from "next";
import Link from "next/link";
import CgBackdrop from "../components/CgBackdrop";
import SakuraFall from "../components/SakuraFall";
import postsData from "../../content/doujin-posts.json";
import type { DoujinPost } from "../../lib/doujin";
import DoujinEditor from "./DoujinEditor";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "投稿管理｜秘境",
  description: "秘境同人誌投稿管理。",
  robots: { index: false, follow: false },
};

export default function ManagePage() {
  const basePath = process.env.PAGES_BASE_PATH ?? "";

  return (
    <main className="manage-page">
      <SakuraFall />
      <header className="site-header manage-header">
        <Link className="brand" href={`${basePath}/`} aria-label="秘境，返回首页">秘境<small>ひきょう</small></Link>
        <nav aria-label="主导航">
          <Link href={`${basePath}/`}>首页</Link>
          <Link href={`${basePath}/doujin`}>本子推荐</Link>
          <Link href={`${basePath}/music`}>音乐</Link>
        </nav>
        <Link className="header-button" href={`${basePath}/doujin`}>返回推荐 <span>↗</span></Link>
      </header>

      <section className="manage-hero">
        <CgBackdrop />
        <div className="doujin-hero-shade" />
        <div className="manage-hero-copy">
          <p className="eyebrow"><span /> OWNER EDITOR</p>
          <h1>投稿管理<small>作品を記録する</small></h1>
        </div>
      </section>

      <DoujinEditor initialPosts={postsData as DoujinPost[]} basePath={basePath} />
    </main>
  );
}
