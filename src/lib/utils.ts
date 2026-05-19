import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const rarityColors = {
  common: "text-white border-white",
  uncommon: "text-green-400 border-green-400",
  rare: "text-blue-400 border-blue-400",
  epic: "text-purple-400 border-purple-400",
  legendary: "text-orange-400 border-orange-400",
};

export const rarityBgColors = {
  common: "bg-gray-700",
  uncommon: "bg-green-900/50",
  rare: "bg-blue-900/50",
  epic: "bg-purple-900/50",
  legendary: "bg-orange-900/50",
};
