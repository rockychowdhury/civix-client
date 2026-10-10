"use client";

import { CheckCircle, Eye, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
import { ADMIN_USER_STATUSES } from "@/constant/admin.constant";
import { useRestoreUser, useUpdateUserStatus } from "@/hooks";
import type { AdminUser } from "@/types";

interface UserContextMenuProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onViewDetails?: () => void;
  onRemove?: () => void;
}

/**
 * Cursor-anchored action bar — mirrors the department work-order table:
 * right-click a row and act in place (status, restore, remove).
 */
export function UserContextMenu({
  user,
  isOpen,
  onClose,
  position,
  onViewDetails,
  onRemove,
}: UserContextMenuProps) {
  const statusMutation = useUpdateUserStatus();
  const restoreMutation = useRestoreUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => !open && onClose()} modal={false}>
      {mounted && typeof document !== "undefined"
        ? createPortal(
            <DropdownMenuTrigger asChild>
              <div
                className="fixed z-50 pointer-events-none"
                style={{ left: position.x, top: position.y, width: 1, height: 1 }}
              />
            </DropdownMenuTrigger>,
            document.body,
          )
        : null}
      <DropdownMenuContent align="start" sideOffset={5} collisionPadding={10} className="w-56">
        <DropdownMenuLabel className="truncate font-mono text-xs">
          {user.displayName || user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            onViewDetails?.();
            onClose();
          }}
          className="cursor-pointer"
        >
          <Eye className="mr-2 h-4 w-4" />
          <span>View in sheet</span>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Set status</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            {ADMIN_USER_STATUSES.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() =>
                  statusMutation.mutate({ id: user.id, status }, { onSuccess: () => onClose() })
                }
                disabled={statusMutation.isPending || user.status?.toUpperCase() === status}
                className="cursor-pointer font-mono text-xs"
              >
                {status}
                {user.status?.toUpperCase() === status && (
                  <CheckCircle className="ml-auto h-4 w-4 opacity-50" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem
          onClick={() => restoreMutation.mutate(user.id, { onSuccess: () => onClose() })}
          disabled={restoreMutation.isPending}
          className="cursor-pointer"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          <span>Restore access</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            onRemove?.();
            onClose();
          }}
          className="cursor-pointer text-signal-open focus:text-signal-open"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Remove user</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
