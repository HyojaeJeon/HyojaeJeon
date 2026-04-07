/**
 * OKLCH 기반 색상 유틸리티
 *
 * Primary 색상 하나에서 자동으로:
 * 1. 50~950 단계 스케일 생성 (OKLCH 밝기/채도 균일 분포)
 * 2. 보조색 (Complementary, Hue +180°)
 * 3. 강조색 (Analogous, Hue +30°)
 *
 * 변환 경로: HEX → sRGB → Linear RGB → XYZ (D65) → Oklab → OKLCH
 */

// ─── HEX ↔ sRGB ──────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const toHex = (v: number) => Math.round(clamp(v) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// ─── sRGB ↔ Linear RGB ───────────────────────────────────────
function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// ─── Linear RGB ↔ Oklab ──────────────────────────────────────
function linearRgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  return [
    0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  ];
}

function oklabToLinearRgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

// ─── Oklab ↔ OKLCH ───────────────────────────────────────────
export interface OklchColor {
  l: number;  // 0~1 밝기
  c: number;  // 0~0.4 채도
  h: number;  // 0~360 색상각
}

function oklabToOklch(L: number, a: number, b: number): OklchColor {
  const c = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { l: L, c, h };
}

function oklchToOklab(lch: OklchColor): [number, number, number] {
  const hRad = (lch.h * Math.PI) / 180;
  return [lch.l, lch.c * Math.cos(hRad), lch.c * Math.sin(hRad)];
}

// ─── 공개 API: HEX ↔ OKLCH ──────────────────────────────────
export function hexToOklch(hex: string): OklchColor {
  const [r, g, b] = hexToRgb(hex);
  const [lr, lg, lb] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  const [L, a, bVal] = linearRgbToOklab(lr, lg, lb);
  return oklabToOklch(L, a, bVal);
}

export function oklchToHex(lch: OklchColor): string {
  const [L, a, b] = oklchToOklab(lch);
  const [lr, lg, lb] = oklabToLinearRgb(L, a, b);
  return rgbToHex(linearToSrgb(lr), linearToSrgb(lg), linearToSrgb(lb));
}

// ─── 팔레트 생성: 단일 색상 → 50~950 스케일 ─────────────────
export interface ColorScale {
  50: string;  100: string; 200: string; 300: string;
  400: string; 500: string; 600: string; 700: string;
  800: string; 900: string; 950: string;
}

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

// 각 단계별 목표 밝기 (OKLCH L 값)
const LIGHTNESS_MAP: Record<number, number> = {
  50: 0.97, 100: 0.93, 200: 0.87, 300: 0.78,
  400: 0.68, 500: 0.55, 600: 0.47, 700: 0.39,
  800: 0.32, 900: 0.25, 950: 0.20,
};

// 각 단계별 채도 배율 (500 기준 대비)
const CHROMA_MAP: Record<number, number> = {
  50: 0.15, 100: 0.25, 200: 0.45, 300: 0.65,
  400: 0.85, 500: 1.0,  600: 0.95, 700: 0.85,
  800: 0.70, 900: 0.55, 950: 0.45,
};

export function generateScale(hex: string): ColorScale {
  const base = hexToOklch(hex);
  const scale: Partial<ColorScale> = {};

  for (const step of SCALE_STEPS) {
    const targetL = LIGHTNESS_MAP[step];
    const chromaRatio = CHROMA_MAP[step];
    const maxChroma = Math.min(base.c * 1.1, 0.35); // 채도 상한

    scale[step] = oklchToHex({
      l: targetL,
      c: maxChroma * chromaRatio,
      h: base.h,
    });
  }

  return scale as ColorScale;
}

// ─── 색상 조화: 보색, 유사색 자동 생성 ──────────────────────
export interface BrandPalette {
  primary: ColorScale;
  secondary: ColorScale;  // 보색 (Hue +180°)
  accent: ColorScale;     // 유사색 (Hue +30°)
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
}

function rotateHue(hex: string, degrees: number): string {
  const oklch = hexToOklch(hex);
  oklch.h = (oklch.h + degrees + 360) % 360;
  return oklchToHex(oklch);
}

export function generateBrandPalette(primaryHex: string): BrandPalette {
  const secondaryHex = rotateHue(primaryHex, 180);  // 보색
  const accentHex = rotateHue(primaryHex, 30);       // 유사색

  return {
    primary: generateScale(primaryHex),
    secondary: generateScale(secondaryHex),
    accent: generateScale(accentHex),
    primaryHex,
    secondaryHex,
    accentHex,
  };
}

// ─── CSS 변수 주입 ───────────────────────────────────────────
export function applyBrandColors(palette: BrandPalette): void {
  const root = document.documentElement;
  const entries: [string, ColorScale][] = [
    ['primary', palette.primary],
    ['secondary', palette.secondary],
    ['accent', palette.accent],
  ];

  for (const [prefix, scale] of entries) {
    for (const step of SCALE_STEPS) {
      root.style.setProperty(`--color-${prefix}-${step}`, scale[step]);
    }
  }
}

// ─── 프리셋 브랜드 색상 ──────────────────────────────────────
export const PRESET_COLORS = [
  { name: '소프트 레드',  hex: '#E63946' },
  { name: '오션 블루',   hex: '#2563EB' },
  { name: '에메랄드',    hex: '#059669' },
  { name: '앰버',       hex: '#D97706' },
  { name: '바이올렛',   hex: '#7C3AED' },
  { name: '로즈',       hex: '#E11D48' },
  { name: '시안',       hex: '#0891B2' },
  { name: '슬레이트',   hex: '#475569' },
  { name: '인디고',     hex: '#4338CA' },
  { name: '핑크',       hex: '#DB2777' },
] as const;
