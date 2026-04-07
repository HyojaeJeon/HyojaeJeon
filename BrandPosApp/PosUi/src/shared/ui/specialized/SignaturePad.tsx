'use client';

import { useRef, useCallback, useEffect } from 'react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
}

/**
 * SignaturePad -- 서명 캡처 플레이스홀더
 *
 * 캔버스 기반 터치 드로잉 영역. 확인/지우기 버튼을 포함한다.
 */
export default function SignaturePad({
  onSave,
  onClear,
  width = 320,
  height = 180,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const getCtx = useCallback(() => {
    return canvasRef.current?.getContext('2d') ?? null;
  }, []);

  const getPos = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  }, []);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const ctx = getCtx();
    if (!ctx) return;
    isDrawing.current = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getCtx, getPos]);

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [getCtx, getPos]);

  const handleEnd = useCallback(() => {
    isDrawing.current = false;
  }, []);

  const handleClear = useCallback(() => {
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onClear?.();
  }, [getCtx, onClear]);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  }, [onSave]);

  useEffect(() => {
    const ctx = getCtx();
    if (!ctx) return;
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [getCtx]);

  return (
    <div className="flex flex-col gap-3">
      {/* 캔버스 */}
      <div className="border border-pos-border rounded-pos-sm overflow-hidden bg-pos-bg">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block"
          style={{ touchAction: 'none', width, height }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>

      {/* 안내 */}
      <p className="text-2xs text-pos-text-muted text-center">위 영역에 서명해주세요</p>

      {/* 버튼 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="flex-1 h-touch rounded-pos-btn bg-pos-surface text-pos-text-secondary text-sm font-semibold active:bg-gray-300 active:scale-[0.97] transition-transform duration-fast cursor-pointer select-none"
        >
          지우기
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 h-touch rounded-pos-btn bg-primary-500 text-pos-text-inverse text-sm font-bold active:bg-primary-700 active:scale-[0.97] transition-transform duration-fast cursor-pointer select-none"
        >
          확인
        </button>
      </div>
    </div>
  );
}
