'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, ArrowUpRight } from 'lucide-react';
import { NewsArticle } from '@/lib/news-engine';
import { SupportedLanguage } from '@/lib/translations';

interface BreakingNewsTickerProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

const LANG_ORDER: { code: SupportedLanguage; label: string }[] = [
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'en', label: 'ENGLISH' }
];

export function BreakingNewsTicker({ articles, onSelectArticle }: BreakingNewsTickerProps) {
  const breakingList = articles.filter((a) => a.isBreaking).length > 0
    ? articles.filter((a) => a.isBreaking)
    : articles.slice(0, 5);

  const [stepIndex, setStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalSteps = Math.max(1, breakingList.length * LANG_ORDER.length);

  useEffect(() => {
    if (isPaused || breakingList.length === 0) return;
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % totalSteps);
    }, 3600);
    return () => clearInterval(timer);
  }, [isPaused, totalSteps, breakingList.length]);

  if (breakingList.length === 0) return null;

  const safeStep = stepIndex % totalSteps;
  const articleIndex = Math.floor(safeStep / LANG_ORDER.length) % breakingList.length;
  const langIndex = safeStep % LANG_ORDER.length;

  const activeArticle = breakingList[articleIndex];
  const activeLangObj = LANG_ORDER[langIndex];
  const headlineText = activeArticle.title[activeLangObj.code] || activeArticle.title.te;

  const handlePrev = () => {
    setStepIndex((prev) => (prev - 1 + totalSteps) % totalSteps);
  };

  const handleNext = () => {
    setStepIndex((prev) => (prev + 1) % totalSteps);
  };

  return (
    <div
      className="bg-red-950 text-white border-b border-red-900"
      role="region"
      aria-label="Breaking News Multilingual Ticker"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        {/* Left Label & Active Language Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded bg-amber-400 px-2.5 py-1 text-xs font-extrabold text-stone-950 tracking-wide">
            <Volume2 className="w-3.5 h-3.5" />
            తాజా వార్తలు · BREAKING
          </span>
          <div
            className="flex items-center gap-1 bg-red-900/90 px-2 py-0.5 rounded border border-red-800 text-[11px] font-bold"
            aria-label="Ticker Active Language"
          >
            {LANG_ORDER.map((l, idx) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setStepIndex(articleIndex * LANG_ORDER.length + idx)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  idx === langIndex
                    ? 'bg-white text-red-950 font-extrabold'
                    : 'text-red-200 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center Cycling Headline (Telugu -> Hindi -> English) */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-xs text-amber-300 font-semibold shrink-0 hidden lg:inline">
            [{activeArticle.mandal}]
          </span>
          <button
            type="button"
            onClick={() => onSelectArticle(activeArticle)}
            className="text-left text-xs sm:text-sm font-bold text-white hover:text-amber-300 truncate transition-colors flex items-center gap-1.5"
            title={headlineText}
          >
            <span className="truncate">{headlineText}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          </button>
        </div>

        {/* Right Controls: Prev / Pause-Play / Next */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-mono text-red-200 tabular-nums mr-1 hidden md:inline">
            {articleIndex + 1}/{breakingList.length}
          </span>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Breaking Headline"
            className="p-1 rounded bg-red-900 hover:bg-red-800 text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            aria-label={isPaused ? 'Resume Breaking Ticker' : 'Pause Breaking Ticker'}
            className="p-1 rounded bg-red-900 hover:bg-red-800 text-white transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Breaking Headline"
            className="p-1 rounded bg-red-900 hover:bg-red-800 text-white transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
