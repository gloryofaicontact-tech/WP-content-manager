import React from 'react';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { AlertTriangle, ExternalLink, Image as ImageIcon } from 'lucide-react';

export interface PreviewPlaceholderWarning {
  placeholderId?: string;
  position?: string;
  recommendedSearch?: string;
  elementsSearchUrl?: string;
}

interface PreviewGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeholders: PreviewPlaceholderWarning[];
  isPublishing?: boolean;
  onGoToImages: () => void;
  onPublishAnyway: () => void;
}

export const PreviewGuardModal: React.FC<PreviewGuardModalProps> = ({
  isOpen,
  onClose,
  placeholders,
  isPublishing,
  onGoToImages,
  onPublishAnyway,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unreplaced Envato Preview Images">
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">This article still uses Envato preview images.</p>
            <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              Preview URLs are lower resolution and not licensed for live sites. Download the full-resolution image from Envato Elements and upload it in the Images tab before publishing.
            </p>
          </div>
        </div>

        {placeholders.length > 0 && (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {placeholders.map((p, idx) => (
              <div
                key={p.placeholderId || idx}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 dark:text-zinc-200 font-mono truncate">
                    {p.position || p.placeholderId || `Image #${idx + 1}`}
                  </p>
                  {p.recommendedSearch && (
                    <p className="text-[11px] text-slate-500 truncate">
                      Keyword: &ldquo;{p.recommendedSearch}&rdquo;
                    </p>
                  )}
                </div>
                {p.elementsSearchUrl && (
                  <a
                    href={p.elementsSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold shrink-0 hover:bg-emerald-100"
                  >
                    Envato Elements <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onGoToImages();
            }}
            icon={<ImageIcon className="w-3.5 h-3.5" />}
          >
            Go to Images Tab
          </Button>
          <Button
            variant="destructive"
            size="sm"
            isLoading={isPublishing}
            onClick={onPublishAnyway}
          >
            Publish Anyway
          </Button>
        </div>
      </div>
    </Modal>
  );
};
