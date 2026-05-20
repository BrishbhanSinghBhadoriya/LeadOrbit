/** Strip to digits and + for tel: URLs (Windows Phone Link / mobile dialers). */
export function phoneToTelHref(phone: string | null | undefined): string | null {
  if (phone == null || !String(phone).trim()) return null;
  const cleaned = String(phone).replace(/[^\d+]/g, "");
  if (!cleaned.replace(/\+/g, "")) return null;
  return `tel:${cleaned}`;
}

/** Place a fixed box so (centerX, centerY) stays at its center, shifted only if it would clip. */
export function clampCenteredBoxPosition(
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  padding = 12
): { left: number; top: number } {
  const vw = typeof window === "undefined" ? 1920 : window.innerWidth;
  const vh = typeof window === "undefined" ? 1080 : window.innerHeight;
  let left = centerX - width / 2;
  let top = centerY - height / 2;
  left = Math.max(padding, Math.min(left, vw - width - padding));
  top = Math.max(padding, Math.min(top, vh - height - padding));
  return { left, top };
}
