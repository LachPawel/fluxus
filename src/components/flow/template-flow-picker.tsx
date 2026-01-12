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

const CATEGORY_STYLES: Record<TemplateFlow['category'], { icon: string }> = {
  guardrails: {
    icon: 'Shield',
  },
  detection: {
    icon: 'Search',
  },
  'state-management': {
    icon: 'Database',
  },
  quality: {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[90vh] md:max-h-[80vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-black">
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
        <div className="px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-black text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => {
              const style = CATEGORY_STYLES[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === cat
                      ? 'bg-black text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <DynamicIcon name={style.icon} className="w-4 h-4" />
                  {getCategoryDisplayName(cat)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Flow List */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <div className="grid gap-3">
            {filteredFlows.map((flow) => {
              const style = CATEGORY_STYLES[flow.category];
              return (
                <button
                  key={flow.id}
                  onClick={() => onSelect(flow)}
                  className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 hover:border-black hover:shadow-lg transition-all text-left group bg-white"
                >
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                    <DynamicIcon name={flow.icon} className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-slate-900">{flow.name}</h3>
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 flex items-center gap-1.5">
                        <DynamicIcon name={style.icon} className="w-3 h-3" />
                        {getCategoryDisplayName(flow.category)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {flow.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        {flow.nodes.length} nodes
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        {flow.edges.length} connections
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-black group-hover:translate-x-1 transition-all flex-shrink-0 mt-3" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Sparkles className="w-4 h-4" />
            <span>Select a template to load it into the canvas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
