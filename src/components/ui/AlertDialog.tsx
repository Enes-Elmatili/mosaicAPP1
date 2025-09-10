"useme"

import * as RadixAlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";
import { ReactNode } from "react";

export type AlertDialogVariant = "info" | "warning" | "error" | "success";

export type AlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  variant?: AlertDialogVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  icon?: ReactNode;
};

/**
 * AlertDialog — confirmations & erreurs critiques
 */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = "info",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  icon,
}: AlertDialogProps) {
  const variantColors: Record<AlertDialogVariant, string> = {
    info: "text-blue-600",
    success: "text-green-600",
    warning: "text-amber-600",
    error: "text-red-600",
  };

  return (
    <RadixAlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixAlertDialog.Portal>
        <RadixAlertDialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-fade-in" />
        <RadixAlertDialog.Content
          className={clsx(
            "fixed left-1/2 top-1/2 z-50 w-[95%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-slide-in",
            "flex flex-col gap-4"
          )}
        >
          <div className="flex items-start gap-3">
            {icon && <div className={clsx("text-xl", variantColors[variant])}>{icon}</div>}
            <div>
              <RadixAlertDialog.Title className="text-lg font-semibold text-neutral-900">
                {title}
              </RadixAlertDialog.Title>
              {description && (
                <RadixAlertDialog.Description className="mt-1 text-sm text-neutral-600">
                  {description}
                </RadixAlertDialog.Description>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <RadixAlertDialog.Cancel asChild>
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
              >
                {cancelLabel}
              </Button>
            </RadixAlertDialog.Cancel>
            <RadixAlertDialog.Action asChild>
              <Button
                type="button"
                variant={variant === "error" ? "destructive" : "primary"}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </RadixAlertDialog.Action>
          </div>
        </RadixAlertDialog.Content>
      </RadixAlertDialog.Portal>
    </RadixAlertDialog.Root>
  );
}
// Source: https://www.radix-ui.com/docs/primitives/components/alert-dialog
