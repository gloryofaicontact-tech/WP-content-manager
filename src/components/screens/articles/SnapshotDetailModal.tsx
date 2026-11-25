import React from 'react';
import { Modal } from '../../common/Modal';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import type { ContentSnapshotDetailDto } from '../../../api/types/article.dto';
import {
  Database,
  ExternalLink,
  Calendar,
  Layers,
  Code2,
  Trash2,
  Sliders,
} from 'lucide-react';

interface SnapshotDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  snapshot: ContentSnapshotDetailDto | null;
  onDelete?: (snapshotId: string) => void;
  isDeleting?: boolean;
}

export const SnapshotDetailModal: React.FC<SnapshotDetailModalProps> = ({
  isOpen,
  onClose,
  loading,
  snapshot,
  onDelete,
  isDeleting,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 dark:text-zinc-100 truncate block">
                {snapshot?.title || 'Content Snapshot Details'}
              </span>
              {snapshot?.workflowStatus && (
                <Badge variant="violet" size="sm">
                  {snapshot.workflowStatus}
                </Badge>
              )}
            </div>
            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 block">
              Snapshot ID: {snapshot?.id} &bull; Post #{snapshot?.wpPostId}
            </span>
          </div>
        </div>
      }
      description="Inspect snapshotted raw WordPress HTML content, custom fields, and workflow status."
    >
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <div className="w-7 h-7 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading snapshot details...</p>
        </div>
      ) : !snapshot ? (
        <div className="py-8 text-center text-xs text-slate-500">No snapshot details found.</div>
      ) : (
        <div className="space-y-4 text-xs text-slate-700 dark:text-zinc-300">
          {/* Featured Image */}
          {snapshot.featuredMediaUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 max-h-52 bg-slate-900">
              <img
                src={snapshot.featuredMediaUrl}
                alt=""
                className="w-full h-52 object-cover"
              />
            </div>
          )}

          {/* Quick info row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Content Type</span>
              <span className="font-semibold text-slate-900 dark:text-zinc-100 block capitalize flex items-center gap-1">
                <Layers className="w-3 h-3 text-violet-500" />
                {snapshot.contentType?.name || snapshot.contentType?.slug || 'Post'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">WP Live Status</span>
              <Badge variant={snapshot.wpStatus === 'publish' ? 'success' : 'warning'} size="sm">
                {snapshot.wpStatus}
              </Badge>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Snapshotted At</span>
              <span className="font-mono text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] text-slate-400 block mb-0.5">Live WordPress URL</span>
              {snapshot.wpUrl ? (
                <a
                  href={snapshot.wpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 truncate"
                >
                  Visit Post <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="text-slate-400">N/A</span>
              )}
            </div>
          </div>

          {/* Raw Content Viewer */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                Raw WordPress HTML Content
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {snapshot.rawContent ? `${snapshot.rawContent.length} chars` : 'Empty'}
              </span>
            </div>
            <pre className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 max-h-56 overflow-y-auto text-[11px] font-mono text-slate-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {snapshot.rawContent || 'No raw content recorded.'}
            </pre>
          </div>

          {/* Custom Fields Preview */}
          {snapshot.customFields && (
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-500" />
                Custom Fields & Meta Keys
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1">
                {Object.entries(snapshot.customFields?.meta || {}).slice(0, 10).map(([k, v]) => (
                  <div
                    key={k}
                    className="p-1.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-[11px] font-mono"
                  >
                    <span className="text-slate-700 dark:text-zinc-300 truncate max-w-[200px]">{k}</span>
                    <span className="text-slate-400 truncate max-w-[200px]">
                      {typeof v === 'object' ? JSON.stringify(v) : String(v || '-')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between">
            {onDelete ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(snapshot.id)}
                isLoading={isDeleting}
                icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                className="hover:border-rose-300 hover:text-rose-600"
              >
                Delete Snapshot
              </Button>
            ) : <div />}

            <Button variant="glow" size="sm" onClick={onClose}>
              Close Viewer
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
