import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Star,
  MapPin,
  Heart,
  Zap,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

interface ListingCardProps {
  title: string;
  coverPhotos: string[];
  pricePerHour: number; // cents
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  distance?: string; // e.g. "2.3 mi"
  location?: string;
  maxGuests?: number;
  instantBooking?: boolean;
  category?: string;
  onClick?: () => void;
}

export default function ListingCard({
  title,
  coverPhotos,
  pricePerHour,
  rating,
  reviewCount,
  isNew,
  distance,
  location,
  maxGuests,
  instantBooking,
  category,
  onClick,
}: ListingCardProps) {
  const [liked, setLiked] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  const hasMultiple = coverPhotos.length > 1;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300"
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {coverPhotos.length > 0 ? (
          <img
            src={coverPhotos[photoIdx]}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">
            No photos
          </div>
        )}

        {/* Price badge — bottom left (Swimply-style teal) */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-cyan-600 rounded-lg shadow-md">
          <span className="text-white font-bold text-sm">
            ${(pricePerHour / 100).toFixed(0)}
          </span>
        </div>

        {/* Distance badge — top left */}
        {distance && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
            <MapPin className="w-3 h-3 text-cyan-600" />
            <span className="text-xs font-semibold text-slate-700">
              {distance}
            </span>
          </div>
        )}

        {/* Heart — top right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <Heart
            className={cn(
              "w-4.5 h-4.5 transition-colors",
              liked ? "fill-red-500 text-red-500" : "text-slate-600",
            )}
          />
        </button>

        {/* Instant Book badge — top right below heart */}
        {instantBooking && (
          <div className="absolute top-14 right-3 flex items-center gap-1 px-2 py-1 bg-emerald-500/90 backdrop-blur-sm rounded-full">
            <Zap className="w-3 h-3 text-white" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wide">
              Instant
            </span>
          </div>
        )}

        {/* Photo carousel arrows (on hover) */}
        {hasMultiple && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPhotoIdx((i) => (i === 0 ? coverPhotos.length - 1 : i - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPhotoIdx((i) => (i === coverPhotos.length - 1 ? 0 : i + 1));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </>
        )}

        {/* Dots */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {coverPhotos.slice(0, 5).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i === photoIdx ? "bg-white w-3" : "bg-white/50",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3 space-y-1.5">
        {/* Title + rating row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
            {title || "Untitled"}
          </h3>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-slate-700">
              {isNew ? "New" : rating?.toFixed(1) || "—"}
            </span>
            {!isNew && reviewCount !== undefined && (
              <span className="text-xs text-slate-400">({reviewCount})</span>
            )}
          </div>
        </div>

        {/* Location */}
        {location && (
          <p className="text-xs text-slate-400 line-clamp-1">{location}</p>
        )}

        {/* Tags row */}
        <div className="flex items-center gap-2 pt-0.5">
          {category && (
            <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full text-[10px] font-semibold">
              {category}
            </span>
          )}
          {maxGuests && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              <Users className="w-3 h-3" />
              {maxGuests}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
