"use client";

import { useEffect } from "react";

/**
 * Multi-layered DevTools detection + prevention.
 *
 * When DevTools is detected the page navigates away (or closes the tab),
 * making it impractical to inspect network requests, frames, or storage.
 *
 * Detection methods:
 *  1. debugger-timing: a `debugger` statement takes ~0 ms normally but
 *     pauses execution when DevTools is open.
 *  2. window-size delta: DevTools docked to any side widens the gap
 *     between outerWidth/Height and innerWidth/Height.
 *  3. console-probe: a getter on a logged object is invoked only when
 *     the Console panel renders it.
 *  4. Keyboard shortcut blocking (F12, Ctrl+Shift+I/J/C, Ctrl+U).
 *  5. Context-menu blocking (right-click).
 */
export default function DevToolsGuard() {
  useEffect(() => {
    /* ── Bail out during development ── */
    // Remove or comment this block if you want protection in dev too
    // if (process.env.NODE_ENV === "development") return;

    let detected = false;

    function onDetected() {
      if (detected) return;
      detected = true;
      // Try to close; if the browser blocks it, navigate away
      try {
        window.close();
      } catch {
        /* noop */
      }
      // Fallback: blank the page and redirect
      document.documentElement.innerHTML = "";
      window.location.replace("/");
    }

    /* ── 1. Debugger timing ── */
    const dbgInterval = setInterval(() => {
      const t0 = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      if (performance.now() - t0 > 100) {
        onDetected();
      }
    }, 1000);

    /* ── 2. Window-size delta ── */
    const sizeThreshold = 160; // px – DevTools usually adds ≥200 px
    const sizeInterval = setInterval(() => {
      const widthDelta = window.outerWidth - window.innerWidth;
      const heightDelta = window.outerHeight - window.innerHeight;
      if (widthDelta > sizeThreshold || heightDelta > sizeThreshold) {
        onDetected();
      }
    }, 800);

    /* ── 3. Console-probe (getter trick) ── */
    const probeInterval = setInterval(() => {
      const el = new Image();
      Object.defineProperty(el, "id", {
        get() {
          onDetected();
          return "";
        },
      });
      console.debug("%c", el as unknown as string);
    }, 2000);

    /* ── 4. Keyboard shortcuts ── */
    function blockKeys(e: KeyboardEvent) {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
      if (
        e.ctrlKey &&
        e.shiftKey &&
        ["I", "i", "J", "j", "C", "c"].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }

    /* ── 5. Context menu ── */
    function blockContextMenu(e: MouseEvent) {
      e.preventDefault();
    }

    document.addEventListener("keydown", blockKeys, true);
    document.addEventListener("contextmenu", blockContextMenu, true);

    return () => {
      clearInterval(dbgInterval);
      clearInterval(sizeInterval);
      clearInterval(probeInterval);
      document.removeEventListener("keydown", blockKeys, true);
      document.removeEventListener("contextmenu", blockContextMenu, true);
    };
  }, []);

  return null; // renders nothing
}
