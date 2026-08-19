"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Wraps a route's content in a Dialog for the intercepted-route modal
 * pattern: the matching page under app/(app)/@modal/(.)... renders this
 * around its content, so navigating there from within the app shows it as
 * an overlay, while a direct URL/refresh still renders the plain page
 * (app/(app)/.../page.tsx) underneath it. Closing the dialog (backdrop,
 * Escape, the X button) calls router.back() to return to wherever the
 * modal was opened from, rather than navigating forward to some fixed URL.
 */
export function RouteModal({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <DialogContent className={className ?? "sm:max-w-xl"}>
        <DialogHeader>
          <DialogTitle className="text-display-xs font-bold">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
