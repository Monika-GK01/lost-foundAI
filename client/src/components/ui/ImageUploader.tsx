import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { Upload, X, Crop as CropIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  /** Enable the crop step for each added image. */
  enableCrop?: boolean;
}

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

/** Load a File into an HTMLImageElement. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Draw the cropped region onto a canvas and return it. */
function getCroppedCanvas(img: HTMLImageElement, area: Area): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(area.width);
  canvas.height = Math.round(area.height);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
  }
  return canvas;
}

/** Downscale a canvas so its longest edge is at most MAX_DIMENSION, returning a compressed File. */
function canvasToCompressedFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    let { width, height } = canvas;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const out = document.createElement('canvas');
    out.width = width;
    out.height = height;
    const ctx = out.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }
    ctx.drawImage(canvas, 0, 0, width, height);
    out.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Compression failed'));
          return;
        }
        resolve(new File([blob], name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }));
      },
      'image/jpeg',
      JPEG_QUALITY
    );
  });
}

export function ImageUploader({ files, onChange, maxFiles = 5, enableCrop = false }: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropName, setCropName] = useState('image.jpg');
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addCompressed = useCallback(
    async (file: File) => {
      const src = URL.createObjectURL(file);
      try {
        const img = await loadImage(src);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d')?.drawImage(img, 0, 0);
        const compressed = await canvasToCompressedFile(canvas, file.name);
        onChange([...files, compressed]);
        setPreviews((prev) => [...prev, URL.createObjectURL(compressed)]);
      } catch {
        toast.error(`Could not process ${file.name}`);
      } finally {
        URL.revokeObjectURL(src);
      }
    },
    [files, onChange]
  );

  const handleFiles = useCallback(
    async (incoming: FileList | File[]) => {
      const list = Array.from(incoming).filter((f) => f.type.startsWith('image/'));
      if (list.length === 0) return;

      const remaining = maxFiles - files.length;
      if (remaining <= 0) {
        toast.error(`You can upload up to ${maxFiles} images`);
        return;
      }
      const accepted = list.slice(0, remaining);
      if (list.length > remaining) toast.error(`Only ${remaining} more image(s) allowed`);

      if (enableCrop) {
        // Crop one at a time, starting with the first.
        const first = accepted[0];
        setCropName(first.name);
        setCropSrc(URL.createObjectURL(first));
        return;
      }

      setProcessing(true);
      for (const file of accepted) {
        // eslint-disable-next-line no-await-in-loop
        await addCompressed(file);
      }
      setProcessing(false);
    },
    [files.length, maxFiles, enableCrop, addCompressed]
  );

  const removeImage = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const applyCrop = async () => {
    if (!cropSrc || !croppedArea) return;
    setProcessing(true);
    try {
      const img = await loadImage(cropSrc);
      const canvas = getCroppedCanvas(img, croppedArea);
      const compressed = await canvasToCompressedFile(canvas, cropName);
      onChange([...files, compressed]);
      setPreviews((prev) => [...prev, URL.createObjectURL(compressed)]);
    } catch {
      toast.error('Could not crop image');
    } finally {
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedArea(null);
      setProcessing(false);
    }
  };

  const cancelCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {previews.map((src, i) => (
          <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-[var(--color-border)]">
            <img src={src} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && files.length > 1 && (
              <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[9px] font-medium text-white">
                Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white transition-colors hover:bg-black/80"
              aria-label={`Remove image ${i + 1}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {files.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            disabled={processing}
            className={cn(
              'flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed text-[var(--color-text-secondary)] transition-colors',
              dragging ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900/20' : 'border-[var(--color-border)] hover:border-primary-400 hover:text-primary-600',
              processing && 'cursor-wait opacity-60'
            )}
            aria-label="Add images"
          >
            {processing ? (
              <span className="text-[10px]">Processing…</span>
            ) : (
              <>
                <Upload size={20} />
                <span className="mt-1 text-[10px]">{dragging ? 'Drop' : 'Upload'}</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <p className="mt-2 flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
        <AlertCircle size={12} /> Up to {maxFiles} images · JPEG/PNG/WebP · auto-compressed
        {enableCrop && ' · cropped'}
      </p>

      {/* Crop modal */}
      {cropSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <CropIcon size={18} /> Crop Image
            </h3>
            <div className="relative mt-4 h-64 w-full overflow-hidden rounded-lg bg-black">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_area, pixels) => setCroppedArea(pixels)}
              />
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-primary-600"
                aria-label="Zoom"
              />
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={cancelCrop} className="btn-secondary">Cancel</button>
              <button type="button" onClick={applyCrop} disabled={processing} className="btn-primary">
                {processing ? 'Applying…' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
