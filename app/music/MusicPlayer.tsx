"use client";

/* eslint-disable @next/next/no-img-element */

import { useMusic } from "../components/MusicProvider";

export default function MusicPlayer({ basePath }: { basePath: string }) {
  const { isPlaying, toggle } = useMusic();

  return (
    <div className="player-shell netease-player-shell">
      <div className={`turntable ${isPlaying ? "is-playing" : ""}`}>
        <button className="record-button" type="button" onClick={toggle} aria-label={isPlaying ? "暂停音乐" : "播放音乐"}>
          <span className="vinyl">
            <span className="vinyl-label">
              <img src={`${basePath}/song-cover.jpg`} alt="光ある場所へ 专辑封面" />
            </span>
          </span>
        </button>
        <div className="tonearm" aria-hidden="true"><span /></div>
      </div>

      <div className="player-panel">
        <div className="track-meta">
          <p>NOW PLAYING</p>
          <h2>光ある場所へ</h2>
          <span>忍</span>
        </div>

        <div className="record-control">
          <button type="button" onClick={toggle} aria-label={isPlaying ? "暂停音乐" : "播放音乐"}>{isPlaying ? "Ⅱ" : "▶"}</button>
        </div>
      </div>
    </div>
  );
}
