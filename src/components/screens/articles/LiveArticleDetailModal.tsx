import React from 'react';
import { Modal } from '../../common/Modal';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import {
  FileText,
  ExternalLink,
  Calendar,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface LiveArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  article: any | null;
  onIngest?: () => void;
  isIngesting?: boolean;
}

export const LiveArticleDetailModal: React.FC<LiveArticleModalProps> = ({
  isOpen,
  onClose,
  loading,
  article,
  onIngest,
  isIngesting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-base font-bold text-slate-900 dark:text-zinc-100 truncate block">
              {article?.title || 'Live WordPress Record'}
            </span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 block">
              Post ID: #{article?.id} &bull; Slug: <code>{article?.slug}</code>
            </span>
          </div>
        </div>
      }
      description="Inspect live WordPress REST data and ingest a content snapshot into the workflow."
    >
      {loading ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-7 h-7 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Fetching live record from WordPress...</p>
        </div>
      ) : !article ? (
        <div className="py-8 text-center text-xs text-slate-500">Record not found.</div>
      ) : (
        <div className="space-y-4 text-xs">
          {/* Featured Image */}
          {article.featuredMedia?.sourceUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 max-h-56 bg-slate-900">
              <img
                src={article.featuredMedia.sourceUrl}
                alt={article.featuredMedia.altText || ''}
                className="w-full h-56 object-cover"
              />
            </div>
          )}

          {/* Quick info row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Status</span>
              <Badge variant={article.status === 'publish' ? 'success' : 'warning'} size="sm">
                {article.status}
              </Badge>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Published Date</span>
              <span className="font-mono text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {article.date ? article.date.split('T')[0] : 'N/A'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Workflow Snapshot</span>
              <span className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                {article.hasSnapshot ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Snapshotted
                  </span>
                ) : (
                  <span className="text-slate-400">Not Ingested</span>
                )}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Live WordPress URL</span>
              {article.link ? (
                <a
                  href={article.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 truncate"
                >
                  Visit Site <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-slate-400">N/A</span>
              )}
            </div>
          </div>

          {/* Excerpt / Summary */}
          {article.excerpt && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-1">
              <span className="font-semibold text-slate-700 dark:text-zinc-300 block">Excerpt:</span>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">{article.excerpt}</p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>

            <div className="flex items-center gap-2">
              {article.link && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(article.link, '_blank')}
                  icon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Open in Browser
                </Button>
              )}
              {onIngest && !article.hasSnapshot && (
                <Button
                  variant="glow"
                  size="sm"
                  onClick={onIngest}
                  isLoading={isIngesting}
                  icon={<Database className="w-3.5 h-3.5" />}
                >
                  Ingest into Workflow
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
