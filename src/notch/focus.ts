import { createStore } from "../lib/store";
import { onFocusExit, onFocusFromTray, setPassthrough, syncFocusTray } from "../platform/native";

/*
 * Focus mode: the notch stays visible but fully click-through, so clicks reach the
 * app below (e.g. browser tabs at the very top). Look: half transparent / dim.
 * In and out: three quick clicks/taps on the notch, or the tray menu.
 * Natively Rust counts the clicks, because the window no longer gets any while passthrough is true.
 */
export const focusMode = createStore(false, { persist: "focus-mode" });

/** This many quick clicks toggle it (like EXIT_CLICKS in hit_test.rs). */
export const FOCUS_CLICKS = 3;

export function setFocusMode(on: boolean) {
  focusMode.set(on);
}

let started = false;

export function startFocusMode() {
  if (started) return;
  started = true;
  // One source of truth: every change (clicks, settings, tray) reaches Rust and the tray check.
  const apply = () => {
    setPassthrough(focusMode.get());
    syncFocusTray(focusMode.get());
  };
  apply();
  focusMode.subscribe(apply);
  onFocusExit(() => setFocusMode(false));
  onFocusFromTray(setFocusMode);
}
