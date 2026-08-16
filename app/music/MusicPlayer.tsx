/* eslint-disable @next/next/no-img-element */

const songId = "1367154014";
const embedUrl = `https://music.163.com/outchain/player?type=2&id=${songId}&auto=1&height=66`;

export default function MusicPlayer() {
  const basePath = process.env.PAGES_BASE_PATH ?? "";

  return (
    <div className="player-shell netease-player-shell">
      <div className="turntable is-playing">
        <div className="record-button">
          <span className="vinyl">
            <span className="vinyl-label">
              <img src={`${basePath}/song-cover.jpg`} alt="光ある場所へ 专辑封面" />
            </span>
          </span>
        </div>
        <div className="tonearm" aria-hidden="true"><span /></div>
      </div>

      <div className="player-panel">
        <div className="track-meta">
          <p>NOW PLAYING</p>
          <h2>光ある場所へ</h2>
          <span>忍</span>
        </div>

        <div className="external-player is-loaded">
          <iframe
            title="光ある場所へ · 网易云音乐外链播放器"
            src={embedUrl}
            width="100%"
            height="86"
            frameBorder="0"
            marginWidth={0}
            marginHeight={0}
            allow="autoplay"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
