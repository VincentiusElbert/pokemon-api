import type { IndexEntry } from "../services/api";
import { displayName } from "./format";

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

// Classic edit distance, used to forgive typos like "pikchu" or "charmandr"
function levenshtein(a: string, b: string, max: number) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

// Ranks Pokémon for a query: exact number, name prefix, name contains, then close typos.
export function searchPokemon(entries: IndexEntry[], query: string, limit = Infinity): IndexEntry[] {
  const raw = query.trim().replace(/^#/, "");
  if (!raw) return entries.slice(0, limit);

  if (/^\d+$/.test(raw)) {
    const n = Number(raw);
    return entries
      .filter((e) => String(e.id).startsWith(String(n)))
      .sort((a, b) => (a.id === n ? -1 : b.id === n ? 1 : a.id - b.id))
      .slice(0, limit);
  }

  const q = normalize(raw);
  const scored: { entry: IndexEntry; score: number }[] = [];
  const typoBudget = q.length <= 4 ? 1 : 2;

  for (const entry of entries) {
    const name = normalize(displayName(entry.name));
    let score: number | null = null;
    if (name === q) score = 0;
    else if (name.startsWith(q)) score = 1;
    else if (name.includes(q)) score = 2;
    else {
      const distance = levenshtein(q, name.slice(0, q.length + 1), typoBudget);
      if (distance <= typoBudget) score = 3 + distance;
    }
    if (score !== null) scored.push({ entry, score });
  }

  return scored
    .sort((a, b) => a.score - b.score || a.entry.id - b.entry.id)
    .slice(0, limit)
    .map((s) => s.entry);
}
