import { ArrowLeft, ChevronLeft, ChevronRight, Heart, Ruler, Sparkles, Volume2, Weight } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EvolutionTree from "../components/detail/EvolutionTree";
import MovesTable from "../components/detail/MovesTable";
import StatBars from "../components/detail/StatBars";
import TypeMatchups from "../components/detail/TypeMatchups";
import AbilityList from "../components/detail/AbilityList";
import TypeBadge from "../components/ui/TypeBadge";
import { useAsync } from "../hooks/use-async";
import { useFavorites } from "../hooks/use-favorites";
import { artworkUrl, displayName, formatHeight, formatId, formatWeight, titleCase } from "../lib/format";
import { MAX_POKEMON, typeColor } from "../lib/types";
import { getIndex, getPokemonDetail } from "../services/api";
import Footer from "./footer";
import Navbar from "./navbar";

const PokemonDetail = () => {
  const { pokemonName = "" } = useParams<{ pokemonName: string }>();
  const navigate = useNavigate();
  const { data: pokemon, error, loading, retry } = useAsync(() => getPokemonDetail(pokemonName), [pokemonName]);
  const { data: index } = useAsync(getIndex, []);
  const { isFavorite, toggle } = useFavorites();
  const [shiny, setShiny] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  const neighbor = (offset: number) => {
    if (!pokemon || !index) return null;
    const id = pokemon.id + offset;
    if (id < 1 || id > MAX_POKEMON) return null;
    return index.entries.find((e) => e.id === id) ?? null;
  };
  const prev = neighbor(-1);
  const next = neighbor(1);

  useEffect(() => {
    setShiny(false);
    window.scrollTo({ top: 0 });
  }, [pokemonName]);

  useEffect(() => {
    document.title = pokemon ? `${displayName(pokemon.name)} ${formatId(pokemon.id)} · Pokédex` : "Pokédex";
  }, [pokemon]);

  // ← and → jump to the previous / next Pokémon
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "ArrowLeft" && prev) navigate(`/pokemon/${prev.name}`);
      if (e.key === "ArrowRight" && next) navigate(`/pokemon/${next.name}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, navigate]);

  const playCry = () => {
    if (!pokemon?.cry) return;
    audio.current?.pause();
    audio.current = new Audio(pokemon.cry);
    audio.current.volume = 0.4;
    audio.current.play().catch(() => {});
  };

  if (error) {
    const notFound = error.message === "NOT_FOUND";
    return (
      <>
        <Navbar solid />
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-4 text-center">
          <img src={artworkUrl(54)} alt="" className="h-40 w-40 object-contain opacity-80" />
          <h1 className="text-display-xs font-bold text-neutral-900">
            {notFound ? `“${pokemonName}” isn’t in the Pokédex` : "Couldn’t load this Pokémon"}
          </h1>
          <p className="text-neutral-500">{notFound ? "Check the spelling or search for it." : "Check your connection and try again."}</p>
          <div className="mt-2 flex gap-3">
            {!notFound && (
              <button type="button" onClick={retry} className="cursor-pointer rounded-full bg-secondary-300 px-6 py-2.5 font-semibold text-white">
                Try again
              </button>
            )}
            <Link to="/" className="rounded-full border border-neutral-300 px-6 py-2.5 font-semibold text-neutral-900">
              Back to Pokédex
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (loading || !pokemon) return <DetailSkeleton />;

  const tint = typeColor(pokemon.types[0]);
  const favorite = isFavorite(pokemon.id);
  const femalePct = pokemon.genderRate < 0 ? null : (pokemon.genderRate / 8) * 100;

  return (
    <>
      <Navbar solid />

      {/* Header band tinted with the primary type */}
      <section className="relative overflow-hidden pb-10 pt-24" style={{ backgroundColor: tint.soft }}>
        <svg viewBox="0 0 24 24" className="absolute -right-24 -top-10 h-[28rem] w-[28rem] opacity-10" style={{ fill: tint.bg }} aria-hidden>
          <path d="M21.95 11h-3.021A6.988 6.988 0 0012 6a6.988 6.988 0 00-6.929 5H2.05a10.005 10.005 0 0119.9 0zM2.05 13h3.021A6.988 6.988 0 0012 18a6.988 6.988 0 006.929-5h3.021a10.005 10.005 0 01-19.9 0zM12 9a3 3 0 100 6 3 3 0 000-6z" />
        </svg>

        <div className="relative mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-neutral-800 backdrop-blur hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex gap-2">
              <NeighborLink entry={prev} direction="prev" />
              <NeighborLink entry={next} direction="next" />
            </div>
          </div>

          <div className="mt-6 grid items-center gap-8 md:grid-cols-2">
            <div className="relative flex justify-center">
              <div className="absolute inset-0 m-auto h-64 w-64 rounded-full opacity-30 blur-3xl md:h-80 md:w-80" style={{ backgroundColor: tint.bg }} />
              <img
                key={`${pokemon.id}-${shiny}`}
                src={artworkUrl(pokemon.id, shiny)}
                alt={`${displayName(pokemon.name)}${shiny ? " (shiny)" : ""}`}
                className="relative h-64 w-64 animate-[pop-in_0.45s_ease-out_both] object-contain drop-shadow-2xl md:h-80 md:w-80"
              />
            </div>

            <div className="animate-[fade-up_0.4s_ease-out_both]">
              <p className="text-lg font-semibold text-neutral-500">{formatId(pokemon.id)}</p>
              <h1 className="text-display-md font-bold text-neutral-900 md:text-display-xl">{displayName(pokemon.name)}</h1>
              <p className="text-neutral-600">{pokemon.genus}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {pokemon.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
                {pokemon.legendary && <span className="rounded-full bg-primary-300 px-3 py-1 text-sm font-semibold text-neutral-900">Legendary</span>}
                {pokemon.mythical && <span className="rounded-full bg-neutral-900 px-3 py-1 text-sm font-semibold text-white">Mythical</span>}
              </div>

              <p className="mt-4 max-w-lg leading-relaxed text-neutral-700">{pokemon.description}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <ActionButton onClick={() => setShiny((s) => !s)} active={shiny} icon={<Sparkles className="h-4 w-4" />}>
                  {shiny ? "Shiny" : "Show shiny"}
                </ActionButton>
                {pokemon.cry && (
                  <ActionButton onClick={playCry} icon={<Volume2 className="h-4 w-4" />}>
                    Play cry
                  </ActionButton>
                )}
                <ActionButton
                  onClick={() => toggle(pokemon.id)}
                  active={favorite}
                  icon={<Heart className={`h-4 w-4 ${favorite ? "fill-accent-red text-accent-red" : ""}`} />}
                >
                  {favorite ? "Favorite" : "Add to favorites"}
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-10 md:px-6 lg:grid-cols-3">
        {/* About */}
        <Panel title="About" className="lg:col-span-1">
          <div className="grid grid-cols-2 gap-3">
            <InfoTile icon={<Weight className="h-4 w-4" />} label="Weight" value={formatWeight(pokemon.weight)} />
            <InfoTile icon={<Ruler className="h-4 w-4" />} label="Height" value={formatHeight(pokemon.height)} />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-neutral-500">Gender</p>
            {femalePct === null ? (
              <p className="text-sm font-semibold text-neutral-800">Genderless</p>
            ) : (
              <>
                <div className="flex h-2.5 overflow-hidden rounded-full bg-neutral-100">
                  <div className="bg-sky-500" style={{ width: `${100 - femalePct}%` }} />
                  <div className="bg-pink-400" style={{ width: `${femalePct}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between text-xs font-medium">
                  <span className="text-sky-600">♂ {100 - femalePct}%</span>
                  <span className="text-pink-500">♀ {femalePct}%</span>
                </div>
              </>
            )}
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Fact label="Generation" value={`Gen ${pokemon.generation.split("-")[1]?.toUpperCase() ?? "?"}`} />
            <Fact label="Catch rate" value={`${pokemon.captureRate} / 255`} />
            <Fact label="Egg groups" value={pokemon.eggGroups.map(titleCase).join(", ") || "-"} />
            <Fact label="Base friendship" value={pokemon.baseHappiness ?? "-"} />
            {pokemon.baseExperience !== null && <Fact label="Base exp." value={pokemon.baseExperience} />}
          </dl>
        </Panel>

        <Panel title="Base stats" className="lg:col-span-2">
          <StatBars stats={pokemon.stats} accent={tint.bg} />
        </Panel>

        <Panel title="Abilities" className="lg:col-span-1">
          <AbilityList abilities={pokemon.abilities} />
        </Panel>

        <Panel title="Type matchups" className="lg:col-span-2">
          {index ? <TypeMatchups types={pokemon.types} relations={index.relations} /> : <p className="text-sm text-neutral-500">Loading…</p>}
        </Panel>

        <Panel title="Evolution" className="lg:col-span-3">
          {pokemon.evolution ? <EvolutionTree root={pokemon.evolution} currentId={pokemon.id} /> : <p className="text-sm text-neutral-500">No evolution data.</p>}
        </Panel>

        <Panel title="Level-up moves" className="lg:col-span-3">
          <MovesTable moves={pokemon.moves} />
        </Panel>
      </main>

      <Footer />
    </>
  );
};

function NeighborLink({ entry, direction }: { entry: { id: number; name: string } | null; direction: "prev" | "next" }) {
  if (!entry) return <span className="w-10" />;
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <Link
      to={`/pokemon/${entry.name}`}
      aria-label={`${direction === "prev" ? "Previous" : "Next"}: ${displayName(entry.name)}`}
      className={`flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-2 text-sm font-medium text-neutral-800 backdrop-blur hover:bg-white ${
        direction === "next" ? "flex-row-reverse" : ""
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">
        <span className="text-neutral-500">{formatId(entry.id)}</span> {displayName(entry.name)}
      </span>
    </Link>
  );
}

function ActionButton({
  children,
  onClick,
  icon,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  icon: ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95 ${
        active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function Panel({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    // min-w-0 lets wide content (moves table, evolution tree) scroll inside the panel instead of stretching the grid
    <section className={`min-w-0 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6 ${className}`}>
      <h2 className="mb-4 text-lg font-bold text-neutral-900">{title}</h2>
      {children}
    </section>
  );
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
        {icon} {label}
      </p>
      <p className="mt-1 text-lg font-bold text-neutral-900">{value}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-semibold text-neutral-900">{value}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <>
      <Navbar solid />
      <div className="bg-neutral-50 pb-10 pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 md:grid-cols-2 md:px-6">
          <div className="mx-auto h-64 w-64 animate-pulse rounded-full bg-neutral-200 md:h-80 md:w-80" />
          <div className="space-y-3">
            <div className="h-5 w-16 animate-pulse rounded bg-neutral-200" />
            <div className="h-10 w-56 animate-pulse rounded bg-neutral-200" />
            <div className="h-6 w-32 animate-pulse rounded-full bg-neutral-200" />
            <div className="h-20 w-full max-w-lg animate-pulse rounded bg-neutral-200" />
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:px-6 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-3xl bg-neutral-100" />
        ))}
      </div>
    </>
  );
}

export default PokemonDetail;
