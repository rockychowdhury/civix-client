import { AddStaffForm } from "@/components/form/add-staff-form";
import { ChevronLeft, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AddStaffPage() {
  return (
    <div className="flex flex-col items-center pb-24 w-full">
      <div className="w-full max-w-2xl flex flex-col gap-8 pt-4">
        <Link href="/department/technicians" className="w-fit">
          <Button variant="ghost" className="pl-0 h-auto hover:bg-transparent text-ink/40 hover:text-ink font-body transition-colors mb-2 cursor-pointer">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Directory
          </Button>
        </Link>
        
        <div className="bg-signal-progress/10 border border-signal-progress/20 p-4 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-signal-progress shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <h3 className="font-display font-medium text-ink">Manager Approval Required</h3>
            <p className="font-body text-sm text-ink/60">
              The staff profile will be created immediately, but their access to the department portal will remain pending until a manager reviews and activates the account.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <AddStaffForm />
        </div>
      </div>
    </div>
  );
}
