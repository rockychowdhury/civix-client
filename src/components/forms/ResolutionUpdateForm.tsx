"use client";

import { useState } from "react";
import { useSubmitResolution } from "@/hooks/work-order.hook";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Camera } from "lucide-react";

interface ResolutionUpdateFormProps {
  workOrderId: string;
}

export function ResolutionUpdateForm({ workOrderId }: ResolutionUpdateFormProps) {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const { mutate, isPending } = useSubmitResolution();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) return;

    mutate(
      { id: workOrderId, payload: { resolutionNotes } },
      {
        onSuccess: () => {
          toast.success("Work order resolved successfully");
        },
        onError: () => {
          toast.error("Failed to submit resolution");
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 border border-line rounded-lg bg-paper">
      <div className="flex flex-col gap-2">
        <h3 className="font-display font-medium text-lg text-ink">Resolution Notes</h3>
        <p className="text-sm text-ink/60">Required final summary of the work performed.</p>
        <Textarea
          required
          placeholder="Describe how the issue was resolved..."
          value={resolutionNotes}
          onChange={(e) => setResolutionNotes(e.target.value)}
          className="min-h-[120px] resize-none border-line focus-visible:ring-ledger bg-field/30 mt-2"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display font-medium text-lg text-ink">After Photos</h3>
        <p className="text-sm text-ink/60">Optional but recommended for verification.</p>
        <div className="mt-2 h-32 border-2 border-dashed border-line/50 rounded-lg flex flex-col items-center justify-center text-ink/40 bg-field/20 hover:bg-field/40 transition-colors cursor-pointer">
          <Camera className="h-6 w-6 mb-2 opacity-50" />
          <span className="text-sm font-medium">Tap to take a photo</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-line/20">
        <p className="text-xs text-ink/50 text-center uppercase tracking-wider">Are you sure? This cannot be undone from here.</p>
        <Button 
          type="submit" 
          size="lg"
          disabled={!resolutionNotes.trim() || isPending}
          className="w-full font-display text-base tracking-wide bg-ledger hover:bg-ledger/90 text-paper cursor-pointer h-14 rounded-full"
        >
          {isPending ? "Submitting..." : "Mark as Resolved"}
        </Button>
      </div>
    </form>
  );
}
