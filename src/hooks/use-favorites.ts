import { useSyncExternalStore } from "react";

const KEY = "pokedex-favorites";
const listeners = new Set<() => void>();

function read(): number[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

let snapshot = read();

function write(next: number[]) {
  snapshot = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage unavailable, keep favorites in memory for this visit
  }
  listeners.forEach((l) => l());
}

// Favorites shared across every component and saved in the browser
export function useFavorites() {
  const favorites = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => snapshot,
  );

  const toggle = (id: number) =>
    write(favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id]);

  return { favorites, isFavorite: (id: number) => favorites.includes(id), toggle };
}
