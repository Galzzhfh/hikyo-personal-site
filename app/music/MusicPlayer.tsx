"use client";

/* eslint-disable @next/next/no-img-element */

import { useMusic } from "../components/MusicProvider";

export default function MusicPlayer({ basePath }: { basePath: string }) {
  const { isPlaying, toggle, tracks, currentTrack, playTrack } = useMusic();

  return (
    <div className="player-shell netease-player-shell">
      <div className={`turntable ${isPlaying ? "is-playing" : ""}`}>
        <button className="record-button" type="button" onClick={toggle} aria-label={isPlaying ? "暂停音乐" : "播放音乐"}>
          <span className="vinyl">
            <span className="vinyl-label">
              {currentTrack ? <img src={`${basePath}/${currentTrack.cover}`} alt={`${currentTrack.title} 专辑封面`} /> : <span>♪</span>}
            </span>
          </span>
        </button>
        <div className="tonearm" aria-hidden="true"><span /></div>
      </div>

      <div className="player-panel">
        <div className="track-meta">
          <p>NOW PLAYING</p>
          <h2>{currentTrack?.title ?? "暂无曲目"}</h2>
          <span>{currentTrack?.artist ?? ""}</span>
        </div>

        <div className="record-control">
          <button type="button" onClick={toggle} disabled={!currentTrack} aria-label={isPlaying ? "暂停音乐" : "播放音乐"}>{isPlaying ? "Ⅱ" : "▶"}</button>
        </div>
        <div className="track-list" aria-label="曲目列表">
          {tracks.map((track, index) => (
            <button className={currentTrack?.id === track.id ? "is-current" : ""} type="button" key={track.id} onClick={() => playTrack(track.id)}>
              <span>{String(index + 1).padStart(2, "0")}</span><strong>{track.title}</strong><small>{track.artist}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
