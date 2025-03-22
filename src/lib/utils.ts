import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FirestoreTimestamp {
  _seconds: number;
  _nanoseconds: number;
  toDate?: () => Date;
}

export function parseDate(
  dateInput: FirestoreTimestamp | Date | number | string | null,
): Date | null {
  if (!dateInput) return null;
  if (
    typeof dateInput === "object" &&
    "toDate" in dateInput &&
    typeof dateInput.toDate === "function"
  ) {
    return dateInput.toDate();
  }
  if (typeof dateInput === "object" && "_seconds" in dateInput) {
    return new Date((dateInput as FirestoreTimestamp)._seconds * 1000);
  }
  return new Date(dateInput);
}
