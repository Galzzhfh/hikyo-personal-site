"use client";

import { useMusic } from "./MusicProvider";

export default function HomeMusicButton() {
  const { isPlaying, toggle } = useMusic();

  return (
    <button className={`mini-record ${isPlaying ? "is-playing" : ""}`} type="button" onClick={toggle} aria-label={isPlaying ? "暂停音乐" : "播放音乐"}>
      <span>{isPlaying ? "Ⅱ" : "♪"}</span>
    </button>
  );
}
