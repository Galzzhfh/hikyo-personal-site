import type { CSSProperties } from "react";

/* eslint-disable @next/next/no-img-element */

export default function CgBackdrop() {
  const basePath = process.env.PAGES_BASE_PATH ?? "";
  const frames = Array.from(
    { length: 6 },
    (_, index) => `${basePath}/cg/scene-01/${String(index + 1).padStart(8, "0")}.webp`,
  );

  return (
    <div className="cg-backdrop" aria-hidden="true">
      {frames.map((src, index) => (
        <img
          className="cg-frame"
          key={src}
          src={src}
          alt=""
          style={{
            "--frame-delay": `${index * 7 - 1.5}s`,
            "--frame-shift-x": `${index % 2 === 0 ? -1.2 : 1.2}%`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
