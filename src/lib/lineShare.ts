/**
 * Share text+link to LINE. Tries the app URL scheme first (opens the
 * desktop or mobile LINE app directly if installed, with no separate web
 * login), then falls back to the line.me web/QR page if the app doesn't
 * take over within a short window.
 *
 * This handoff is inherently best-effort — browsers vary in how they deal
 * with custom protocols, and some will show a one-time "open LINE?"
 * permission prompt.
 */
export const openLineShare = (text: string) => {
  const encoded = encodeURIComponent(text);
  const appUrl = `line://msg/text/${encoded}`;
  const webUrl = `https://line.me/R/msg/text/?${encoded}`;

  let handedOff = false;
  const markHandedOff = () => {
    if (document.hidden) handedOff = true;
  };
  document.addEventListener("visibilitychange", markHandedOff);
  window.addEventListener("blur", markHandedOff, { once: true });

  window.location.href = appUrl;

  setTimeout(() => {
    document.removeEventListener("visibilitychange", markHandedOff);
    if (!handedOff) {
      window.open(webUrl, "_blank", "noopener");
    }
  }, 1200);
};
