import { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface FilterSidebarProps {
  children: ReactNode;
  trigger?: ReactNode;
}

export function FilterSidebar({ children, trigger }: FilterSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" className="h-10 px-4 flex items-center gap-2 border border-line bg-transparent hover:bg-ink/5 data-[state=open]:bg-ink data-[state=open]:text-paper data-[state=open]:border-ink transition-all duration-300 cursor-pointer">
            <Filter className="h-4 w-4" />
            <span className="font-display uppercase tracking-widest text-xs font-medium">Filters</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-paper border-l border-line p-0 flex flex-col">
        <SheetHeader className="p-6 border-b border-line/40">
          <SheetTitle className="font-display font-medium text-xl">Filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
