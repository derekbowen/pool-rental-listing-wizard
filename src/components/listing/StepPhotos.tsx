import { useCallback, useRef } from "react";
import { useListing } from "@/contexts/ListingContext";
import { cn } from "@/lib/utils";
import { Camera, GripVertical, X, Star, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function StepPhotos() {
  const { draft, updateDraft, next, back } = useListing();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);
  const [showVideo, setShowVideo] = useState(!!draft.videoUrl);

  const addPhotos = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newImages = Array.from(files)
        .filter((f) => f.type.startsWith("image/") && f.size <= 20 * 1024 * 1024)
        .slice(0, 20 - draft.images.length)
        .map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
        }));
      updateDraft({ images: [...draft.images, ...newImages] });
    },
    [draft.images, updateDraft],
  );

  const removePhoto = (id: string) => {
    const img = draft.images.find((i) => i.id === id);
    if (img) URL.revokeObjectURL(img.preview);
    updateDraft({ images: draft.images.filter((i) => i.id !== id) });
  };

  // Simple drag-and-drop reorder via HTML5 drag events
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDropIdx(idx);
  };
  const handleDrop = (idx: number) => {
    if (dragIdx === null || dragIdx === idx) return;
    const images = [...draft.images];
    const [moved] = images.splice(dragIdx, 1);
    images.splice(idx, 0, moved);
    updateDraft({ images });
    setDragIdx(null);
    setDropIdx(null);
  };
  const handleDragEnd = () => {
    setDragIdx(null);
    setDropIdx(null);
  };

  const handleDrop2 = (e: React.DragEvent) => {
    e.preventDefault();
    addPhotos(e.dataTransfer.files);
  };

  const canContinue = draft.images.length >= 3;

  return (
    <div className="py-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-cyan-900">Show off your space</h1>
        <p className="mt-2 text-slate-500">
          Great photos = more bookings. Upload at least 3 photos to continue.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop2}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
          "hover:border-cyan-400 hover:bg-cyan-50/50",
          draft.images.length > 0 ? "border-slate-200 py-6" : "border-cyan-300 bg-cyan-50/30",
        )}
      >
        <div className="relative">
          <Camera className="w-10 h-10 text-cyan-500" />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">+</span>
          </div>
        </div>
        <p className="font-medium text-slate-700">Drag photos here or tap to browse</p>
        <p className="text-xs text-slate-400">JPG or PNG &middot; Max 20MB each &middot; Up to 20 photos</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addPhotos(e.target.files)}
        />
      </div>

      {/* Photo grid */}
      {draft.images.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {draft.images.map((img, idx) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "relative group aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-grab active:cursor-grabbing",
                  dropIdx === idx && dragIdx !== idx
                    ? "border-cyan-500 scale-[1.02]"
                    : "border-transparent",
                  dragIdx === idx ? "opacity-50" : "opacity-100",
                )}
              >
                <img
                  src={img.preview}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Drag handle */}
                <div className="absolute top-2 left-2 p-1 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-white" />
                </div>
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(img.id);
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
                {/* Cover photo badge */}
                {idx === 0 && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-cyan-600 rounded-full">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-white">Cover Photo</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Photo counter */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              {draft.images.length}/20 photos uploaded
            </span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(20, 10) }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i < draft.images.length ? "bg-cyan-500" : "bg-slate-200",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video link (optional, collapsible) */}
      <div>
        <button
          onClick={() => setShowVideo(!showVideo)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          {showVideo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Have a video? Add a YouTube or link
        </button>
        {showVideo && (
          <input
            type="url"
            value={draft.videoUrl}
            onChange={(e) => updateDraft({ videoUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            className="mt-2 w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all text-sm"
          />
        )}
      </div>

      {/* AI banner */}
      {canContinue && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl text-white animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Sparkles className="w-6 h-6 flex-shrink-0" />
          <p className="text-sm font-medium">
            Our AI will analyze your photos to auto-fill your listing details — saving you time!
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={back}
          className="px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
        >
          Back
        </button>
        <button
          onClick={next}
          disabled={!canContinue}
          className={cn(
            "flex-1 py-4 rounded-xl text-lg font-semibold transition-all duration-200",
            canContinue
              ? "bg-cyan-500 text-white hover:bg-cyan-600 active:scale-[0.98] shadow-lg shadow-cyan-200"
              : "bg-slate-200 text-slate-400 cursor-not-allowed",
          )}
        >
          Next: Let AI Handle the Details →
        </button>
      </div>
    </div>
  );
}
