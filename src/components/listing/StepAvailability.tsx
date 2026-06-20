import { useState, useMemo, useCallback } from "react";
import { useListing } from "@/contexts/ListingContext";
import { cn } from "@/lib/utils";
import type { DayOfWeek, DaySchedule, DateOverride } from "@/lib/types";
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Timer,
  ShieldCheck,
  X,
  DollarSign,
  Ban,
  Zap,
} from "lucide-react";

const DAYS: DayOfWeek[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

const TIME_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const min = i % 2 === 0 ? "00" : "30";
  const h24 = `${String(hour).padStart(2, "0")}:${min}`;
  const ampm = hour < 12 ? "AM" : hour === 24 ? "AM" : "PM";
  const displayHour = hour === 0 || hour === 24 ? 12 : hour > 12 ? hour - 12 : hour;
  return { value: h24, label: `${displayHour}:${min} ${ampm}` };
});

// ---- Date Popover (Swimply-style bottom sheet for a tapped date) ----
function DatePopover({
  dateISO,
  override,
  basePrice,
  onUpdate,
  onClose,
}: {
  dateISO: string;
  override: DateOverride | undefined;
  basePrice: number;
  onUpdate: (dateISO: string, ov: DateOverride | null) => void;
  onClose: () => void;
}) {
  const dateLabel = new Date(dateISO + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
  });

  const isBlocked = override?.blocked ?? false;
  const customPrice = override?.pricePerHour ?? null;
  const [priceInput, setPriceInput] = useState(
    customPrice !== null ? String(customPrice / 100) : "",
  );
  const [note, setNote] = useState(override?.note ?? "");

  const handleSetPrice = () => {
    const cents = Math.round(parseFloat(priceInput) * 100);
    if (!isNaN(cents) && cents > 0) {
      onUpdate(dateISO, { ...override, pricePerHour: cents, blocked: false });
    }
  };

  const handleBlock = () => {
    onUpdate(dateISO, { ...override, blocked: true, pricePerHour: undefined });
  };

  const handleUnblock = () => {
    const next: DateOverride = { ...override, blocked: false };
    if (!next.pricePerHour && !next.note) {
      onUpdate(dateISO, null);
    } else {
      onUpdate(dateISO, next);
    }
  };

  const handleClearPrice = () => {
    setPriceInput("");
    const next: DateOverride = { ...override, pricePerHour: undefined };
    if (!next.blocked && !next.note) {
      onUpdate(dateISO, null);
    } else {
      onUpdate(dateISO, next);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Manage availability</h3>
            <p className="text-sm text-slate-500">{dateLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Block / Unblock */}
          <div className="space-y-2">
            {isBlocked ? (
              <button
                onClick={handleUnblock}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-red-200 bg-red-50 text-red-700 font-semibold transition-colors hover:bg-red-100"
              >
                <Ban className="w-5 h-5" />
                <div className="text-left">
                  <p className="text-sm font-semibold">Blocked</p>
                  <p className="text-xs font-normal text-red-500">
                    Tap to unblock this date
                  </p>
                </div>
              </button>
            ) : (
              <button
                onClick={handleBlock}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold transition-colors hover:border-red-300 hover:bg-red-50"
              >
                <Ban className="w-5 h-5 text-slate-400" />
                <div className="text-left">
                  <p className="text-sm font-semibold">Block entire date</p>
                  <p className="text-xs font-normal text-slate-400">
                    No bookings allowed
                  </p>
                </div>
              </button>
            )}
          </div>

          {/* Custom price */}
          {!isBlocked && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <DollarSign className="w-4 h-4 text-sky-600" />
                Custom price for this date
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder={String(basePrice / 100)}
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="w-full pl-7 pr-12 py-3 border border-slate-200 rounded-xl text-sm focus:border-sky-500 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    /hr
                  </span>
                </div>
                <button
                  onClick={handleSetPrice}
                  disabled={!priceInput || isNaN(parseFloat(priceInput))}
                  className="px-4 py-3 bg-sky-500 text-white rounded-xl font-semibold text-sm hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Set
                </button>
              </div>
              {customPrice !== null && (
                <div className="flex items-center justify-between px-3 py-2 bg-sky-50 rounded-lg">
                  <span className="text-xs text-sky-700">
                    Custom: <strong>${(customPrice / 100).toFixed(0)}/hr</strong>{" "}
                    (base: ${(basePrice / 100).toFixed(0)}/hr)
                  </span>
                  <button
                    onClick={handleClearPrice}
                    className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Note (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Holiday pricing, maintenance..."
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                onUpdate(dateISO, {
                  ...override,
                  note: e.target.value || undefined,
                });
              }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-sky-500 outline-none"
            />
          </div>
        </div>

        {/* Done */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Integrated Calendar ----
function AvailabilityCalendar({
  blockedDates,
  dateOverrides,
  basePrice,
  onToggleDate,
  onUpdateOverride,
  onSelectDate,
}: {
  blockedDates: string[];
  dateOverrides: Record<string, DateOverride>;
  basePrice: number;
  onToggleDate: (date: string) => void;
  onUpdateOverride: (date: string, ov: DateOverride | null) => void;
  onSelectDate: (date: string) => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const { year, month } = viewMonth;

  const daysInMonth = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const total = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    return cells;
  }, [year, month]);

  const monthLabel = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toISO = (day: number) => {
    const d = new Date(year, month, day);
    return d.toISOString().split("T")[0];
  };

  const prevMonth = () =>
    setViewMonth((v) =>
      v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 },
    );
  const nextMonth = () =>
    setViewMonth((v) =>
      v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 },
    );

  return (
    <div className="space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>
        <span className="text-base font-bold text-slate-800">{monthLabel}</span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <span key={d} className="text-xs font-semibold text-slate-400 py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;

          const iso = toISO(day);
          const isBlocked = blockedDates.includes(iso) || dateOverrides[iso]?.blocked;
          const override = dateOverrides[iso];
          const hasCustomPrice = override?.pricePerHour !== undefined && !isBlocked;
          const cellDate = new Date(year, month, day);
          const isPast = cellDate < today;
          const isToday = cellDate.getTime() === today.getTime();

          return (
            <button
              key={iso}
              onClick={() => !isPast && onSelectDate(iso)}
              disabled={isPast}
              className={cn(
                "relative w-full aspect-square rounded-xl text-sm font-medium transition-all duration-150 flex flex-col items-center justify-center gap-0.5",
                isPast && "text-slate-200 cursor-not-allowed",
                isToday && !isBlocked && !hasCustomPrice && "ring-2 ring-sky-400",
                !isPast && !isBlocked && !hasCustomPrice && "text-slate-700 hover:bg-sky-50",
                !isPast && isBlocked && "bg-red-50 text-red-400 ring-1 ring-red-200",
                !isPast && hasCustomPrice && "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
              )}
            >
              <span className={cn("text-sm", isBlocked && "line-through")}>{day}</span>
              {/* Price label under date number */}
              {!isPast && hasCustomPrice && override?.pricePerHour && (
                <span className="text-[9px] font-bold text-sky-600 leading-none">
                  ${(override.pricePerHour / 100).toFixed(0)}
                </span>
              )}
              {!isPast && !hasCustomPrice && !isBlocked && (
                <span className="text-[9px] text-slate-300 leading-none">
                  ${(basePrice / 100).toFixed(0)}
                </span>
              )}
              {!isPast && isBlocked && (
                <Ban className="w-2.5 h-2.5 text-red-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center pt-1">
        <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="w-3 h-3 rounded bg-sky-50 ring-1 ring-sky-200" />
          Custom price
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="w-3 h-3 rounded bg-red-50 ring-1 ring-red-200" />
          Blocked
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="w-3 h-3 rounded ring-2 ring-sky-400" />
          Today
        </span>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function StepAvailability() {
  const { draft, updateAvailability, next, back } = useListing();
  const { availability } = draft;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ---- Schedule helpers ----
  const toggleDay = (day: DayOfWeek) => {
    const updated = { ...availability.schedule };
    updated[day] = { ...updated[day], enabled: !updated[day].enabled };
    updateAvailability({ schedule: updated });
  };

  const updateDayTime = (day: DayOfWeek, field: "startTime" | "endTime", value: string) => {
    const updated = { ...availability.schedule };
    updated[day] = { ...updated[day], [field]: value };
    updateAvailability({ schedule: updated });
  };

  const applyPreset = (preset: "all" | "weekdays" | "weekends") => {
    const updated = { ...availability.schedule };
    for (const day of DAYS) {
      const isWeekend = day === "saturday" || day === "sunday";
      if (preset === "all") updated[day] = { ...updated[day], enabled: true };
      else if (preset === "weekdays") updated[day] = { ...updated[day], enabled: !isWeekend };
      else if (preset === "weekends") updated[day] = { ...updated[day], enabled: isWeekend };
    }
    updateAvailability({ schedule: updated });
  };

  // ---- Date overrides ----
  const handleUpdateOverride = useCallback(
    (dateISO: string, ov: DateOverride | null) => {
      const overrides = { ...availability.dateOverrides };
      if (ov === null) {
        delete overrides[dateISO];
      } else {
        overrides[dateISO] = ov;
      }
      // Sync blockedDates array for backward compat
      const blockedSet = new Set(availability.blockedDates);
      if (ov?.blocked) {
        blockedSet.add(dateISO);
      } else {
        blockedSet.delete(dateISO);
      }
      updateAvailability({
        dateOverrides: overrides,
        blockedDates: Array.from(blockedSet),
      });
    },
    [availability, updateAvailability],
  );

  const toggleBlockedDate = useCallback(
    (iso: string) => {
      const isBlocked = availability.blockedDates.includes(iso) || availability.dateOverrides[iso]?.blocked;
      handleUpdateOverride(iso, isBlocked ? null : { blocked: true });
    },
    [availability, handleUpdateOverride],
  );

  // Summary counts
  const blockedCount = availability.blockedDates.length;
  const customPriceCount = Object.values(availability.dateOverrides).filter(
    (o) => o.pricePerHour !== undefined && !o.blocked,
  ).length;

  return (
    <div className="py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-sky-900">Set your availability</h1>
        <p className="mt-2 text-slate-500">
          Manage your calendar, set custom daily pricing, and block dates.
        </p>
      </div>

      {/* 5A: Integrated Calendar */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-bold text-slate-800">Availability Calendar</h2>
        </div>
        <p className="text-sm text-slate-500">
          Tap any date to set custom pricing or block it out. Base rate:{" "}
          <strong className="text-sky-700">
            ${(draft.pricing.basePrice / 100).toFixed(0)}/hr
          </strong>
        </p>

        <div className="p-4 border border-slate-200 rounded-2xl bg-white">
          <AvailabilityCalendar
            blockedDates={availability.blockedDates}
            dateOverrides={availability.dateOverrides}
            basePrice={draft.pricing.basePrice}
            onToggleDate={toggleBlockedDate}
            onUpdateOverride={handleUpdateOverride}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* Summary chips */}
        {(blockedCount > 0 || customPriceCount > 0) && (
          <div className="flex flex-wrap gap-2">
            {blockedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-medium">
                <Ban className="w-3 h-3" />
                {blockedCount} blocked date{blockedCount > 1 ? "s" : ""}
              </span>
            )}
            {customPriceCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-600 rounded-full text-xs font-medium">
                <DollarSign className="w-3 h-3" />
                {customPriceCount} custom price{customPriceCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Overrides list */}
        {Object.keys(availability.dateOverrides).length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Date overrides
            </p>
            <div className="space-y-1">
              {Object.entries(availability.dateOverrides)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([iso, ov]) => (
                  <div
                    key={iso}
                    className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {ov.blocked ? (
                        <Ban className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <DollarSign className="w-3.5 h-3.5 text-sky-500" />
                      )}
                      <span className="text-sm text-slate-700">
                        {new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          weekday: "short",
                        })}
                      </span>
                      {ov.blocked && (
                        <span className="text-xs text-red-500 font-medium">Blocked</span>
                      )}
                      {ov.pricePerHour && !ov.blocked && (
                        <span className="text-xs text-sky-600 font-bold">
                          ${(ov.pricePerHour / 100).toFixed(0)}/hr
                        </span>
                      )}
                      {ov.note && (
                        <span className="text-xs text-slate-400 italic">— {ov.note}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleUpdateOverride(iso, null)}
                      className="text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>

      {/* 5B: Weekly Schedule */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg font-bold text-slate-800">Weekly Schedule</h2>
        </div>

        <div className="flex gap-2">
          {[
            { id: "all" as const, label: "Every Day" },
            { id: "weekdays" as const, label: "Weekdays Only" },
            { id: "weekends" as const, label: "Weekends Only" },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-slate-200 text-slate-600 hover:border-sky-300 hover:text-sky-600 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {DAYS.map((day) => {
            const sched: DaySchedule = availability.schedule[day];
            return (
              <div
                key={day}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
                  sched.enabled ? "border-sky-200 bg-sky-50/50" : "border-slate-100 bg-slate-50/50",
                )}
              >
                <button
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "w-12 text-sm font-bold transition-colors capitalize",
                    sched.enabled ? "text-sky-700" : "text-slate-300",
                  )}
                >
                  {DAY_LABELS[day]}
                </button>

                <button
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0",
                    sched.enabled ? "bg-sky-500" : "bg-slate-200",
                  )}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
                    style={{
                      left: sched.enabled ? "auto" : "2px",
                      right: sched.enabled ? "2px" : "auto",
                    }}
                  />
                </button>

                {sched.enabled ? (
                  <div className="flex items-center gap-1 flex-1">
                    <select
                      value={sched.startTime}
                      onChange={(e) => updateDayTime(day, "startTime", e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-sky-500 outline-none"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <span className="text-xs text-slate-400">to</span>
                    <select
                      value={sched.endTime}
                      onChange={(e) => updateDayTime(day, "endTime", e.target.value)}
                      className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-sky-500 outline-none"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-xs text-slate-300 italic">Unavailable</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5C: Booking Rules */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-800">Booking Rules</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">Min booking</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateAvailability({ minHours: Math.max(1, availability.minHours - 1) })}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-bold"
              >-</button>
              <span className="text-lg font-bold text-slate-800 w-8 text-center">{availability.minHours}</span>
              <button
                onClick={() => updateAvailability({ minHours: Math.min(availability.maxHours, availability.minHours + 1) })}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-bold"
              >+</button>
              <span className="text-xs text-slate-400">hours</span>
            </div>
          </div>

          <div className="p-3 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">Max booking</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateAvailability({ maxHours: Math.max(availability.minHours, availability.maxHours - 1) })}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-bold"
              >-</button>
              <span className="text-lg font-bold text-slate-800 w-8 text-center">{availability.maxHours}</span>
              <button
                onClick={() => updateAvailability({ maxHours: Math.min(24, availability.maxHours + 1) })}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-bold"
              >+</button>
              <span className="text-xs text-slate-400">hours</span>
            </div>
          </div>

          <div className="p-3 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">Buffer between bookings</span>
            </div>
            <select
              value={availability.bufferMinutes}
              onChange={(e) => updateAvailability({ bufferMinutes: Number(e.target.value) })}
              className="w-full text-sm bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-sky-500 outline-none"
            >
              <option value={0}>None</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          <div className="p-3 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">Advance notice</span>
            </div>
            <select
              value={availability.advanceNoticeDays}
              onChange={(e) => updateAvailability({ advanceNoticeDays: Number(e.target.value) })}
              className="w-full text-sm bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-sky-500 outline-none"
            >
              <option value={0}>Same day OK</option>
              <option value={1}>1 day before</option>
              <option value={2}>2 days before</option>
              <option value={3}>3 days before</option>
              <option value={7}>1 week before</option>
            </select>
          </div>
        </div>
      </section>

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
          className="flex-1 py-4 rounded-xl text-lg font-semibold bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.98] shadow-lg shadow-sky-200 transition-all duration-200"
        >
          Review & Publish →
        </button>
      </div>

      {/* Date Popover */}
      {selectedDate && (
        <DatePopover
          dateISO={selectedDate}
          override={availability.dateOverrides[selectedDate]}
          basePrice={draft.pricing.basePrice}
          onUpdate={handleUpdateOverride}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
