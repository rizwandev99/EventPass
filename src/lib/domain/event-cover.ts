// Deterministic algorithmic cover art generator using HSL gradients & SVG patterns
// Zero external image requests; works 100% offline at zero cost; zero hardcoded hex colors

export interface CoverTheme {
  gradient: string;
  patternSvg: string;
}

export function generateEventCover(seed: string, category: string = "TECH"): CoverTheme {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const categoryBaseHues: Record<string, number> = {
    MUSIC: 280,
    TECH: 215,
    SPORTS: 150,
    COMEDY: 35,
    FOOD: 20,
    ART: 320,
  };

  const baseHue = categoryBaseHues[category] ?? 220;
  const hue1 = (baseHue + (positiveHash % 40)) % 360;
  const hue2 = (hue1 + 45) % 360;

  const gradient = `linear-gradient(135deg, hsl(${hue1}, 70%, 35%) 0%, hsl(${hue2}, 65%, 25%) 100%)`;

  // Pattern based on hash
  const patternType = positiveHash % 3;
  let patternSvg = "";

  if (patternType === 0) {
    // Subtle dots
    patternSvg = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.5' fill='rgba(255,255,255,0.12)'/%3E%3C/svg%3E")`;
  } else if (patternType === 1) {
    // Diagonal lines
    patternSvg = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1.5'/%3E%3C/svg%3E")`;
  } else {
    // Concentric rings
    patternSvg = `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='15' cy='15' r='10' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='1'/%3E%3C/svg%3E")`;
  }

  return { gradient, patternSvg };
}
