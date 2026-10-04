import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FileText, Flag, Link as LinkIcon, Edit2 } from "lucide-react";
import type { ServiceRequest } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ServiceRequestContextMenuProps {
  request: ServiceRequest | null;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onViewDetails?: () => void;
  onOpenReclassify?: () => void;
  onOpenLinkIssue?: () => void;
  onOpenFlagInvalid?: () => void;
}

export function ServiceRequestContextMenu({ 
  request, 
  isOpen, 
  onClose, 
  position, 
  onViewDetails,
  onOpenReclassify,
  onOpenLinkIssue,
  onOpenFlagInvalid
}: ServiceRequestContextMenuProps) {
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!request) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => !open && onClose()} modal={false}>
      {mounted && typeof document !== "undefined"
        ? createPortal(
            <DropdownMenuTrigger asChild>
              <div 
                className="fixed z-50 pointer-events-none"
                style={{ 
                  left: position.x, 
                  top: position.y,
                  width: 1, 
                  height: 1 
                }} 
              />
            </DropdownMenuTrigger>,
            document.body
          )
        : null}
      <DropdownMenuContent align="start" sideOffset={5} collisionPadding={10} className="w-56">
        <DropdownMenuLabel>Report {request.trackingNumber}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => {
            onViewDetails?.();
            onClose();
          }}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>View Full Report</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => {
            onOpenReclassify?.();
            onClose();
          }}
          className="cursor-pointer"
        >
          <Edit2 className="mr-2 h-4 w-4" />
          <span>Reclassify Category</span>
        </DropdownMenuItem>
        
        {(!request.linkedIssueId || request.needsReview) && (
          <DropdownMenuItem 
            onClick={() => {
              onOpenLinkIssue?.();
              onClose();
            }}
            className="cursor-pointer"
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            <span>Link to Issue</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => {
            onOpenFlagInvalid?.();
            onClose();
          }}
          className="cursor-pointer text-signal-open hover:text-signal-open focus:text-signal-open"
        >
          <Flag className="mr-2 h-4 w-4" />
          <span>Flag as Invalid</span>
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
