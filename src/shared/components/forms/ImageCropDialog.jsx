import { useRef, useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { drawToDataUrl, loadImage } from "../../utils/imageTools";

const ASPECTS = [
  ["Free", undefined],
  ["1:1", 1],
  ["4:3", 4 / 3],
  ["16:9", 16 / 9],
  ["3:4", 3 / 4],
];

/** Crop-before-insert dialog. `src` = object/data URL; resolves a JPEG data URL via onDone. */
export function ImageCropDialog({ src, onCancel, onDone }) {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [aspect, setAspect] = useState(undefined);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    const el = imgRef.current;
    if (!el) return;
    setBusy(true);
    try {
      const img = await loadImage(src);
      // crop is in displayed pixels → natural pixels
      const k = img.naturalWidth / el.width;
      const area =
        crop && crop.width > 4 && crop.height > 4
          ? {
              x: crop.x * k,
              y: crop.y * k,
              width: crop.width * k,
              height: crop.height * k,
            }
          : null;
      onDone(drawToDataUrl(img, area));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={!!src}
      onClose={onCancel}
      title="Crop image"
      subtitle="Drag to select the part to keep — or insert the whole image."
      width="max-w-2xl"
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {ASPECTS.map(([label, a]) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setAspect(a);
                  setCrop(undefined);
                }}
                className={`h-8 rounded-md px-2.5 text-xs font-medium ring-1 ring-inset ${
                  aspect === a
                    ? "bg-signal-50 text-signal-700 ring-signal-300 dark:bg-signal-500/15 dark:text-signal-300"
                    : "text-ink-600 ring-ink-200 hover:bg-ink-100 dark:text-ink-300 dark:ring-ink-700 dark:hover:bg-ink-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={confirm} disabled={busy}>
              {crop?.width > 4 ? "Crop & insert" : "Insert"}
            </Button>
          </div>
        </div>
      }
    >
      {src && (
        <div className="flex justify-center">
          <ReactCrop crop={crop} aspect={aspect} onChange={(c) => setCrop(c)}>
            <img
              ref={imgRef}
              src={src}
              alt="To crop"
              className="max-h-[55vh] w-auto max-w-full"
            />
          </ReactCrop>
        </div>
      )}
    </Modal>
  );
}
