import type { CSSProperties } from "react";

export default function SakuraFall() {
  return (
    <div className="petals" aria-hidden="true">
      {Array.from({ length: 24 }, (_, index) => (
        <span key={index} style={{ "--petal": index } as CSSProperties}>✿</span>
      ))}
    </div>
  );
}
