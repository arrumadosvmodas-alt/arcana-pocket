import { Element, Rarity } from "@/lib/engine/cards";

// Each element has a distinct alien-creature silhouette, not a person or
// earthly animal — geometric eyes/limbs read as extraterrestrial.
// Rarity adds extra spikes/fins so higher tiers look visually "more evolved".

function FireBeing({ accent, spikes }: { accent: string; spikes: boolean }) {
  return (
    <>
      <path
        d="M50 20 C38 34 30 46 34 60 C37 71 45 76 50 76 C55 76 63 71 66 60 C70 46 62 34 50 20Z"
        fill={accent}
        opacity="0.9"
      />
      {spikes && (
        <>
          <path d="M50 18 L54 28 L50 24 L46 28Z" fill={accent} />
          <path d="M34 40 L26 36 L32 44Z" fill={accent} opacity="0.8" />
          <path d="M66 40 L74 36 L68 44Z" fill={accent} opacity="0.8" />
        </>
      )}
      <circle cx="43" cy="52" r="3.4" fill="#fff2e0" />
      <circle cx="57" cy="52" r="3.4" fill="#fff2e0" />
    </>
  );
}

function WaterBeing({ accent, spikes }: { accent: string; spikes: boolean }) {
  return (
    <>
      <ellipse cx="50" cy="54" rx="17" ry="22" fill={accent} opacity="0.9" />
      <path d="M50 30 L44 40 L56 40Z" fill={accent} />
      {spikes && (
        <>
          <path d="M33 54 C26 52 24 58 28 62Z" fill={accent} opacity="0.85" />
          <path d="M67 54 C74 52 76 58 72 62Z" fill={accent} opacity="0.85" />
        </>
      )}
      <circle cx="44" cy="48" r="3.4" fill="#eaf9ff" />
      <circle cx="56" cy="48" r="3.4" fill="#eaf9ff" />
    </>
  );
}

function EarthBeing({ accent, spikes }: { accent: string; spikes: boolean }) {
  return (
    <>
      <polygon points="50,24 70,42 62,68 38,68 30,42" fill={accent} opacity="0.9" />
      {spikes && (
        <>
          <polygon points="50,16 54,26 46,26" fill={accent} />
          <polygon points="26,40 34,44 28,50" fill={accent} opacity="0.8" />
          <polygon points="74,40 66,44 72,50" fill={accent} opacity="0.8" />
        </>
      )}
      <rect x="41" y="46" width="6" height="6" fill="#f4ecd8" />
      <rect x="53" y="46" width="6" height="6" fill="#f4ecd8" />
    </>
  );
}

function AirBeing({ accent, spikes }: { accent: string; spikes: boolean }) {
  return (
    <>
      <path
        d="M50 26 C60 30 68 40 66 52 C64 64 56 70 50 70 C44 70 36 64 34 52 C32 40 40 30 50 26Z"
        fill={accent}
        opacity="0.85"
      />
      {spikes && (
        <>
          <path d="M30 46 C20 44 18 52 24 56Z" fill={accent} opacity="0.7" />
          <path d="M70 46 C80 44 82 52 76 56Z" fill={accent} opacity="0.7" />
        </>
      )}
      <ellipse cx="44" cy="50" rx="3.6" ry="4.4" fill="#f4fff9" />
      <ellipse cx="56" cy="50" rx="3.6" ry="4.4" fill="#f4fff9" />
    </>
  );
}

function LightBeing({ accent, spikes }: { accent: string; spikes: boolean }) {
  return (
    <>
      <polygon points="50,22 58,42 50,38 42,42" fill={accent} />
      <polygon points="36,50 64,50 50,74" fill={accent} opacity="0.9" />
      {spikes && (
        <>
          <polygon points="50,20 53,14 56,20" fill={accent} />
          <polygon points="28,52 20,50 26,58" fill={accent} opacity="0.8" />
          <polygon points="72,52 80,50 74,58" fill={accent} opacity="0.8" />
        </>
      )}
      <circle cx="50" cy="56" r="3.6" fill="#fffbe0" />
    </>
  );
}

function ShadowBeing({ accent, spikes }: { accent: string; spikes: boolean }) {
  return (
    <>
      <path d="M50 24 L68 56 L50 48 L32 56Z" fill={accent} opacity="0.9" />
      <path d="M40 56 L60 56 L50 72Z" fill={accent} opacity="0.75" />
      {spikes && (
        <>
          <path d="M32 56 L22 52 L28 62Z" fill={accent} opacity="0.7" />
          <path d="M68 56 L78 52 L72 62Z" fill={accent} opacity="0.7" />
        </>
      )}
      <circle cx="44" cy="42" r="3" fill="#f0e6ff" />
      <circle cx="56" cy="42" r="3" fill="#f0e6ff" />
    </>
  );
}

const BEINGS: Record<Element, typeof FireBeing> = {
  FIRE: FireBeing,
  WATER: WaterBeing,
  EARTH: EarthBeing,
  AIR: AirBeing,
  LIGHT: LightBeing,
  SHADOW: ShadowBeing,
};

export function AlienEmblem({
  element,
  rarity,
  accent,
  className,
}: {
  element: Element;
  rarity: Rarity;
  accent: string;
  className?: string;
}) {
  const Being = BEINGS[element];
  const spikes = rarity !== "COMMON";

  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={`Criatura alienígena de elemento ${element}`}>
      <circle cx="50" cy="50" r="38" fill={accent} opacity="0.08" />
      <Being accent={accent} spikes={spikes} />
    </svg>
  );
}
