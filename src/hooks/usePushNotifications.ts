import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { notificationApi } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

type PushState = "unsupported" | "default" | "granted" | "denied";

function currentState(): PushState {
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
    return "unsupported";
  }
  return Notification.permission as PushState;
}

/**
 * Opt-in push notifications. Firebase is imported lazily here, only when the user
 * enables push (or has already granted permission), so it never slows the first load.
 */
export function usePushNotifications() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<PushState>(currentState);
  const [busy, setBusy] = useState(false);

  // Once granted, listen for foreground messages and refresh notification data.
  useEffect(() => {
    if (state !== "granted") return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    import("@/lib/firebase")
      .then(({ subscribeToForegroundMessages }) =>
        subscribeToForegroundMessages((payload) => {
          const title = payload.notification?.title ?? "Finot";
          const body = payload.notification?.body ?? "";
          toast(`${title}${body ? ` — ${body}` : ""}`);
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }),
      )
      .then((unsub) => {
        if (cancelled) unsub();
        else unsubscribe = unsub;
      })
      .catch(() => {
        /* push is optional */
      });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [state, queryClient]);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const { requestPushToken } = await import("@/lib/firebase");
      const token = await requestPushToken();
      setState(currentState());
      if (!token) {
        toast.error("Notifications were not enabled. Check your browser's site permissions.");
        return;
      }
      await notificationApi.registerDevice(token);
      toast.success("Push notifications enabled on this device.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not enable push notifications."));
    } finally {
      setBusy(false);
    }
  }, []);

  return { state, busy, enable };
}
