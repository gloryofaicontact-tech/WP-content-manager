import React from 'react';
import { Modal } from '../../common/Modal';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import type { ContentTypeDetailDto } from '../../../api/types/website.dto';
import {
  Layers,
  Tag,
  CheckCircle2,
  Clock,
  Sparkles,
  Sliders,
  Code2,
} from 'lucide-react';

interface ContentTypeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  contentType: ContentTypeDetailDto | null;
}

export const ContentTypeDetailModal: React.FC<ContentTypeDetailModalProps> = ({
  isOpen,
  onClose,
  loading,
  contentType,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {contentType?.name || 'Content Type Details'}
              </span>
              {contentType?.schemaStatus && (
                <Badge variant="success" size="sm">
                  {contentType.schemaStatus}
                </Badge>
              )}
            </div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 block">
              Slug: <code className="text-violet-600 dark:text-violet-400 font-semibold">{contentType?.slug}</code>
            </span>
          </div>
        </div>
      }
      description="Inspect WordPress REST Base, taxonomies, ACF fields, and registered features."
    >
      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-7 h-7 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading schema and taxonomy definitions...</p>
        </div>
      ) : !contentType ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No schema details found.
        </div>
      ) : (
        <div className="space-y-5 text-xs text-slate-700 dark:text-zinc-300">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">REST Base</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100 truncate block">
                /{contentType.restNamespace}/{contentType.restBase}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Hierarchical</span>
              <span className="font-semibold text-slate-900 dark:text-zinc-100 block">
                {contentType.hierarchical ? 'Yes (Pages style)' : 'No (Flat posts)'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Last Discovered</span>
              <span className="font-mono text-slate-600 dark:text-zinc-400 truncate block flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {contentType.lastDiscoveredAt
                  ? new Date(contentType.lastDiscoveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Recent'}
              </span>
            </div>
          </div>

          {/* Taxonomies Section */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                Registered Taxonomies ({contentType.taxonomies?.length || 0})
              </h4>
            </div>

            {contentType.taxonomies && contentType.taxonomies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {contentType.taxonomies.map((tax, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                        {tax.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        Slug: <code>{tax.slug}</code>
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                      {tax.hierarchical ? 'Category (Nested)' : 'Tag (Flat)'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No taxonomies registered for this post type.</p>
            )}
          </div>

          {/* Supports Features Section */}
          {contentType.supports && contentType.supports.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                WordPress Supported Features
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {contentType.supports.map(feature => (
                  <span
                    key={feature}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/60 font-mono text-[11px]"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ACF Fields Section */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-500" />
              Custom Fields (ACF / Meta)
            </h4>
            {contentType.acfFields && contentType.acfFields.length > 0 ? (
              <div className="space-y-1.5">
                {contentType.acfFields.map((field: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between font-mono text-[11px]"
                  >
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      {field.label || field.name || field.key}
                    </span>
                    <span className="text-slate-400 uppercase">{field.type || 'text'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No custom fields (ACF) attached.</p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={onClose} icon={<Code2 className="w-3.5 h-3.5" />}>
              Close Schema View
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
