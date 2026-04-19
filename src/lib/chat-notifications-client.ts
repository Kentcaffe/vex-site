const STORAGE_KEY = "vex-chat-notify-asked";

/** Titlu notificare aliniat cu limpa paginii (`<html lang>`), fără hook-uri next-intl. */
export function getChatNotificationTitleFromLocale(): string {
  if (typeof document === "undefined") {
    return "New message";
  }
  const lang = (document.documentElement.lang || (typeof navigator !== "undefined" ? navigator.language : "") || "en").toLowerCase();
  if (lang.startsWith("ro")) {
    return "Mesaj nou";
  }
  if (lang.startsWith("ru")) {
    return "Новое сообщение";
  }
  return "New message";
}

/**
 * Cere permisiunea pentru Notification API o singură dată per browser (flag în sessionStorage).
 */
export function requestChatNotificationPermission(): void {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return;
  }
  if (sessionStorage.getItem(STORAGE_KEY) === "1") {
    return;
  }
  if (Notification.permission !== "default") {
    sessionStorage.setItem(STORAGE_KEY, "1");
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, "1");
  void Notification.requestPermission().catch(() => {
    /* ignore */
  });
}

export function showNewChatMessageNotification(title: string, body: string): void {
  if (typeof window === "undefined" || typeof Notification === "undefined") {
    return;
  }
  if (Notification.permission !== "granted") {
    return;
  }
  try {
    new Notification(title, {
      body: body.length > 180 ? `${body.slice(0, 177)}…` : body,
      tag: "vex-chat-message",
    });
  } catch {
    /* ignore */
  }
}

let audioFallbackWarned = false;

/** MP3 primul (Safari/iOS); OGG rezervă pentru browsere care preferă fără MP3. */
const NOTIFICATION_SOUND_SOURCES = ["/notification.mp3", "/notification.ogg"] as const;

/**
 * Redă `public/notification.mp3` sau `notification.ogg`; dacă lipsesc sau `play()` eșuează → beep Web Audio.
 */
export function playIncomingChatSound(): void {
  if (typeof window === "undefined") {
    return;
  }
  const trySource = (index: number): void => {
    if (index >= NOTIFICATION_SOUND_SOURCES.length) {
      playBeepFallback();
      return;
    }
    try {
      const audio = new Audio(NOTIFICATION_SOUND_SOURCES[index]);
      audio.volume = 0.35;
      void audio.play().catch(() => trySource(index + 1));
    } catch {
      trySource(index + 1);
    }
  };

  trySource(0);
}

function playBeepFallback(): void {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) {
      return;
    }
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.value = 0.06;
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    osc.onended = () => {
      void ctx.close();
    };
  } catch {
    if (!audioFallbackWarned && process.env.NODE_ENV === "development") {
      audioFallbackWarned = true;
      console.warn("[chat] notification sound: add public/notification.ogg or notification.mp3");
    }
  }
}
