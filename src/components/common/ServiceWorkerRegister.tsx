"use client";

import { useEffect } from "react";

// Registers the service worker (media caching) after the app is idle,
// so it never competes with critical resources on first load.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (e) {
        console.warn("SW registration failed", e);
      }
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(register);
    } else {
      setTimeout(register, 0);
    }
  }, []);

  return null;
}
