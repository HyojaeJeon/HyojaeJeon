'use client';

import { useEffect, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────
interface Position {
  x: number;
  y: number;
}

interface MoveImageDialogProps {
  /** Whether the animation is active */
  active: boolean;
  /** Image source URL or data URI */
  imageSrc: string;
  /** Start position (absolute pixels) */
  from: Position;
  /** End position (absolute pixels) */
  to: Position;
  /** Animation duration in ms (default: 400) */
  duration?: number;
  /** Size of the moving image in px (default: 48) */
  size?: number;
  /** Called when animation completes */
  onComplete?: () => void;
}

/**
 * MoveImageDialog - CSS transition replacement for legacy IDD_MOVEIMG_DLG.
 *
 * The legacy version used a transparent GDI dialog to animate an image
 * moving across the screen (e.g., menu icon flying to order list on add).
 * This component uses CSS transitions to achieve the same effect without
 * any dialog/modal.
 *
 * Usage:
 *   <MoveImageDialog
 *     active={isAnimating}
 *     imageSrc="/icons/menu-item.png"
 *     from={{ x: 200, y: 300 }}
 *     to={{ x: 800, y: 100 }}
 *     onComplete={() => setIsAnimating(false)}
 *   />
 */
export default function MoveImageDialog({
  active,
  imageSrc,
  from,
  to,
  duration = 400,
  size = 48,
  onComplete,
}: MoveImageDialogProps) {
  const [phase, setPhase] = useState<'idle' | 'start' | 'moving' | 'done'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (active) {
      // Start at 'from' position
      setPhase('start');
      // Trigger transition on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase('moving');
        });
      });
      // Complete after duration
      timerRef.current = setTimeout(() => {
        setPhase('done');
        onComplete?.();
      }, duration + 50);
    } else {
      setPhase('idle');
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, duration, onComplete]);

  if (phase === 'idle' || phase === 'done') return null;

  const currentPos = phase === 'start' ? from : to;

  return (
    <div
      className="fixed pointer-events-none"
      style={{
        zIndex: 'var(--z-toast, 9999)',
        left: currentPos.x,
        top: currentPos.y,
        width: size,
        height: size,
        transition: phase === 'moving'
          ? `left ${duration}ms ease-in-out, top ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`
          : 'none',
        opacity: phase === 'moving' ? 0.6 : 1,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt=""
        width={size}
        height={size}
        className="rounded-pos object-contain"
        style={{
          transition: phase === 'moving'
            ? `transform ${duration}ms ease-in-out`
            : 'none',
          transform: phase === 'moving' ? 'scale(0.5)' : 'scale(1)',
        }}
      />
    </div>
  );
}
