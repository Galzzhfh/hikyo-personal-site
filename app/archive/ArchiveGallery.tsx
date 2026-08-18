"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type CSSProperties } from "react";
import type { VisualArchiveItem } from "../../lib/archive";

type ArchiveGalleryProps = {
  items: VisualArchiveItem[];
  basePath: string;
  sectionHash: "games" | "anime";
  cardLabel: string;
  emptyLabel: string;
};

function detailId(hash: string, sectionHash: string) {
  const prefix = `#${sectionHash}/`;
  return hash.startsWith(prefix) ? decodeURIComponent(hash.slice(prefix.length)) : "";
}

export default function ArchiveGallery({ items, basePath, sectionHash, cardLabel, emptyLabel }: ArchiveGalleryProps) {
  const [selectedId, setSelectedId] = useState("");
  const [previewIndex, setPreviewIndex] = useState(0);
  const selectedItem = items.find((item) => item.id === selectedId) ?? null;
  const previews = selectedItem?.previews.length ? selectedItem.previews : selectedItem ? [selectedItem.cover] : [];

  useEffect(() => {
    function syncSelection() {
      setSelectedId(detailId(window.location.hash, sectionHash));
      setPreviewIndex(0);
    }
    syncSelection();
    window.addEventListener("hashchange", syncSelection);
    window.addEventListener("popstate", syncSelection);
    return () => {
      window.removeEventListener("hashchange", syncSelection);
      window.removeEventListener("popstate", syncSelection);
    };
  }, [sectionHash]);

  useEffect(() => {
    if (!selectedItem) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") window.location.hash = sectionHash;
      if (event.key === "ArrowLeft") setPreviewIndex((value) => Math.max(0, value - 1));
      if (event.key === "ArrowRight") setPreviewIndex((value) => Math.min(previews.length - 1, value + 1));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previews.length, sectionHash, selectedItem]);

  function openItem(item: VisualArchiveItem) {
    window.history.pushState(null, "", `#${sectionHash}/${encodeURIComponent(item.id)}`);
    setSelectedId(item.id);
    setPreviewIndex(0);
  }

  if (selectedItem) {
    return (
      <article className="archive-detail">
        <a className="archive-back" href={`#${sectionHash}`}>← 返回推荐</a>
        <section className="archive-summary-card">
          <img src={`${basePath}/${selectedItem.cover}`} alt={`${selectedItem.title} 封面`} />
          <div>
            <small>{selectedItem.japaneseTitle}</small>
            <h2>{selectedItem.title}</h2>
            <p>{selectedItem.summary}</p>
            <div className="resource-card-meta">{selectedItem.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </div>
        </section>
        <div className="archive-detail-grid">
          <section className="archive-preview-card" aria-label="作品预览图">
            <div className="archive-preview-stage">
              <img src={`${basePath}/${previews[previewIndex]}`} alt={`${selectedItem.title} 预览图 ${previewIndex + 1}`} />
              {previews.length > 1 ? <>
                <button className="archive-preview-prev" type="button" onClick={() => setPreviewIndex((value) => Math.max(0, value - 1))} disabled={previewIndex === 0} aria-label="上一张">←</button>
                <button className="archive-preview-next" type="button" onClick={() => setPreviewIndex((value) => Math.min(previews.length - 1, value + 1))} disabled={previewIndex === previews.length - 1} aria-label="下一张">→</button>
                <span>{String(previewIndex + 1).padStart(2, "0")} / {String(previews.length).padStart(2, "0")}</span>
              </> : null}
            </div>
            {previews.length > 1 ? <div className="archive-thumbnails">{previews.map((preview, index) => (
              <button className={previewIndex === index ? "is-active" : ""} type="button" key={preview} onClick={() => setPreviewIndex(index)} aria-label={`查看预览图 ${index + 1}`}>
                <img src={`${basePath}/${preview}`} alt="" />
              </button>
            ))}</div> : null}
          </section>
          <section className="archive-note-card">
            <small>ARCHIVE NOTE</small>
            <h3>{selectedItem.title}</h3>
            <p>{selectedItem.thoughts}</p>
          </section>
        </div>
      </article>
    );
  }

  if (!items.length) return <p className="archive-empty">{emptyLabel}</p>;

  return (
    <div className="archive-grid">
      {items.map((item, index) => (
        <button className="archive-card" type="button" key={item.id} onClick={() => openItem(item)} style={{ "--card-delay": `${index * 80}ms` } as CSSProperties} aria-label={`打开 ${item.title}`}>
          <span className="archive-card-cover"><img src={`${basePath}/${item.cover}`} alt={`${item.title} 预览`} /><span>{cardLabel}</span></span>
          <span className="archive-card-copy"><small>{item.japaneseTitle}</small><strong>{item.title}</strong><span>{item.summary}</span></span>
        </button>
      ))}
    </div>
  );
}
