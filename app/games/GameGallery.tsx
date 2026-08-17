"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, type CSSProperties } from "react";
import type { GamePost } from "../../lib/game";

export default function GameGallery({ games, basePath }: { games: GamePost[]; basePath: string }) {
  const [selectedGame, setSelectedGame] = useState<GamePost | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    if (!selectedGame) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedGame(null);
      if (event.key === "ArrowLeft") setPreviewIndex((value) => Math.max(0, value - 1));
      if (event.key === "ArrowRight") setPreviewIndex((value) => Math.min(selectedGame.previews.length - 1, value + 1));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedGame]);

  function openGame(game: GamePost) {
    setPreviewIndex(0);
    setSelectedGame(game);
  }

  return (
    <>
      <div className="game-grid">
        {games.map((game, index) => (
          <button className="game-card" type="button" key={game.id} onClick={() => openGame(game)} style={{ "--card-delay": `${index * 80}ms` } as CSSProperties}>
            <span className="game-card-cover"><img src={`${basePath}/${game.cover}`} alt={`${game.title} 预览`} /><span>GAME NOTE</span></span>
            <span className="game-card-copy"><small>{game.japaneseTitle}</small><strong>{game.title}</strong><span>{game.summary}</span></span>
          </button>
        ))}
      </div>

      {selectedGame ? (
        <div className="game-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedGame(null); }}>
          <section className="game-modal" role="dialog" aria-modal="true" aria-labelledby="game-modal-title">
            <button className="resource-modal-close" type="button" onClick={() => setSelectedGame(null)} aria-label="关闭">×</button>
            <div className="game-preview-stage">
              <img src={`${basePath}/${selectedGame.previews[previewIndex] ?? selectedGame.cover}`} alt={`${selectedGame.title} 预览图 ${previewIndex + 1}`} />
              <div className="game-preview-count">{String(previewIndex + 1).padStart(2, "0")} / {String(selectedGame.previews.length).padStart(2, "0")}</div>
              <button type="button" onClick={() => setPreviewIndex((value) => Math.max(0, value - 1))} disabled={previewIndex === 0} aria-label="上一张">←</button>
              <button type="button" onClick={() => setPreviewIndex((value) => Math.min(selectedGame.previews.length - 1, value + 1))} disabled={previewIndex === selectedGame.previews.length - 1} aria-label="下一张">→</button>
            </div>
            <div className="game-modal-copy">
              <small>{selectedGame.japaneseTitle}</small>
              <h2 id="game-modal-title">{selectedGame.title}</h2>
              <p>{selectedGame.thoughts}</p>
              <div className="resource-card-meta">{selectedGame.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <div className="game-thumbnails">{selectedGame.previews.map((preview, index) => <button className={previewIndex === index ? "is-active" : ""} type="button" key={preview} onClick={() => setPreviewIndex(index)} aria-label={`查看预览图 ${index + 1}`}><img src={`${basePath}/${preview}`} alt="" /></button>)}</div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
