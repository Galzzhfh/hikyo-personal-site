import type { CSSProperties } from "react";

const petals = Array.from({ length: 34 }, (_, index) => {
  const direction = index % 2 === 0 ? 1 : -1;
  const firstDrift = direction * (24 + ((index * 29) % 88));
  const secondDrift = direction * -1 * (18 + ((index * 17) % 76));
  const isRosePetal = index % 5 === 0;
  const isBlushPetal = !isRosePetal && index % 4 === 0;

  return {
    left: `${(index * 37 + 7) % 101}%`,
    duration: `${12 + ((index * 11) % 13)}s`,
    delay: `-${2 + ((index * 19) % 26)}s`,
    size: `${9 + ((index * 5) % 13)}px`,
    opacity: (0.54 + ((index * 7) % 39) / 100).toFixed(2),
    firstDrift: `${firstDrift}px`,
    secondDrift: `${secondDrift}px`,
    spin: `${direction * (420 + ((index * 41) % 520))}deg`,
    color: isRosePetal ? "220 126 155" : isBlushPetal ? "247 188 206" : "255 255 255",
    glow: isRosePetal ? "8px" : isBlushPetal ? "5px" : "2px",
    blur: index % 11 === 0 ? ".7px" : "0px",
    glyph: isRosePetal || isBlushPetal ? "❀" : "✿",
  };
});

export default function SakuraFall() {
  return (
    <div className="petals" aria-hidden="true">
      {petals.map((petal, index) => (
        <span
          className={`petal-path-${index % 3}`}
          key={index}
          style={{
            "--petal-left": petal.left,
            "--petal-duration": petal.duration,
            "--petal-delay": petal.delay,
            "--petal-size": petal.size,
            "--petal-opacity": petal.opacity,
            "--petal-drift-a": petal.firstDrift,
            "--petal-drift-b": petal.secondDrift,
            "--petal-spin": petal.spin,
            "--petal-color": petal.color,
            "--petal-glow": petal.glow,
            "--petal-blur": petal.blur,
          } as CSSProperties}
        >{petal.glyph}</span>
      ))}
    </div>
  );
}
