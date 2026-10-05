import { useState, useEffect } from "react";
import { Check, Film, Image as ImageIcon } from "lucide-react";

import Button from "./Button.jsx";
import CancelButton from "./CancelButton.jsx";

function UploadProgressModal({
  open,
  fileName,
  isVideo,
  progress,
  done,
  queueIndex,
  queueTotal,
  onCancel,
  onClose,
}) {
  const [dot, setDot] = useState(1);

  useEffect(() => {
    if (!open || done) return;
    const id = setInterval(() => setDot((d) => (d % 3) + 1), 420);
    return () => clearInterval(id);
  }, [open, done]);

  if (!open) return null;

  const FileIcon = isVideo ? Film : ImageIcon;
  const showQueue = queueTotal > 1;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[400px] max-w-[calc(100%-32px)] bg-bg-panel border border-border-muted rounded-xl p-6 flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary m-0">
              {done ? (
                <>
                  <span className="w-6 h-6 rounded-full bg-accent-green text-bg-primary flex items-center justify-center flex-shrink-0">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  Upload complete
                </>
              ) : (
                <span>
                  Uploading
                  <span aria-hidden="true">
                    <span className={dot >= 1 ? "opacity-100" : "opacity-0"}>
                      .
                    </span>
                    <span className={dot >= 2 ? "opacity-100" : "opacity-0"}>
                      .
                    </span>
                    <span className={dot >= 3 ? "opacity-100" : "opacity-0"}>
                      .
                    </span>
                  </span>
                  {showQueue && (
                    <span className="text-text-muted font-normal">
                      {" "}
                      ({queueIndex} of {queueTotal})
                    </span>
                  )}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2 min-w-0">
              <FileIcon size={16} className="text-text-muted flex-shrink-0" />
              <span
                title={done && showQueue ? undefined : fileName}
                className="flex-1 min-w-0 text-sm text-text-muted whitespace-nowrap overflow-hidden text-ellipsis"
              >
                {done && showQueue
                  ? `${queueTotal}/${queueTotal} files uploaded`
                  : fileName}
              </span>
            </div>
          </div>

          {!done && (
            <CancelButton
              size="lg"
              title="Cancel upload"
              onClick={onCancel}
              className="-mt-2 -mr-2"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Upload progress"
            className="relative h-2 rounded bg-bg-primary border border-border-muted overflow-hidden"
          >
            <div
              className={`absolute inset-y-0 left-0 rounded transition-[width] duration-200 ${
                done ? "bg-accent-green" : "bg-[#1f6feb]"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">
              {done ? "Upload complete" : "Uploading file"}
            </span>
            <span
              className={`font-semibold ${done ? "text-accent-green" : "text-text-primary"}`}
            >
              {progress}%
            </span>
          </div>
        </div>

        {done && (
          <div className="flex justify-end">
            <Button onClick={onClose}>Okay</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadProgressModal;

// Shows upload progress for an in-flight image/video upload: an animated
// "Uploading..." title (dots cycle while in progress), file name, a
// percentage progress bar (blue while uploading, green + checkmark on
// completion with an "Okay" button to dismiss), and a cancel ("X") button
// while uploading. Progress/cancel are driven by api/content.js's
// XMLHttpRequest-based uploadFile (fetch has no upload-progress event).
// `queueIndex`/`queueTotal` (optional) show a "(2 of 5)" counter in the
// title while a multi-file batch is uploading, and "5/5 files uploaded" in
// place of the filename once the whole batch finishes.
// Used by: pages/Content.jsx.
