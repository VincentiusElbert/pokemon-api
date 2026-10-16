import { Heart, RotateCcw, SearchX, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Card, { CardSkeleton } from "../components/ui/Card";
import TypeBadge from "../components/ui/TypeBadge";
import { useFavorites } from "../hooks/use-favorites";
import { displayName } from "../lib/format";
import { searchPokemon } from "../lib/search";
import { GENERATIONS, TYPES } from "../lib/types";
import type { IndexEntry } from "../services/api";

export type Filters = {
  q: string;
  types: string[];
  gen: number | null;
  sort: "id-asc" | "id-desc" | "name-asc" | "name-desc";
  favorites: boolean;
};

const PAGE = 24;
// Auto-load while scrolling up to this many, then switch to the button so the footer stays reachable
const AUTO_LOAD_LIMIT = 96;

type Props = {
  entries: IndexEntry[] | null;
  error: Error | null;
  onRetry: () => void;
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
};

export const ListPokemon = ({ entries, error, onRetry, filters, onChange, onReset }: Props) => {
  const { favorites } = useFavorites();
  const [count, setCount] = useState(PAGE);
  const [showTypes, setShowTypes] = useState(filters.types.length > 0);
  const sentinel = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!entries) return [];
    const gen = GENERATIONS.find((g) => g.id === filters.gen);
    let list = entries.filter(
      (e) =>
        (!gen || (e.id >= gen.start && e.id <= gen.end)) &&
        filters.types.every((t) => e.types.includes(t as never)) &&
        (!filters.favorites || favorites.includes(e.id)),
    );
    // A search keeps relevance order; otherwise apply the chosen sort
    if (filters.q) return searchPokemon(list, filters.q);
    list = [...list];
    if (filters.sort === "id-desc") list.sort((a, b) => b.id - a.id);
    else if (filters.sort.startsWith("name")) {
      list.sort((a, b) => displayName(a.name).localeCompare(displayName(b.name)));
      if (filters.sort === "name-desc") list.reverse();
    }
    return list;
  }, [entries, filters, favorites]);

  // Start from the first page whenever the filters change
  useEffect(() => setCount(PAGE), [filters]);

  // Load the next page automatically when the bottom of the list scrolls into view
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setCount((c) => (c < AUTO_LOAD_LIMIT ? Math.min(c + PAGE, results.length) : c)),
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [results.length]);

  const visible = results.slice(0, count);
  const active = filters.q || filters.types.length || filters.gen || filters.favorites || filters.sort !== "id-asc";

  const toggleType = (type: string) => {
    const has = filters.types.includes(type);
    // Pokémon have at most two types, so keep the two most recent picks
    const next = has ? filters.types.filter((t) => t !== type) : [...filters.types, type].slice(-2);
    onChange({ types: next });
  };

  return (
    <div className="custom-container" id="pokemon-list">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-display-xs font-bold text-neutral-900 md:text-display-md">
            {filters.q ? `Results for “${filters.q}”` : filters.favorites ? "Your favorites" : "All Pokémon"}
          </h2>
          <p className="text-sm text-neutral-500">
            {entries ? `${results.length.toLocaleString("en-US")} Pokémon` : "Loading the Pokédex…"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTypes((s) => !s)}
            aria-expanded={showTypes}
            className={`flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
              filters.types.length ? "border-secondary-300 bg-secondary-100 text-secondary-400" : "border-neutral-300 text-neutral-700 hover:border-neutral-400"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Types{filters.types.length ? ` (${filters.types.length})` : ""}
          </button>

          <select
            aria-label="Generation"
            value={filters.gen ?? ""}
            onChange={(e) => onChange({ gen: e.target.value ? Number(e.target.value) : null })}
            className="h-10 cursor-pointer rounded-full border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:border-neutral-400"
          >
            <option value="">All generations</option>
            {GENERATIONS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label} · {g.region}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort"
            value={filters.sort}
            onChange={(e) => onChange({ sort: e.target.value as Filters["sort"] })}
            disabled={!!filters.q}
            title={filters.q ? "Search results are sorted by relevance" : undefined}
            className="h-10 cursor-pointer rounded-full border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:border-neutral-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="id-asc">Lowest number</option>
            <option value="id-desc">Highest number</option>
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
          </select>

          <button
            type="button"
            onClick={() => onChange({ favorites: !filters.favorites })}
            aria-pressed={filters.favorites}
            className={`flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
              filters.favorites ? "border-accent-red bg-red-50 text-accent-red" : "border-neutral-300 text-neutral-700 hover:border-neutral-400"
            }`}
          >
            <Heart className={`h-4 w-4 ${filters.favorites ? "fill-accent-red" : ""}`} />
            Favorites{favorites.length ? ` (${favorites.length})` : ""}
          </button>

          {active && (
            <button
              type="button"
              onClick={onReset}
              className="flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm text-neutral-500 hover:text-neutral-900"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          )}
        </div>
      </div>

      {showTypes && (
        <div className="mt-4 flex flex-wrap gap-2 rounded-3xl bg-neutral-50 p-4 animate-[fade-up_0.25s_ease-out_both]">
          {TYPES.map((t) => (
            <TypeBadge key={t} type={t} active={filters.types.includes(t)} onClick={() => toggleType(t)} />
          ))}
          <p className="w-full pt-1 text-xs text-neutral-500">Pick up to two types to find dual-type Pokémon, e.g. Fire + Flying.</p>
        </div>
      )}

      {error ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="font-semibold text-neutral-900">Couldn’t load the Pokédex.</p>
          <p className="text-sm text-neutral-500">Check your connection and try again.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 cursor-pointer rounded-full bg-secondary-300 px-6 py-2.5 font-semibold text-white hover:bg-secondary-400"
          >
            Try again
          </button>
        </div>
      ) : !entries ? (
        <div className="grid grid-cols-2 gap-4 pt-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <SearchX className="h-10 w-10 text-neutral-400" />
          <p className="font-semibold text-neutral-900">No Pokémon match these filters.</p>
          <p className="text-sm text-neutral-500">
            {filters.favorites && favorites.length === 0
              ? "Tap the heart on any Pokémon to save it here."
              : "Try another name or remove a filter."}
          </p>
          <button type="button" onClick={onReset} className="mt-2 cursor-pointer text-sm font-semibold text-secondary-300 hover:underline">
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((p) => (
            <Card key={p.id} id={p.id} name={p.name} types={p.types} />
          ))}
        </div>
      )}

      {visible.length < results.length && (
        <div ref={sentinel} className="flex justify-center pt-8">
          <button
            type="button"
            onClick={() => setCount((c) => c + PAGE)}
            className="h-12 cursor-pointer rounded-full border border-neutral-300 px-10 font-medium text-neutral-900 hover:border-neutral-400"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};
