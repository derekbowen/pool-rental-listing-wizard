import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { ListingDraft } from "@/lib/types";
import { DEFAULT_DRAFT } from "@/lib/types";

type Page = "wizard" | "product" | "cards";

interface ListingContextValue {
  step: number;
  setStep: (s: number) => void;
  next: () => void;
  back: () => void;
  draft: ListingDraft;
  updateDraft: (partial: Partial<ListingDraft>) => void;
  updatePublicData: (partial: Partial<ListingDraft["publicData"]>) => void;
  updatePricing: (partial: Partial<ListingDraft["pricing"]>) => void;
  updateLocation: (partial: Partial<ListingDraft["location"]>) => void;
  updateAvailability: (partial: Partial<ListingDraft["availability"]>) => void;
  aiCompleted: boolean;
  setAiCompleted: (v: boolean) => void;
  page: Page;
  setPage: (p: Page) => void;
}

const ListingContext = createContext<ListingContextValue | null>(null);

const STORAGE_KEY = "prnm_listing_draft";

function loadDraft(): ListingDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Deep-merge nested objects so new fields in defaults aren't lost
      return {
        ...DEFAULT_DRAFT,
        ...parsed,
        images: [],
        publicData: { ...DEFAULT_DRAFT.publicData, ...(parsed.publicData ?? {}) },
        location: { ...DEFAULT_DRAFT.location, ...(parsed.location ?? {}) },
        pricing: { ...DEFAULT_DRAFT.pricing, ...(parsed.pricing ?? {}) },
        availability: { ...DEFAULT_DRAFT.availability, ...(parsed.availability ?? {}), schedule: { ...DEFAULT_DRAFT.availability.schedule, ...(parsed.availability?.schedule ?? {}) } },
      };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_DRAFT };
}

export function ListingProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<ListingDraft>(loadDraft);
  const [aiCompleted, setAiCompleted] = useState(false);
  const [page, setPage] = useState<Page>("wizard");
  const autoSaveTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, 6)), []);
  const back = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);

  const updateDraft = useCallback(
    (partial: Partial<ListingDraft>) => setDraft((prev) => ({ ...prev, ...partial })),
    [],
  );

  const updatePublicData = useCallback(
    (partial: Partial<ListingDraft["publicData"]>) =>
      setDraft((prev) => ({
        ...prev,
        publicData: { ...prev.publicData, ...partial },
      })),
    [],
  );

  const updatePricing = useCallback(
    (partial: Partial<ListingDraft["pricing"]>) =>
      setDraft((prev) => ({
        ...prev,
        pricing: { ...prev.pricing, ...partial },
      })),
    [],
  );

  const updateLocation = useCallback(
    (partial: Partial<ListingDraft["location"]>) =>
      setDraft((prev) => ({
        ...prev,
        location: { ...prev.location, ...partial },
      })),
    [],
  );

  const updateAvailability = useCallback(
    (partial: Partial<ListingDraft["availability"]>) =>
      setDraft((prev) => ({
        ...prev,
        availability: { ...prev.availability, ...partial },
      })),
    [],
  );

  // Auto-save to localStorage every 10 seconds
  useEffect(() => {
    const save = () => {
      try {
        const { images, ...rest } = draft;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
      } catch {
        // ignore quota errors
      }
    };
    autoSaveTimer.current = setInterval(save, 10_000);
    return () => clearInterval(autoSaveTimer.current);
  }, [draft]);

  // Save on step change
  useEffect(() => {
    try {
      const { images, ...rest } = draft;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {
      // ignore
    }
  }, [step, draft]);

  // Debug helper — expose to console for testing
  useEffect(() => {
    (window as any).__wizard = { setStep, updateDraft, setAiCompleted };
  }, [setStep, updateDraft, setAiCompleted]);

  return (
    <ListingContext.Provider
      value={{
        step,
        setStep,
        next,
        back,
        draft,
        updateDraft,
        updatePublicData,
        updatePricing,
        updateLocation,
        updateAvailability,
        aiCompleted,
        setAiCompleted,
        page,
        setPage,
      }}
    >
      {children}
    </ListingContext.Provider>
  );
}

export function useListing() {
  const ctx = useContext(ListingContext);
  if (!ctx) throw new Error("useListing must be used within ListingProvider");
  return ctx;
}
