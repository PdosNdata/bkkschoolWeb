import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Race a promise against a timeout so a stuck network call (bad session
 * token, dropped connection, ...) can never hang a form forever — it
 * rejects with `label` in the message instead, letting the caller's
 * catch/finally run and re-enable the UI.
 */
export function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง`));
    }, ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}
