import { useState, useMemo } from "react";
import { useListing } from "@/contexts/ListingContext";
import { cn } from "@/lib/utils";
import type { DayOfWeek, DaySchedule } from "@/lib/types";
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Timer,
  ShieldCheck,
  X,
} from "lucide-react";

const DAYS: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const TIME_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6; // 6:00 AM to 12:00 AM (midnight)
  const min = i % 2 === 0 ? "00" : "30";
  const h24 = `${String(hour).padStart(2, "0")}:${min}`;
  const ampm = hour < 12 ? "AM" : hour === 24 ? "AM" : "PM";
  const displayHour = hour === 0 || hour === 24 ? 12 : hour > 12 ? hour - 12 : hour;
  return { value: h24, label: `${displayHour}:${min} ${ampm}` };
});

// ---- Mini Calendar ----
function MiniCalendar({
  blockedDates,
  onToggleDate,
}: {
  blockedDates: string[];
  onToggleDate: (date: string) => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const { year, month } = viewMonth;

  const daysInMonth = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0=Sun
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

  const prevMonth = () => {
    setViewMonth((v) =>
      v.month === 0
        ? { year: v.year - 1, month: 11 }
        : { ...v, month: v.month - 1 },
    );
  };

  const nextMonth = () => {
    setViewMonth((v) =>
      v.month === 11
        ? { year: v.year + 1, month: 0 }
        : { ...v, month: v.month + 1 },
    );
  };

  return (
    <div className="space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {monthLabel}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <span key={d} className="text-xs font-medium text-slate-400 py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, i) => {
          if (day === null) return <div key={`blank-${i}`} />;

          const iso = toISO(day);
          const isBlocked = blockedDates.includes(iso);
          const cellDate = new Date(year, month, day);
          const isPast = cellDate < today;

          return (
            <button
              key={iso}
              onClick={() => !isPast && onToggleDate(iso)}
              disabled={isPast}
              className={cn(
                "w-full aspect-square rounded-lg text-sm font-medium transition-all duration-150 active:scale-90",
                isPast && "text-slate-200 cursor-not-allowed",
                !isPast && !isBlocked && "text-slate-700 hover:bg-cyan-50",
                !isPast && isBlocked && "bg-red-100 text-red-600 ring-1 ring-red-200",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {blockedDates.length > 0 && (
        <p className="text-xs text-slate-400 text-center">
          {blockedDates.length} date{blockedDates.length > 1 ? "s" : ""} blocked
        </p>
      )}
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function StepAvailability() {
  const { draft, updateAvailability, next, back } = useListing();
  const { availability } = draft;

  // ---- Schedule helpers ----
  const toggleDay = (day: DayOfWeek) => {
    const updated = { ...availability.schedule };
    updated[day] = { ...updated[day], enabled: !updated[day].enabled };
    updateAvailability({ schedule: updated });
  };

  const updateDayTime = (
    day: DayOfWeek,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    const updated = { ...availability.schedule };
    updated[day] = { ...updated[day], [field]: value };
    updateAvailability({ schedule: updated });
  };

  // ---- Quick presets ----
  const applyPreset = (preset: "all" | "weekdays" | "weekends") => {
    const updated = { ...availability.schedule };
    for (const day of DAYS) {
      const isWeekend = day === "saturday" || day === "sunday";
      if (preset === "all") updated[day] = { ...updated[day], enabled: true };
      else if (preset === "weekdays")
        updated[day] = { ...updated[day], enabled: !isWeekend };
      else if (preset === "weekends")
        updated[day] = { ...updated[day], enabled: isWeekend };
    }
    updateAvailability({ schedule: updated });
  };

  // ---- Blocked dates ----
  const toggleBlockedDate = (iso: string) => {
    const blocked = availability.blockedDates.includes(iso)
      ? availability.blockedDates.filter((d) => d !== iso)
      : [...availability.blockedDates, iso];
    updateAvailability({ blockedDates: blocked });
  };

  const removeBlockedDate = (iso: string) => {
    updateAvailability({
      blockedDates: availability.blockedDates.filter((d) => d !== iso),
    });
  };

  return (
    <div className="py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-cyan-900">
          Set your availability
        </h1>
        <p className="mt-2 text-slate-500">
          Tell guests when they can book your space.
        </p>
      </div>

      {/* 5A: Weekly Schedule */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-cyan-600" />
          <h2 className="text-lg font-bold text-slate-800">Weekly Schedule</h2>
        </div>

        {/* Quick presets */}
        <div className="flex gap-2">
          {[
            { id: "all" as const, label: "Every Day" },
            { id: "weekdays" as const, label: "Weekdays Only" },
            { id: "weekends" as const, label: "Weekends Only" },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-slate-200 text-slate-600 hover:border-cyan-300 hover:text-cyan-600 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Day rows */}
        <div className="space-y-2">
          {DAYS.map((day) => {
            const sched: DaySchedule = availability.schedule[day];
            return (
              <div
                key={day}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
                  sched.enabled
                    ? "border-cyan-200 bg-cyan-50/50"
                    : "border-slate-100 bg-slate-50/50",
                )}
              >
                {/* Toggle */}
                <button
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "w-12 text-sm font-bold transition-colors capitalize",
                    sched.enabled ? "text-cyan-700" : "text-slate-300",
                  )}
                >
                  {DAY_LABELS[day]}
                </button>

                {/* Toggle switch */}
                <button
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0",
                    sched.enabled ? "bg-cyan-500" : "bg-slate-200",
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

                {/* Time selectors */}
                {sched.enabled ? (
                  <div className="flex items-center gap-1 flex-1">
                    <select
                      value={sched.startTime}
                      onChange={(e) =>
                        updateDayTime(day, "startTime", e.target.value)
                      }
                      className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-cyan-500 outline-none"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-slate-400">to</span>
                    <select
                      value={sched.endTime}
                      onChange={(e) =>
                        updateDayTime(day, "endTime", e.target.value)
                      }
                      className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-cyan-500 outline-none"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className="text-xs text-slate-300 italic">
                    Unavailable
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5B: Block Specific Dates */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-bold text-slate-800">
            Block Specific Dates
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          Tap dates when you're unavailable (vacation, maintenance, etc.)
        </p>

        <div className="p-4 border border-slate-200 rounded-xl">
          <MiniCalendar
            blockedDates={availability.blockedDates}
            onToggleDate={toggleBlockedDate}
          />
        </div>

        {/* Blocked dates chips */}
        {availability.blockedDates.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {availability.blockedDates
              .sort()
              .map((iso) => (
                <span
                  key={iso}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium"
                >
                  {new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  <button
                    onClick={() => removeBlockedDate(iso)}
                    className="hover:text-red-800 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
          </div>
        )}
      </section>

      {/* 5C: Booking Rules */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-800">Booking Rules</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Min hours */}
          <div className="p-3 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">
                Min booking
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateAvailability({
                    minHours: Math.max(1, availability.minHours - 1),
                  })
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-bold"
              >
                -
              </button>
              <span className="text-lg font-bold text-slate-800 w-8 text-center">
                {availability.minHours}
              </span>
              <button
                onClick={() =>
                  updateAvailability({
                    minHours: Math.min(availability.maxHours, availability.minHours + 1),
                  })
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-bold"
              >
                +
              </button>
              <span className="text-xs text-slate-400">hours</span>
            </div>
          </div>

          {/* Max hours */}
          <div className="p-3 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">
                Max booking
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateAvailability({
                    maxHours: Math.max(availability.minHours, availability.maxHours - 1),
                  })
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-bold"
              >
                -
              </button>
              <span className="text-lg font-bold text-slate-800 w-8 text-center">
                {availability.maxHours}
              </span>
              <button
                onClick={() =>
                  updateAvailability({
                    maxHours: Math.min(24, availability.maxHours + 1),
                  })
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-bold"
              >
                +
              </button>
              <span className="text-xs text-slate-400">hours</span>
            </div>
          </div>

          {/* Buffer time */}
          <div className="p-3 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">
                Buffer between bookings
              </span>
            </div>
            <select
              value={availability.bufferMinutes}
              onChange={(e) =>
                updateAvailability({ bufferMinutes: Number(e.target.value) })
              }
              className="w-full text-sm bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-cyan-500 outline-none"
            >
              <option value={0}>None</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Advance notice */}
          <div className="p-3 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">
                Advance notice
              </span>
            </div>
            <select
              value={availability.advanceNoticeDays}
              onChange={(e) =>
                updateAvailability({
                  advanceNoticeDays: Number(e.target.value),
                })
              }
              className="w-full text-sm bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-cyan-500 outline-none"
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
          className="flex-1 py-4 rounded-xl text-lg font-semibold bg-cyan-500 text-white hover:bg-cyan-600 active:scale-[0.98] shadow-lg shadow-cyan-200 transition-all duration-200"
        >
          Review & Publish →
        </button>
      </div>
    </div>
  );
}
