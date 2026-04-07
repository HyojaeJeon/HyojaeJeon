'use client';

import { useState } from 'react';
import { useDesignDocsT } from '../i18n/DesignDocsI18nProvider';

interface FlowStep {
  id: string;
  letter: string;
  titleKey: string;
  summaryKey: string;
  detailKey: string;
  color: string;
  icon: string;
}

const STEPS: FlowStep[] = [
  { id: 'a', letter: 'A', titleKey: 'az_flow.a.title', summaryKey: 'az_flow.a.summary', detailKey: 'az_flow.a.detail', color: '#6366f1', icon: '⚡' },
  { id: 'b', letter: 'B', titleKey: 'az_flow.b.title', summaryKey: 'az_flow.b.summary', detailKey: 'az_flow.b.detail', color: '#3b82f6', icon: '🌐' },
  { id: 'c', letter: 'C', titleKey: 'az_flow.c.title', summaryKey: 'az_flow.c.summary', detailKey: 'az_flow.c.detail', color: '#0ea5e9', icon: '📦' },
  { id: 'd', letter: 'D', titleKey: 'az_flow.d.title', summaryKey: 'az_flow.d.summary', detailKey: 'az_flow.d.detail', color: '#14b8a6', icon: '📡' },
  { id: 'e', letter: 'E', titleKey: 'az_flow.e.title', summaryKey: 'az_flow.e.summary', detailKey: 'az_flow.e.detail', color: '#10b981', icon: '💾' },
  { id: 'f', letter: 'F', titleKey: 'az_flow.f.title', summaryKey: 'az_flow.f.summary', detailKey: 'az_flow.f.detail', color: '#f59e0b', icon: '🔄' },
  { id: 'g', letter: 'G', titleKey: 'az_flow.g.title', summaryKey: 'az_flow.g.summary', detailKey: 'az_flow.g.detail', color: '#f97316', icon: '🎯' },
  { id: 'h', letter: 'H', titleKey: 'az_flow.h.title', summaryKey: 'az_flow.h.summary', detailKey: 'az_flow.h.detail', color: '#ef4444', icon: '🔧' },
  { id: 'i', letter: 'I', titleKey: 'az_flow.i.title', summaryKey: 'az_flow.i.summary', detailKey: 'az_flow.i.detail', color: '#ec4899', icon: '☁️' },
  { id: 'j', letter: 'J', titleKey: 'az_flow.j.title', summaryKey: 'az_flow.j.summary', detailKey: 'az_flow.j.detail', color: '#8b5cf6', icon: '🛡️' },
];

function FlowCard({ step, index }: { step: FlowStep; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useDesignDocsT();

  const title = t(step.titleKey);
  const summary = t(step.summaryKey);
  const detail = t(step.detailKey);
  const hasDetail = detail !== step.detailKey;

  return (
    <div className="relative">
      {/* Connector line */}
      {index > 0 && (
        <div className="absolute -top-3 left-7 w-0.5 h-3" style={{ background: `linear-gradient(${STEPS[index - 1].color}, ${step.color})` }} />
      )}

      <div
        className="rounded-xl border transition-all duration-200 overflow-hidden"
        style={{ borderColor: expanded ? step.color + '40' : '#e5e7eb' }}
      >
        {/* Header */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
        >
          {/* Letter badge */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: step.color }}
          >
            <span className="text-white text-sm font-black">{step.letter}</span>
          </div>

          {/* Title + Summary */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">{title}</span>
              <span className="text-base">{step.icon}</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5 truncate">{summary}</div>
          </div>

          {/* Expand/Collapse */}
          <div className="shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: expanded ? step.color + '15' : '#f1f5f9' }}
            >
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                style={{ color: expanded ? step.color : '#94a3b8' }}
              >
                <path d="M3.5 5.25L7 8.75l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </button>

        {/* Detail (expandable) */}
        {expanded && hasDetail && (
          <div className="px-5 pb-5 pt-1 border-t" style={{ borderColor: step.color + '15' }}>
            <div className="pl-14">
              {renderDetail(detail, step.color)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderDetail(text: string, color: string) {
  const blocks = text.split('\n\n');

  return (
    <div className="space-y-3">
      {blocks.map((block, bi) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Code block
        if (trimmed.startsWith('```')) {
          const code = trimmed.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
          return (
            <pre key={bi} className="rounded-lg bg-slate-900 p-3 text-[10px] font-mono text-slate-300 leading-relaxed overflow-x-auto">
              {code}
            </pre>
          );
        }

        // Step list (numbered items with →)
        const lines = trimmed.split('\n');
        if (lines.some(l => /^\d+\.\s/.test(l))) {
          return (
            <ol key={bi} className="space-y-2">
              {lines.filter(l => l.trim()).map((l, li) => {
                const num = l.match(/^(\d+)\./)?.[1];
                const text = l.replace(/^\d+\.\s*/, '');
                return (
                  <li key={li} className="flex items-start gap-2.5">
                    {num && (
                      <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5" style={{ background: color + 'cc' }}>
                        {num}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-600 leading-relaxed">{inlineFmt(text)}</span>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Arrow flow (A → B → C)
        if (trimmed.includes('→') && !trimmed.startsWith('-')) {
          const segments = trimmed.split(/\s*→\s*/);
          return (
            <div key={bi} className="flex flex-wrap items-center gap-1 my-2">
              {segments.map((seg, si) => (
                <span key={si} className="flex items-center gap-1">
                  <span className="text-[10px] px-2 py-1 rounded-md bg-white border border-gray-200 font-mono text-gray-600">{seg.trim()}</span>
                  {si < segments.length - 1 && (
                    <svg width="16" height="10" viewBox="0 0 16 10" className="shrink-0" style={{ color }}>
                      <path d="M0 5h12M9 1l4 4-4 4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              ))}
            </div>
          );
        }

        // Bullet list
        if (lines.every(l => /^\s*[-*]\s/.test(l))) {
          return (
            <ul key={bi} className="space-y-1">
              {lines.map((l, li) => (
                <li key={li} className="flex items-start gap-2 text-[11px] text-gray-600">
                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
                  <span className="leading-relaxed">{inlineFmt(l.replace(/^\s*[-*]\s+/, ''))}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Paragraph
        return (
          <p key={bi} className="text-[11px] text-gray-600 leading-relaxed">
            {inlineFmt(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function inlineFmt(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-semibold text-gray-800">{p.slice(2, -2)}</strong>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} className="px-1 py-0.5 rounded bg-slate-100 text-[10px] font-mono text-slate-600">{p.slice(1, -1)}</code>;
    return p;
  });
}

export default function AzFlowCards() {
  const { t } = useDesignDocsT();

  return (
    <div className="my-6 space-y-3">
      {/* Header bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className="w-6 h-1.5 first:rounded-l-full last:rounded-r-full"
              style={{ background: s.color }}
            />
          ))}
        </div>
        <span className="text-[10px] text-gray-400 font-semibold">A → J · 10 Flow Points</span>
      </div>

      {STEPS.map((step, i) => (
        <FlowCard key={step.id} step={step} index={i} />
      ))}
    </div>
  );
}
