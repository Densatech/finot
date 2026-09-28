import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import type { ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const SIZES = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

/** Accessible modal (focus trap, Escape to close) with a smooth scale/fade transition. */
export default function Modal({ open, onClose, title, children, footer, size = "md" }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-foreground/40 transition-opacity duration-200 ease-out data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className={`flex max-h-[90vh] w-full ${SIZES[size]} flex-col rounded-2xl bg-card shadow-elevated transition duration-200 ease-out data-[closed]:translate-y-2 data-[closed]:scale-95 data-[closed]:opacity-0`}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <DialogTitle className="text-base font-semibold text-foreground">{title}</DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
