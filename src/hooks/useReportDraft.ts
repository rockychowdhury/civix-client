import { useState } from "react";
import type { ICreateServiceRequestPayload } from "@/validation";

const DRAFT_KEY = "civix_report_draft";

export function useReportDraft() {
  const [hasDraft, setHasDraft] = useState(() => {
    if (typeof window === "undefined") return false;
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed && typeof parsed === "object") {
          if (parsed.values && Object.keys(parsed.values).length > 0) {
            return true;
          }
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
    return false;
  });

  const saveDraft = (data: Partial<ICreateServiceRequestPayload>, step: number) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ values: data, step }));
  };

  const loadDraft = (): { values: Partial<ICreateServiceRequestPayload>; step: number } | null => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (!draft) return null;
    try {
      return JSON.parse(draft);
    } catch {
      return null;
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  };

  return { hasDraft, saveDraft, loadDraft, clearDraft };
}
