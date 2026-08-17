"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type CSSProperties } from "react";
import type { DoujinPost } from "../../lib/doujin";

export default function DoujinGallery({ posts, basePath }: { posts: DoujinPost[]; basePath: string }) {
  const [selectedPost, setSelectedPost] = useState<DoujinPost | null>(null);

  useEffect(() => {
    if (!selectedPost) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedPost(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedPost]);

  return (
    <>
      <div className="resource-grid">
        {posts.map((item, index) => (
          <button
            className="resource-card"
            key={item.id}
            type="button"
            onClick={() => setSelectedPost(item)}
            style={{ "--card-delay": `${Math.min(index, 10) * 70}ms` } as CSSProperties}
            aria-label={`打开 ${item.title}`}
          >
            <span className="resource-cover">
              <img src={`${basePath}/${item.cover}`} alt={`${item.title} 封面`} loading={index > 3 ? "lazy" : undefined} />
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
        <div className="resource-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedPost(null);
        }}>
          <section className="resource-modal" role="dialog" aria-modal="true" aria-labelledby="resource-modal-title">
            <button className="resource-modal-close" type="button" onClick={() => setSelectedPost(null)} aria-label="关闭">×</button>
            <div className="resource-modal-cover"><img src={`${basePath}/${selectedPost.cover}`} alt={`${selectedPost.title} 封面`} /></div>
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
