import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import pokemonTitle from "../assets/pokemon-title.svg";
import SearchBar from "../components/SearchBar";
import { useAsync } from "../hooks/use-async";
import { getIndex } from "../services/api";
import Footer from "./footer";
import { ListPokemon, type Filters } from "./list-pokemon";
import Navbar from "./navbar";

const SORTS: Filters["sort"][] = ["id-asc", "id-desc", "name-asc", "name-desc"];

// Filters live in the URL, so a filtered view can be shared and survives the back button
function readFilters(params: URLSearchParams): Filters {
  const sort = params.get("sort") as Filters["sort"];
  const gen = Number(params.get("gen"));
  return {
    q: params.get("q") ?? "",
    types: params.get("type")?.split(",").filter(Boolean) ?? [],
    gen: gen >= 1 && gen <= 9 ? gen : null,
    sort: SORTS.includes(sort) ? sort : "id-asc",
    favorites: params.get("fav") === "1",
  };
}

const Home = () => {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);
  const index = useAsync(getIndex, []);

  const update = useCallback(
    (patch: Partial<Filters>) => {
      const next = { ...filters, ...patch };
      const p = new URLSearchParams();
      if (next.q) p.set("q", next.q);
      if (next.types.length) p.set("type", next.types.join(","));
      if (next.gen) p.set("gen", String(next.gen));
      if (next.sort !== "id-asc") p.set("sort", next.sort);
      if (next.favorites) p.set("fav", "1");
      setParams(p, { replace: true });
    },
    [filters, setParams],
  );

  const reset = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);

  return (
    <>
      {/* Hero */}
      <div
        className="relative bg-accent-yellow pb-52"
        style={{ backgroundImage: "url('/background-hero.png')", backgroundRepeat: "repeat" }}
      >
        <Navbar />

        <div className="mx-auto flex max-w-[686px] flex-col items-center justify-center gap-3.5 px-4 pt-36 text-center">
          <img src={pokemonTitle} alt="Pokémon" className="animate-[fade-up_0.5s_ease-out_both]" />
          <h1 className="animate-[fade-up_0.5s_0.1s_ease-out_both] text-display-sm font-bold text-neutral-900 md:text-display-2xl">
            Discover the Most Powerful Pokémon in the Wild!
          </h1>
          <p className="animate-[fade-up_0.5s_0.2s_ease-out_both] text-sm font-medium text-neutral-800 md:text-md">
            Search all {index.data ? index.data.entries.length.toLocaleString("en-US") : "1,025"} Pokémon by name,
            number or type.
          </p>
        </div>

        <div className="relative z-30 mt-10 flex justify-center px-4">
          <SearchBar entries={index.data?.entries ?? null} value={filters.q} onSearch={(q) => update({ q })} />
        </div>

        {/* Cloud + decorations */}
        <div className="pointer-events-none absolute bottom-0 left-0 z-10 w-full overflow-hidden">
          <img src="/cloud-1.png" alt="" className="w-full object-cover" />
          <img
            src="/pokemon-1.png"
            alt=""
            className="absolute bottom-0 -z-10 animate-[float_6s_ease-in-out_infinite]"
            style={{
              width: "clamp(10.06rem, 19.2vw, 17.38rem)",
              height: "clamp(10.06rem, 19.2vw, 17.38rem)",
              left: "clamp(1.19rem, 3.6vw, 3.19rem)",
            }}
          />
          <img
            src="/pokemon-2.png"
            alt=""
            className="absolute bottom-0 -z-10 animate-[float_6s_1.5s_ease-in-out_infinite]"
            style={{
              width: "clamp(10.06rem, 19.2vw, 17.38rem)",
              height: "clamp(10.06rem, 19.2vw, 17.38rem)",
              right: "clamp(1.19rem, 3.6vw, 3.19rem)",
            }}
          />
        </div>
      </div>

      {/* List */}
      <div className="relative z-20 bg-white px-4 pb-20 pt-8 md:px-10">
        <ListPokemon
          entries={index.data?.entries ?? null}
          error={index.error}
          onRetry={index.retry}
          filters={filters}
          onChange={update}
          onReset={reset}
        />
      </div>

      <Footer />
    </>
  );
};

export default Home;
