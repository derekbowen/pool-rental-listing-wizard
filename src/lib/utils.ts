import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function to12h(time24: string): string {
  const [hStr, min] = time24.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h < 12 ? "AM" : h === 24 ? "AM" : "PM";
  if (h === 0 || h === 24) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${min} ${ampm}`;
}
