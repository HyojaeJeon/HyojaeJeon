'use client';

import { Check } from 'lucide-react';

interface TimelineStep {
  label: string;
  time: string | null;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
}

interface StatusTimelineProps {
  steps: TimelineStep[];
}

export function StatusTimeline({ steps }: StatusTimelineProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;

        return (
          <div key={step.label} className="flex gap-3">
            {/* Dot column */}
            <div className="flex flex-col items-center">
              {/* Dot */}
              {step.status === 'COMPLETED' ? (
                <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#10B981]">
                  <Check size={14} className="text-white" strokeWidth={3} />
                </div>
              ) : step.status === 'ACTIVE' ? (
                <div className="relative flex h-[24px] w-[24px] items-center justify-center">
                  <div className="absolute h-[24px] w-[24px] animate-ping rounded-full bg-[#3B82F6]/30" />
                  <div className="relative h-[12px] w-[12px] rounded-full bg-[#3B82F6]" />
                </div>
              ) : (
                <div className="flex h-[24px] w-[24px] items-center justify-center">
                  <div className="h-[12px] w-[12px] rounded-full border-2 border-gray-200 bg-white" />
                </div>
              )}

              {/* Line */}
              {!isLast && (
                <div
                  className={`w-[2px] flex-1 min-h-[32px] ${
                    step.status === 'COMPLETED' ? 'bg-[#10B981]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
              <p
                className={`text-[14px] font-medium ${
                  step.status === 'COMPLETED'
                    ? 'text-[#10B981]'
                    : step.status === 'ACTIVE'
                      ? 'text-[#3B82F6]'
                      : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>
              {step.time && (
                <p className="text-[12px] text-gray-400">{step.time}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
