'use client';

import { useState } from 'react';
import { X, FolderOpen, ChevronRight, Sparkles } from 'lucide-react';
import {
  getAllTemplateFlows,
  getTemplateFlowCategories,
  getCategoryDisplayName,
  type TemplateFlow,
} from '@/lib/template-flows';
import { DynamicIcon } from '@/components/common/dynamic-icon';

interface TemplateFlowPickerProps {
  onSelect: (flow: TemplateFlow) => void;
  onClose: () => void;
}

const CATEGORY_STYLES: Record<
  TemplateFlow['category'],
  { bg: string; border: string; text: string; icon: string }
> = {
  guardrails: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'Shield',
  },
  detection: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'Search',
  },
  'state-management': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'Database',
  },
  quality: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700',
    icon: 'CheckCircle',
  },
};

export function TemplateFlowPicker({ onSelect, onClose }: TemplateFlowPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateFlow['category'] | null>(null);
  const categories = getTemplateFlowCategories();
  const allFlows = getAllTemplateFlows();

  const filteredFlows = selectedCategory
    ? allFlows.filter((f) => f.category === selectedCategory)
    : allFlows;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[700px] max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-black">
          <div className="flex items-center gap-3 text-white">
            <FolderOpen className="w-5 h-5" />
            <span className="font-semibold text-lg">Template Flows</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-black text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Templates
            </button>
            {categories.map((cat) => {
              const style = CATEGORY_STYLES[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-black text-white'
                      : `${style.bg} ${style.text} hover:opacity-80 border ${style.border}`
                  }`}
                >
                  <DynamicIcon name={style.icon} className="w-3.5 h-3.5" />
                  {getCategoryDisplayName(cat)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Flow List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-3">
            {filteredFlows.map((flow) => {
              const style = CATEGORY_STYLES[flow.category];
              return (
                <button
                  key={flow.id}
                  onClick={() => onSelect(flow)}
                  className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all text-left group bg-white"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${style.bg} ${style.border} border flex items-center justify-center flex-shrink-0`}
                  >
                    <DynamicIcon name={flow.icon} className={`w-6 h-6 ${style.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{flow.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
                      >
                        {getCategoryDisplayName(flow.category)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{flow.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>{flow.nodes.length} nodes</span>
                      <span>{flow.edges.length} connections</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-1" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="w-4 h-4" />
            <span>Select a template to load it into the canvas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
