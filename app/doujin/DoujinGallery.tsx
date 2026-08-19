"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type CSSProperties } from "react";
import { doujinImageSource, isRemoteDoujinImage, type DoujinPost } from "../../lib/doujin";

function readerImages(post: DoujinPost) {
  return post.images?.length ? [...new Set(post.images)] : [post.cover];
}

export default function DoujinGallery({ posts, basePath }: { posts: DoujinPost[]; basePath: string }) {
  const [selectedPost, setSelectedPost] = useState<DoujinPost | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [imageAttempt, setImageAttempt] = useState(0);
  const [imageLoadState, setImageLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [longStripSource, setLongStripSource] = useState("");
  const pages = selectedPost ? readerImages(selectedPost) : [];
  const activeImageSource = selectedPost ? doujinImageSource(basePath, pages[pageIndex]) : "";
  const isLongStrip = longStripSource === activeImageSource;

  useEffect(() => {
    if (!selectedPost) return;
    const currentPost = selectedPost;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeOrTurn(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedPost(null);
      if (event.key === "ArrowLeft") setPageIndex((value) => Math.max(0, value - 1));
      if (event.key === "ArrowRight") setPageIndex((value) => Math.min(readerImages(currentPost).length - 1, value + 1));
    }
    window.addEventListener("keydown", closeOrTurn);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOrTurn);
    };
  }, [selectedPost]);

  function openPost(post: DoujinPost) {
    setPageIndex(0);
    setImageAttempt(0);
    setImageLoadState("loading");
    setSelectedPost(post);
  }

  return (
    <>
      <div className="resource-grid">
        {posts.map((item, index) => (
          <button className="resource-card" key={item.id} type="button" onClick={() => openPost(item)} style={{ "--card-delay": `${Math.min(index, 10) * 70}ms` } as CSSProperties} aria-label={`打开 ${item.title}`}>
            <span className="resource-cover">
              <img src={doujinImageSource(basePath, item.cover)} alt={`${item.title} 封面`} loading={index > 3 ? "lazy" : undefined} />
              <span>{String(index + 1).padStart(2, "0")}</span>
            </span>
            <span className="resource-card-body">
              <span className="resource-card-kicker">{item.japaneseTitle}</span>
              <strong className="resource-card-title">{item.title}</strong>
              <span className="resource-card-summary">{item.excerpt}</span>
              <span className="resource-card-meta">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</span>
            </span>
          </button>
        ))}
      </div>

      {selectedPost ? (
        <div className="resource-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPost(null); }}>
          <section className="resource-modal reader-modal" role="dialog" aria-modal="true" aria-labelledby="resource-modal-title">
            <button className="resource-modal-close" type="button" onClick={() => setSelectedPost(null)} aria-label="关闭">×</button>
            <div className={`resource-reader ${isLongStrip ? "is-long-strip" : ""}`}>
              {isLongStrip && pages.length > 1 ? <div className="reader-long-strip-controls" aria-label="长条漫画翻页">
                <button type="button" onClick={() => setPageIndex((value) => Math.max(0, value - 1))} disabled={pageIndex === 0}>← 上一张</button>
                <span>{String(pageIndex + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}</span>
                <button type="button" onClick={() => setPageIndex((value) => Math.min(pages.length - 1, value + 1))} disabled={pageIndex === pages.length - 1}>下一张 →</button>
              </div> : null}
              <div className={`reader-canvas is-image-${imageLoadState}`}>
                <img
                  key={`${activeImageSource}-${imageAttempt}`}
                  className={imageLoadState === "error" ? "is-failed" : undefined}
                  src={activeImageSource}
                  alt={`${selectedPost.title} 第 ${pageIndex + 1} 页`}
                  decoding="async"
                  fetchPriority="high"
                  onLoad={(event) => {
                    const { naturalHeight, naturalWidth } = event.currentTarget;
                    setLongStripSource(naturalHeight > naturalWidth * 3 ? activeImageSource : "");
                    setImageLoadState("loaded");
                  }}
                  onError={() => setImageLoadState("error")}
                />
                {imageLoadState === "loading" ? <div className="reader-image-status"><p>大图加载中，请稍候…</p></div> : null}
                {imageLoadState === "error" ? <div className="reader-image-status is-error"><div><p>图片加载失败</p><button type="button" onClick={() => { setImageLoadState("loading"); setImageAttempt((value) => value + 1); }}>重新加载</button><a href={activeImageSource} target="_blank" rel="noreferrer">单独打开或下载原图</a></div></div> : null}
                {!isLongStrip && pages.length > 1 ? <>
                  <button className="reader-prev" type="button" onClick={() => setPageIndex((value) => Math.max(0, value - 1))} disabled={pageIndex === 0} aria-label="上一页">←</button>
                  <button className="reader-next" type="button" onClick={() => setPageIndex((value) => Math.min(pages.length - 1, value + 1))} disabled={pageIndex === pages.length - 1} aria-label="下一页">→</button>
                  <span className="reader-count">{String(pageIndex + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}</span>
                </> : null}
              </div>
              {pages.length > 1 ? <div className="reader-thumbnails">{pages.map((page, index) => <button className={pageIndex === index ? "is-active" : ""} type="button" key={page} onClick={() => setPageIndex(index)} aria-label={`阅读第 ${index + 1} 页`}>{isRemoteDoujinImage(page) ? <span>{index + 1}</span> : <img src={doujinImageSource(basePath, page)} alt="" loading="lazy" />}</button>)}</div> : null}
            </div>
            <div className="resource-modal-copy">
              <p>{selectedPost.japaneseTitle}</p>
              <h2 id="resource-modal-title">{selectedPost.title}</h2>
              <span>{selectedPost.excerpt}</span>
              <div className="resource-card-meta">{selectedPost.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              {selectedPost.sourceUrl ? <a className="resource-modal-link" href={selectedPost.sourceUrl} target="_blank" rel="noreferrer">查看收藏 <span>↗</span></a> : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
