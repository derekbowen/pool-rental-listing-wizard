// @ts-nocheck — uses the runtime-loaded Google Maps global (`google.maps.*`); no @types/google.maps installed.
import { useEffect, useRef, useState } from "react";
import { MapPin, Lock, Search } from "lucide-react";

interface AddressResult {
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onChange: (result: AddressResult) => void;
  onRawChange: (value: string) => void;
}

export default function AddressAutocomplete({ value, onChange, onRawChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        await google.maps.importLibrary("places");
        if (cancelled || !inputRef.current) return;
        const ac = new google.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          componentRestrictions: { country: "us" },
          fields: ["address_components", "geometry", "formatted_address"],
        });
        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          if (!place.geometry?.location) return;

          let city = "", state = "", zip = "";
          for (const c of place.address_components ?? []) {
            if (c.types.includes("locality")) city = c.long_name;
            if (c.types.includes("administrative_area_level_1")) state = c.short_name;
            if (c.types.includes("postal_code")) zip = c.short_name;
          }

          onChange({
            address: place.formatted_address ?? "",
            city,
            state,
            zip,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
        });
        autocompleteRef.current = ac;
        setIsLoaded(true);
      } catch {
        // Google Maps not available — plain text input fallback
      }
    }
    init();
    return () => { cancelled = true; };
  }, [onChange]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onRawChange(e.target.value)}
          placeholder="Start typing your address..."
          className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all text-sm"
        />
      </div>
      {!isLoaded && (
        <p className="text-xs text-slate-400">
          Type your full address manually
        </p>
      )}
    </div>
  );
}

export function LocationMapPreview({ lat, lng, city, state }: { lat: number | null; lng: number | null; city: string; state: string }) {
  if (!lat || !lng) return null;

  // Offset coords slightly so exact house isn't shown — ~0.002° ≈ 200m
  const blurLat = lat + 0.001;
  const blurLng = lng + 0.001;

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${blurLat},${blurLng}&zoom=14&size=600x200&scale=2&maptype=roadmap&style=feature:all|element:labels.text|visibility:on&key=${(window as any).__GOOGLE_MAPS_KEY || ""}`;

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-xl border border-slate-200">
        <img
          src={mapUrl}
          alt={`Map of ${city}, ${state}`}
          className="w-full h-[140px] object-cover"
          style={{ filter: "blur(1px)" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-sky-600 text-white rounded-full p-2 shadow-lg">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Lock className="w-3 h-3" />
        <span>Exact address is only shared after booking is confirmed</span>
      </div>
    </div>
  );
}
