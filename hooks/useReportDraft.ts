import { useEffect, useState } from "react";
import type { ICreateServiceRequestPayload } from "@/lib/validations/report";

const DRAFT_KEY = "civix_report_draft";

export function useReportDraft() {
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (Object.keys(parsed).length > 0) {
          setHasDraft(true);
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
  }, []);

  const saveDraft = (data: Partial<ICreateServiceRequestPayload>) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  };

  const loadDraft = (): Partial<ICreateServiceRequestPayload> | null => {
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
