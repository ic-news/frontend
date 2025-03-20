import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
export const getFirstNonZeroDecimalPosition = (num: number): number => {
  const decimalPart = String(num).split(".")[1];
  if (!decimalPart) return 2;
  for (let i = 0; i < decimalPart.length; i++) {
    if (decimalPart[i] !== "0") {
      return i + 2;
    }
  }
  return 2;
};
export function abbreviateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
}
