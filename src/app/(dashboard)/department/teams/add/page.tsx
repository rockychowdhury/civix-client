"use client";

import { AddTeamForm } from "@/components/form/add-team-form";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AddTeamPage() {
  return (
    <div className="flex flex-col items-center pb-24 w-full">
      <div className="w-full max-w-2xl flex flex-col gap-8 pt-4">
        <Link href="/department/teams" className="w-fit">
          <Button
            variant="ghost"
            className="pl-0 h-auto hover:bg-transparent text-ink/40 hover:text-ink font-body transition-colors mb-2 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Teams
          </Button>
        </Link>

        <div className="bg-ledger/10 border border-ledger/20 p-4 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-ledger shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <h3 className="font-display font-medium text-ink">Team Management</h3>
            <p className="font-body text-sm text-ink/60">
              Teams allow you to group technicians together under a leader for bulk dispatching and
              geographic assignment.
            </p>
          </div>
        </div>

        <div className="bg-paper border border-line/10 p-8 sm:p-10 rounded-2xl shadow-sm mt-4">
          <AddTeamForm />
        </div>
      </div>
    </div>
  );
}
