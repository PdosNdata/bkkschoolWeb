/**
 * Share text+link to LINE. Tries the app URL scheme first (opens the
 * desktop or mobile LINE app directly if installed, with no separate web
 * login), then falls back to the line.me web/QR page if the app doesn't
 * take over within a short window.
 *
 * This handoff is inherently best-effort — browsers vary in how they deal
 * with custom protocols, and some will show a one-time "open LINE?"
 * permission prompt.
 *
 * The desktop LINE app often opens without pre-filling the message, so the
 * text is also copied to the clipboard first — the user can just paste it
 * (Ctrl+V) into the chat. `onCopied` fires if the copy succeeded.
 */
export const openLineShare = (text: string, onCopied?: () => void) => {
  navigator.clipboard?.writeText(text).then(() => onCopied?.()).catch(() => {});

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
