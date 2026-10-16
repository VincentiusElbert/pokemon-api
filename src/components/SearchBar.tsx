import { Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { displayName, formatId, spriteUrl } from "../lib/format";
import { searchPokemon } from "../lib/search";
import type { IndexEntry } from "../services/api";
import TypeBadge from "./ui/TypeBadge";

type Props = {
  entries: IndexEntry[] | null;
  value: string;
  onSearch: (query: string) => void;
};

const SearchBar = ({ entries, value, onSearch }: Props) => {
  const navigate = useNavigate();
  const listId = useId();
  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapper = useRef<HTMLDivElement>(null);

  // Keep the input in sync when the query changes from outside (e.g. "Clear filters")
  useEffect(() => setText(value), [value]);

  const suggestions = useMemo(
    () => (entries && text.trim() ? searchPokemon(entries, text, 6) : []),
    [entries, text],
  );

  useEffect(() => {
    const close = (e: MouseEvent) => !wrapper.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const submit = () => {
    setOpen(false);
    onSearch(text.trim());
    document.getElementById("pokemon-list")?.scrollIntoView({ behavior: "smooth" });
  };

  const choose = (entry: IndexEntry) => {
    setOpen(false);
    navigate(`/pokemon/${entry.name}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && highlight >= 0 && suggestions[highlight]) choose(suggestions[highlight]);
      else submit();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && text.trim().length > 0;

  return (
    <div ref={wrapper} className="relative w-full max-w-xl">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setHighlight(-1);
            if (!e.target.value) onSearch("");
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search by name or number, e.g. Pikachu or 25"
          aria-label="Search Pokémon"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={highlight >= 0 ? `${listId}-${highlight}` : undefined}
          className="w-full rounded-full border border-neutral-300 bg-white py-4 pl-6 pr-24 text-neutral-800 shadow-lg placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:ring-secondary-300/30"
        />
        {text && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setText("");
              onSearch("");
            }}
            className="absolute right-14 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-secondary-300 transition hover:bg-secondary-400"
        >
          <Search className="h-5 w-5 text-white" />
        </button>
      </form>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-3xl border border-neutral-200 bg-white p-2 text-left shadow-2xl"
        >
          {!entries && <li className="px-4 py-3 text-sm text-neutral-500">Loading Pokédex…</li>}
          {entries && suggestions.length === 0 && (
            <li className="px-4 py-3 text-sm text-neutral-500">No Pokémon found for “{text}”.</li>
          )}
          {suggestions.map((entry, i) => (
            <li
              key={entry.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === highlight}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(entry);
              }}
              onMouseEnter={() => setHighlight(i)}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 ${
                i === highlight ? "bg-primary-100" : ""
              }`}
            >
              <img src={spriteUrl(entry.id)} alt="" className="h-12 w-12 [image-rendering:pixelated]" loading="lazy" />
              <div className="flex-1">
                <p className="font-semibold text-neutral-900">{displayName(entry.name)}</p>
                <p className="text-xs text-neutral-500">{formatId(entry.id)}</p>
              </div>
              <div className="flex gap-1">
                {entry.types.map((t) => (
                  <TypeBadge key={t} type={t} size="sm" />
                ))}
              </div>
            </li>
          ))}
          {entries && suggestions.length > 0 && (
            <li className="px-4 pb-1 pt-2 text-xs text-neutral-400">
              Press Enter to see all results · ↑↓ to choose
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
