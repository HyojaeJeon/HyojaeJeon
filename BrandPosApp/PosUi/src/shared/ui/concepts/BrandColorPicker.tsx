'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  generateBrandPalette,
  applyBrandColors,
  PRESET_COLORS,
  type BrandPalette,
  type ColorScale,
} from '@shared/utils/color';

const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

function ScaleRow({ label, hex, scale }: { label: string; hex: string; scale: ColorScale }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: hex }} />
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <code className="text-2xs font-mono text-gray-400">{hex}</code>
      </div>
      <div className="flex gap-1">
        {SCALE_STEPS.map((step) => (
          <div key={step} className="flex-1">
            <div
              className="h-10 rounded-pos-xs mb-1"
              style={{ backgroundColor: scale[step] }}
            />
            <div className="text-center">
              <div className="text-2xs font-semibold text-gray-500">{step}</div>
              <div className="text-2xs font-mono text-gray-400">{scale[step]}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BrandColorPicker() {
  const [primaryHex, setPrimaryHex] = useState('#E63946');
  const [palette, setPalette] = useState<BrandPalette | null>(null);

  const generate = useCallback((hex: string) => {
    const p = generateBrandPalette(hex);
    setPalette(p);
    applyBrandColors(p);
  }, []);

  useEffect(() => {
    generate(primaryHex);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleColorInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setPrimaryHex(hex);
    generate(hex);
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    setPrimaryHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      generate(val);
    }
  };

  const selectPreset = (hex: string) => {
    setPrimaryHex(hex);
    generate(hex);
  };

  if (!palette) return null;

  return (
    <section className="mb-12 bg-gray-50 rounded-pos-2xl p-6 border border-gray-100">
      {/* 제목 */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-gray-900 tracking-wider">브랜드 컬러 시스템</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Primary 색상을 선택하면 보조색(보색)과 강조색(유사색)이 OKLCH 기반으로 자동 생성됩니다
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white rounded-pos-md px-2 py-1 border border-gray-200">
          <span className="text-2xs text-gray-400 font-mono">OKLCH</span>
        </div>
      </div>

      {/* 색상 선택 영역 */}
      <div className="flex items-start gap-6 mb-6">
        {/* 컬러 피커 */}
        <div className="flex items-center gap-3">
          <label className="relative cursor-pointer">
            <input
              type="color"
              value={primaryHex}
              onChange={handleColorInput}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div
              className="w-14 h-14 rounded-pos-lg border-2 border-white shadow-pos-card"
              style={{ backgroundColor: primaryHex }}
            />
          </label>
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-1">Primary 색상</div>
            <input
              type="text"
              value={primaryHex}
              onChange={handleTextInput}
              maxLength={7}
              className="w-24 h-8 px-2 text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded-pos-input text-center"
            />
          </div>
        </div>

        {/* 자동 생성된 보조/강조색 미리보기 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-pos-md border border-white shadow-pos-soft" style={{ backgroundColor: palette.secondaryHex }} />
            <div>
              <div className="text-2xs text-gray-400">보조색 (보색)</div>
              <code className="text-2xs font-mono text-gray-500">{palette.secondaryHex}</code>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-pos-md border border-white shadow-pos-soft" style={{ backgroundColor: palette.accentHex }} />
            <div>
              <div className="text-2xs text-gray-400">강조색 (유사색)</div>
              <code className="text-2xs font-mono text-gray-500">{palette.accentHex}</code>
            </div>
          </div>
        </div>

        {/* 색상 조화 다이어그램 */}
        <div className="ml-auto flex items-center gap-1.5">
          <div className="text-2xs text-gray-400">Hue</div>
          <div className="flex items-center gap-0.5">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: primaryHex }} />
            <span className="text-2xs text-gray-300">+180°→</span>
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: palette.secondaryHex }} />
            <span className="text-2xs text-gray-300 ml-2">+30°→</span>
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: palette.accentHex }} />
          </div>
        </div>
      </div>

      {/* 프리셋 색상 */}
      <div className="mb-6">
        <div className="text-2xs font-semibold text-gray-400 mb-2">프리셋 색상</div>
        <div className="flex gap-2">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              onClick={() => selectPreset(preset.hex)}
              className={`
                flex flex-col items-center gap-1 px-2 py-1.5 rounded-pos-sm
                transition-all duration-fast cursor-pointer
                ${primaryHex === preset.hex ? 'bg-white shadow-pos-soft border border-gray-200' : 'active:bg-white'}
              `}
            >
              <div
                className="w-7 h-7 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: preset.hex }}
              />
              <span className="text-2xs text-gray-500 whitespace-nowrap">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 생성된 팔레트 */}
      <div className="space-y-5 bg-white rounded-pos-lg p-5 border border-gray-100">
        <ScaleRow label="Primary (브랜드)" hex={palette.primaryHex} scale={palette.primary} />
        <ScaleRow label="Secondary (보조 · 보색)" hex={palette.secondaryHex} scale={palette.secondary} />
        <ScaleRow label="Accent (강조 · 유사색)" hex={palette.accentHex} scale={palette.accent} />
      </div>
    </section>
  );
}
