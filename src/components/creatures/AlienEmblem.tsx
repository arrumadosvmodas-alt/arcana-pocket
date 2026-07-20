import { Element, Rarity } from "@/lib/engine/cards";

// Futuristic, glowing sci-fi elemental creature illustrations.
// Rarity scales the complexity by adding wings, crowns, horns, and extra glow effects.

function CuteBlush({ cx, cy }: { cx: number; cy: number }) {
  return null; // Removed cartoon blush for a cleaner, high-tech creature design
}

function CuteEyes({ cx, cy, color = "#00f5ff" }: { cx: number; cy: number; color?: string }) {
  return (
    <>
      {/* Sleek glowing energy eyes */}
      <ellipse cx={cx - 10} cy={cy} rx="5" ry="2" fill={color} style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
      <ellipse cx={cx + 10} cy={cy} rx="5" ry="2" fill={color} style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
    </>
  );
}

function FireBeing({ accent, spikes }: { accent: string; spikes: boolean }) {
  return (
    <g>
      {/* Background Glow */}
      <circle cx="50" cy="50" r="32" fill="#ff9f1c" opacity="0.25" style={{ filter: 'blur(4px)' }} />
      
      {/* Fire Tail / Body Base */}
      <path d="M35 65 C25 65 20 50 30 40 C35 35 45 42 45 50" fill="#ff9f1c" />
      
      {/* Fire Wings/Spikes for RARE/EPIC */}
      {spikes && (
        <g fill="#e71d36">
          <path d="M25 45 C10 40 8 20 22 25 C15 35 22 40 25 45Z" />
          <path d="M75 45 C90 40 92 20 78 25 C85 35 78 40 75 45Z" />
          <path d="M42 22 L50 8 L58 22 L50 18Z" />
        </g>
      )}

      {/* Main Head/Body */}
      <path d="M30 55 C30 35 70 35 70 55 C70 68 30 68 30 55Z" fill="#ff7900" />
      <path d="M34 56 C34 40 66 40 66 56 C66 66 34 66 34 56Z" fill="#ff9f1c" />

      {/* Little Fire Horns */}
      <path d="M36 38 L32 26 L44 34Z" fill="#e71d36" />
      <path d="M64 38 L68 26 L56 34Z" fill="#e71d36" />

      {/* Face details */}
      <CuteEyes cx={50} cy={50} color="#ffd166" />
      
      {/* Sparkles */}
      <circle cx="28" cy="28" r="2.5" fill="#ffd166" />
      <circle cx="72" cy="62" r="1.5" fill="#ffd166" />
    </g>
  );
}

function WaterBeing({ accent, spikes }: { accent: string; spikes: boolean }) {
  return (
    <g>
      <circle cx="50" cy="50" r="32" fill="#00b4d8" opacity="0.25" style={{ filter: 'blur(4px)' }} />
      
      {/* Water Wings / Fin Ears for RARE/EPIC */}
      {spikes && (
        <g fill="#4ea8de">
          <path d="M26 48 C12 44 14 26 24 34 C20 42 24 46 26 48Z" />
          <path d="M74 48 C88 44 86 26 76 34 C80 42 76 46 74 48Z" />
          <circle cx="50" cy="14" r="4.5" />
          <path d="M50 14 L46 24 L54 24Z" />
        </g>
      )}

      {/* Round Body */}
      <circle cx="50" cy="52" r="20" fill="#4ea8de" />
      <circle cx="50" cy="52" r="17" fill="#90e0ef" />
      
      {/* Tail Fin */}
      <path d="M50 72 C40 76 40 82 50 82 C60 82 60 76 50 72Z" fill="#4ea8de" />

      {/* Cute Fin Ears (Common) */}
      {!spikes && (
        <>
          <path d="M31 46 C24 42 26 52 32 50Z" fill="#4ea8de" />
          <path d="M69 46 C76 42 74 52 68 50Z" fill="#4ea8de" />
        </>
      )}

      {/* Face details */}
      <CuteEyes cx={50} cy={48} color="#00f5ff" />
      
      {/* Bubbles */}
      <circle cx="26" cy="30" r="3" fill="#caf0f8" opacity="0.8" />
      <circle cx="22" cy="36" r="1.5" fill="#caf0f8" opacity="0.8" />
      <circle cx="74" cy="32" r="2.5" fill="#caf0f8" opacity="0.8" />
    </g>
  );
}

function EarthBeing({ accent, spikes }: { accent: string; spikes: boolean }) {
  return (
    <g>
      <circle cx="50" cy="50" r="32" fill="#22c55e" opacity="0.25" style={{ filter: 'blur(4px)' }} />
      
      {/* Crystals/Flowers for RARE/EPIC */}
      {spikes && (
        <g fill="#ff7096">
          <circle cx="50" cy="20" r="5" />
          <circle cx="45" cy="16" r="4.5" />
          <circle cx="55" cy="16" r="4.5" />
          <circle cx="45" cy="24" r="4.5" />
          <circle cx="55" cy="24" r="4.5" />
          <circle cx="50" cy="20" r="3" fill="#ffd166" />
          
          <polygon points="20,54 14,48 24,42" fill="#4ea8de" />
          <polygon points="80,54 86,48 76,42" fill="#4ea8de" />
        </g>
      )}

      {/* Rocky/Leafy Body */}
      <path d="M28 58 C28 40 72 40 72 58 C72 72 28 72 28 58Z" fill="#6c584c" />
      
      {/* Grass/Leaf Coat */}
      <path d="M30 46 C36 34 64 34 70 46 C70 46 60 52 50 48 C40 52 30 46 30 46Z" fill="#adc178" />

      {/* Sprouts (Head) */}
      {!spikes && (
        <>
          <path d="M50 36 Q42 26 44 24 Q48 24 50 36Z" fill="#a7c957" />
          <path d="M50 36 Q58 26 56 24 Q52 24 50 36Z" fill="#a7c957" />
        </>
      )}

      {/* Face details */}
      <CuteEyes cx={50} cy={52} color="#a7c957" />
    </g>
  );
}

function AirBeing({ accent, spikes }: { accent: string; spikes: boolean }) {
  return (
    <g>
      <circle cx="50" cy="50" r="32" fill="#e0f2fe" opacity="0.25" style={{ filter: 'blur(4px)' }} />
      
      {/* Large Wings / Wind swirls for RARE/EPIC */}
      {spikes && (
        <g fill="#90e0ef">
          <path d="M28 45 C10 40 6 22 20 24 C14 34 22 40 28 45Z" opacity="0.9" />
          <path d="M72 45 C90 40 94 22 80 24 C86 34 78 40 72 45Z" opacity="0.9" />
          <path d="M50 22 C50 10 44 14 42 12 C44 20 48 22 50 22Z" fill="#00b4d8" />
          <path d="M50 22 C50 10 56 14 58 12 C56 20 52 22 50 22Z" fill="#00b4d8" />
        </g>
      )}

      {/* Cloud Body Puffs */}
      <circle cx="38" cy="50" r="14" fill="#e0f2fe" />
      <circle cx="62" cy="50" r="14" fill="#e0f2fe" />
      <circle cx="50" cy="46" r="16" fill="#f8fafc" />
      <circle cx="50" cy="58" r="13" fill="#f8fafc" />

      {/* Face details */}
      <CuteEyes cx={50} cy={46} color="#06b6d4" />
      
      {/* Sparkles */}
      <circle cx="28" cy="24" r="2" fill="#38bdf8" />
      <circle cx="70" cy="26" r="2.5" fill="#38bdf8" />
    </g>
  );
}

function LightBeing({ accent, spikes }: { accent: string; spikes: boolean }) {
  return (
    <g>
      <circle cx="50" cy="50" r="32" fill="#ffd166" opacity="0.25" style={{ filter: 'blur(4px)' }} />
      
      {/* Fairy Wings & Halo for RARE/EPIC */}
      {spikes && (
        <g fill="#fff3b0">
          <path d="M30 45 C12 36 18 16 26 26 C22 36 28 42 30 45Z" opacity="0.85" />
          <path d="M70 45 C88 36 82 16 74 26 C78 36 72 42 70 45Z" opacity="0.85" />
          <ellipse cx="50" cy="16" rx="14" ry="4.5" fill="none" stroke="#ffd166" strokeWidth="2.5" />
        </g>
      )}

      {/* Star Shape Head */}
      <polygon points="50,22 57,36 71,36 60,46 64,60 50,51 36,60 40,46 29,36 43,36" fill="#ffd166" />
      <circle cx="50" cy="45" r="13" fill="#ffe3e0" opacity="0.95" />

      {/* Face details */}
      <CuteEyes cx={50} cy={42} color="#fbbf24" />
      
      {/* Magic Stars */}
      <polygon points="26,22 28,26 32,26 29,28 30,32 27,29 24,31 26,27 23,25 27,25" fill="#ffd166" />
      <polygon points="72,56 74,59 78,59 75,61 76,65 73,62 70,64 72,60 69,58 73,58" fill="#ffd166" />
    </g>
  );
}

function ShadowBeing({ accent, spikes }: { accent: string; spikes: boolean }) {
  return (
    <g>
      <circle cx="50" cy="50" r="32" fill="#818cf8" opacity="0.25" style={{ filter: 'blur(4px)' }} />
      
      {/* Bat Wings & Shadow Crown for RARE/EPIC */}
      {spikes && (
        <g fill="#3d348b">
          <path d="M30 46 C12 40 10 24 24 26 C16 34 26 40 30 46Z" />
          <path d="M70 46 C88 40 90 24 76 26 C84 34 74 40 70 46Z" />
          <path d="M42 20 L50 6 L58 20Z" fill="#240046" />
        </g>
      )}

      {/* Gengar-style Body Blob */}
      <path d="M28 54 C28 34 72 34 72 54 C72 70 28 70 28 54Z" fill="#5c4d7d" />
      <path d="M32 55 C32 38 68 38 68 55 C68 68 32 68 32 55Z" fill="#75629f" />

      {/* Horn/Ear Spikes (Common) */}
      <path d="M34 38 L28 26 L42 34Z" fill="#3d348b" />
      <path d="M66 38 L72 26 L58 34Z" fill="#3d348b" />

      {/* Evil / Mischievous Eyes (Glowing Magenta) */}
      <ellipse cx="39" cy="48" rx="5" ry="2" fill="#e0aaff" style={{ filter: 'drop-shadow(0 0 3px #e0aaff)' }} />
      <ellipse cx="61" cy="48" rx="5" ry="2" fill="#e0aaff" style={{ filter: 'drop-shadow(0 0 3px #e0aaff)' }} />
      
      {/* Ghost wisps */}
      <circle cx="22" cy="62" r="2" fill="#75629f" opacity="0.6" />
      <circle cx="78" cy="62" r="1.5" fill="#75629f" opacity="0.6" />
    </g>
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
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={`Criatura de elemento ${element}`}>
      <defs>
        {/* Glow filter for sci-fi holographic outline */}
        <filter id={`hud-glow-${element}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
          <feFlood flood-color={accent} result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Sci-Fi HUD background elements */}
      <circle cx="50" cy="50" r="44" fill="none" stroke={accent} strokeWidth="1" opacity="0.25" strokeDasharray="3,3" />
      <circle cx="50" cy="50" r="39" fill="rgba(0, 0, 0, 0.45)" stroke={accent} strokeWidth="1.5" opacity="0.8" />
      
      {/* The creature with HUD neon glow filter */}
      <g filter={`url(#hud-glow-${element})`}>
        <Being accent={accent} spikes={spikes} />
      </g>
    </svg>
  );
}
