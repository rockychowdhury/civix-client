import { CheckCircle, FileText, History, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdateWorkOrderStatus } from "@/hooks/work-order.hook";
import type { WorkOrder } from "@/types";

const STATUSES = [
  "WORK_ORDER_CREATED",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING_VERIFICATION",
  "RESOLVED",
  "COMPLETED",
  "CANCELLED",
  "ON_HOLD",
];

interface WorkOrderContextMenuProps {
  workOrder: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onViewDetails?: () => void;
}

export function WorkOrderContextMenu({
  workOrder,
  isOpen,
  onClose,
  position,
  onViewDetails,
}: WorkOrderContextMenuProps) {
  const updateStatus = useUpdateWorkOrderStatus();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!workOrder) return null;

  const handleStatusChange = (newStatus: string) => {
    updateStatus.mutate(
      { id: workOrder.id, payload: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
          onClose();
        },
      },
    );
  };

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
                  height: 1,
                }}
              />
            </DropdownMenuTrigger>,
            document.body,
          )
        : null}
      <DropdownMenuContent align="start" sideOffset={5} collisionPadding={10} className="w-56">
        <DropdownMenuLabel>
          Work Order #{workOrder.id.split("-")[0].toUpperCase()}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            onViewDetails?.();
            onClose();
          }}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>View Details</span>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Update Status</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-56">
            {STATUSES.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={updateStatus.isPending || workOrder.status === status}
                className="cursor-pointer"
              >
                {status.replace(/_/g, " ")}
                {workOrder.status === status && (
                  <CheckCircle className="ml-auto h-4 w-4 opacity-50" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link
            href={`/department/work-orders/history?workOrderId=${workOrder.id}`}
            className="w-full"
          >
            <History className="mr-2 h-4 w-4" />
            <span>View Full History</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
