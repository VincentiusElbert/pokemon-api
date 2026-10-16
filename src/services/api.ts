import { MAX_POKEMON, TYPES, type PokemonType } from "../lib/types";

const API = "https://pokeapi.co/api/v2";

// ---------- Request cache ----------
// Every URL is fetched at most once per session; going back to a page is instant.
const cache = new Map<string, Promise<unknown>>();

export function getJSON<T>(url: string): Promise<T> {
  const full = url.startsWith("http") ? url : `${API}${url}`;
  if (!cache.has(full)) {
    const request = fetch(full).then((res) => {
      if (!res.ok) throw new Error(res.status === 404 ? "NOT_FOUND" : `Request failed (${res.status})`);
      return res.json();
    });
    // A failed request should be retried next time, not cached forever
    request.catch(() => cache.delete(full));
    cache.set(full, request);
  }
  return cache.get(full) as Promise<T>;
}

const idFromUrl = (url: string) => Number(url.match(/\/(\d+)\/?$/)?.[1] ?? 0);

// ---------- Index: every Pokémon with its types (19 requests, cached in localStorage) ----------

export interface IndexEntry {
  id: number;
  name: string;
  types: PokemonType[];
}

export interface TypeRelations {
  doubleFrom: string[];
  halfFrom: string[];
  noFrom: string[];
}

export interface PokedexIndex {
  entries: IndexEntry[];
  relations: Record<PokemonType, TypeRelations>;
}

interface NamedResource {
  name: string;
  url: string;
}

interface TypeResponse {
  pokemon: { slot: number; pokemon: NamedResource }[];
  damage_relations: {
    double_damage_from: NamedResource[];
    half_damage_from: NamedResource[];
    no_damage_from: NamedResource[];
  };
}

const INDEX_KEY = "pokedex-index-v1";
const INDEX_TTL = 7 * 24 * 60 * 60 * 1000;
let indexPromise: Promise<PokedexIndex> | null = null;

export function getIndex(): Promise<PokedexIndex> {
  if (indexPromise) return indexPromise;

  try {
    const saved = JSON.parse(localStorage.getItem(INDEX_KEY) ?? "null");
    if (saved && Date.now() - saved.savedAt < INDEX_TTL) {
      indexPromise = Promise.resolve(saved.data as PokedexIndex);
      return indexPromise;
    }
  } catch {
    // storage unavailable, fall through to the network
  }

  indexPromise = (async () => {
    const [list, ...typeData] = await Promise.all([
      getJSON<{ results: NamedResource[] }>(`/pokemon?limit=${MAX_POKEMON}`),
      ...TYPES.map((t) => getJSON<TypeResponse>(`/type/${t}`)),
    ]);

    const typesById = new Map<number, { slot: number; type: PokemonType }[]>();
    const relations = {} as Record<PokemonType, TypeRelations>;

    TYPES.forEach((type, i) => {
      const data = typeData[i] as TypeResponse;
      relations[type] = {
        doubleFrom: data.damage_relations.double_damage_from.map((t) => t.name),
        halfFrom: data.damage_relations.half_damage_from.map((t) => t.name),
        noFrom: data.damage_relations.no_damage_from.map((t) => t.name),
      };
      for (const p of data.pokemon) {
        const id = idFromUrl(p.pokemon.url);
        if (id > MAX_POKEMON) continue;
        const slots = typesById.get(id) ?? [];
        slots.push({ slot: p.slot, type });
        typesById.set(id, slots);
      }
    });

    const entries: IndexEntry[] = (list as { results: NamedResource[] }).results.map((r) => {
      const id = idFromUrl(r.url);
      return {
        id,
        name: r.name,
        types: (typesById.get(id) ?? []).sort((a, b) => a.slot - b.slot).map((t) => t.type),
      };
    });

    const data: PokedexIndex = { entries, relations };
    try {
      localStorage.setItem(INDEX_KEY, JSON.stringify({ savedAt: Date.now(), data }));
    } catch {
      // ignore quota errors
    }
    return data;
  })();

  indexPromise.catch(() => (indexPromise = null));
  return indexPromise;
}

// Combined damage multiplier for every attacking type against a defender's types
export function typeEffectiveness(defending: string[], relations: PokedexIndex["relations"]) {
  const result: Record<string, number> = {};
  for (const attacker of TYPES) {
    let multiplier = 1;
    for (const def of defending) {
      const r = relations[def as PokemonType];
      if (!r) continue;
      if (r.noFrom.includes(attacker)) multiplier *= 0;
      else if (r.doubleFrom.includes(attacker)) multiplier *= 2;
      else if (r.halfFrom.includes(attacker)) multiplier *= 0.5;
    }
    result[attacker] = multiplier;
  }
  return result;
}

// ---------- Detail ----------

interface PokemonResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: { slot: number; type: NamedResource }[];
  abilities: { ability: NamedResource; is_hidden: boolean }[];
  stats: { base_stat: number; stat: NamedResource }[];
  moves: {
    move: NamedResource;
    version_group_details: { level_learned_at: number; move_learn_method: NamedResource; version_group: NamedResource }[];
  }[];
  cries?: { latest?: string | null; legacy?: string | null };
  species: NamedResource;
}

interface SpeciesResponse {
  name: string;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number | null;
  is_legendary: boolean;
  is_mythical: boolean;
  generation: NamedResource;
  egg_groups: NamedResource[];
  genera: { genus: string; language: NamedResource }[];
  flavor_text_entries: { flavor_text: string; language: NamedResource; version: NamedResource }[];
  evolution_chain: { url: string } | null;
}

interface EvolutionDetail {
  trigger: NamedResource;
  min_level: number | null;
  item: NamedResource | null;
  held_item: NamedResource | null;
  min_happiness: number | null;
  min_affection: number | null;
  min_beauty: number | null;
  time_of_day: string;
  known_move: NamedResource | null;
  known_move_type: NamedResource | null;
  location: NamedResource | null;
  trade_species: NamedResource | null;
  needs_overworld_rain: boolean;
  gender: number | null;
  relative_physical_stats: number | null;
  party_species: NamedResource | null;
  turn_upside_down: boolean;
}

interface ChainLink {
  species: NamedResource;
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

export interface EvolutionNode {
  id: number;
  name: string;
  condition: string | null; // how this stage is reached from the previous one
  children: EvolutionNode[];
}

export interface LevelUpMove {
  name: string;
  level: number;
}

export interface PokemonDetail {
  id: number;
  name: string;
  speciesName: string;
  genus: string;
  description: string;
  types: PokemonType[];
  height: number;
  weight: number;
  baseExperience: number | null;
  abilities: { name: string; hidden: boolean }[];
  stats: { name: string; value: number }[];
  genderRate: number; // -1 genderless, otherwise female share in eighths
  captureRate: number;
  baseHappiness: number | null;
  eggGroups: string[];
  generation: string;
  legendary: boolean;
  mythical: boolean;
  cry: string | null;
  evolution: EvolutionNode | null;
  moves: LevelUpMove[];
}

const pretty = (s: string) => s.replace(/-/g, " ");

function describeEvolution(d: EvolutionDetail | undefined): string | null {
  if (!d) return null;
  const parts: string[] = [];
  const trigger = d.trigger.name;

  if (trigger === "level-up") parts.push(d.min_level ? `Level ${d.min_level}` : "Level up");
  else if (trigger === "use-item" && d.item) parts.push(`Use ${pretty(d.item.name)}`);
  else if (trigger === "trade") parts.push(d.trade_species ? `Trade for ${pretty(d.trade_species.name)}` : "Trade");
  else parts.push(pretty(trigger));

  if (d.held_item) parts.push(`holding ${pretty(d.held_item.name)}`);
  if (d.min_happiness) parts.push("with high friendship");
  if (d.min_affection) parts.push("with high affection");
  if (d.min_beauty) parts.push("with high beauty");
  if (d.known_move) parts.push(`knowing ${pretty(d.known_move.name)}`);
  if (d.known_move_type) parts.push(`knowing a ${d.known_move_type.name}-type move`);
  if (d.location) parts.push(`at ${pretty(d.location.name)}`);
  if (d.time_of_day) parts.push(`at ${d.time_of_day}`);
  if (d.needs_overworld_rain) parts.push("while raining");
  if (d.gender === 1) parts.push("(female)");
  if (d.gender === 2) parts.push("(male)");
  if (d.party_species) parts.push(`with ${pretty(d.party_species.name)} in party`);
  if (d.turn_upside_down) parts.push("holding the device upside down");
  if (d.relative_physical_stats === 1) parts.push("(Attack > Defense)");
  if (d.relative_physical_stats === -1) parts.push("(Attack < Defense)");
  if (d.relative_physical_stats === 0) parts.push("(Attack = Defense)");

  return parts.join(" ");
}

function buildEvolution(link: ChainLink): EvolutionNode {
  return {
    id: idFromUrl(link.species.url),
    name: link.species.name,
    condition: describeEvolution(link.evolution_details[0]),
    children: link.evolves_to.map(buildEvolution),
  };
}

// Level-up moves from the most recent game this Pokémon appears in
function latestLevelUpMoves(moves: PokemonResponse["moves"]): LevelUpMove[] {
  let latest = 0;
  for (const m of moves)
    for (const d of m.version_group_details)
      if (d.move_learn_method.name === "level-up") latest = Math.max(latest, idFromUrl(d.version_group.url));

  const result: LevelUpMove[] = [];
  for (const m of moves) {
    const detail = m.version_group_details.find(
      (d) => d.move_learn_method.name === "level-up" && idFromUrl(d.version_group.url) === latest,
    );
    if (detail) result.push({ name: m.move.name, level: detail.level_learned_at });
  }
  return result.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
}

export async function getPokemonDetail(nameOrId: string): Promise<PokemonDetail> {
  const pokemon = await getJSON<PokemonResponse>(`/pokemon/${nameOrId.toLowerCase()}`);
  const species = await getJSON<SpeciesResponse>(pokemon.species.url);
  const chain = species.evolution_chain ? await getJSON<{ chain: ChainLink }>(species.evolution_chain.url) : null;

  // Prefer the newest English Pokédex entry
  const english = species.flavor_text_entries.filter((e) => e.language.name === "en");
  const entry = english[english.length - 1];

  return {
    id: pokemon.id,
    name: pokemon.name,
    speciesName: species.name,
    genus: species.genera.find((g) => g.language.name === "en")?.genus ?? "Pokémon",
    description: entry
      ? entry.flavor_text.replace(/[\f\n\r­]+/g, " ").replace(/\s+/g, " ")
      : "No description available.",
    types: [...pokemon.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name as PokemonType),
    height: pokemon.height,
    weight: pokemon.weight,
    baseExperience: pokemon.base_experience,
    abilities: pokemon.abilities.map((a) => ({ name: a.ability.name, hidden: a.is_hidden })),
    stats: pokemon.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    genderRate: species.gender_rate,
    captureRate: species.capture_rate,
    baseHappiness: species.base_happiness,
    eggGroups: species.egg_groups.map((e) => e.name),
    generation: species.generation.name,
    legendary: species.is_legendary,
    mythical: species.is_mythical,
    cry: pokemon.cries?.latest ?? pokemon.cries?.legacy ?? null,
    evolution: chain ? buildEvolution(chain.chain) : null,
    moves: latestLevelUpMoves(pokemon.moves),
  };
}

// ---------- On-demand extras ----------

interface AbilityResponse {
  effect_entries: { short_effect: string; language: NamedResource }[];
  flavor_text_entries: { flavor_text: string; language: NamedResource }[];
}

export async function getAbilityDescription(name: string): Promise<string> {
  const data = await getJSON<AbilityResponse>(`/ability/${name}`);
  const effect = data.effect_entries.find((e) => e.language.name === "en")?.short_effect;
  if (effect) return effect;
  const english = data.flavor_text_entries.filter((e) => e.language.name === "en");
  return english[english.length - 1]?.flavor_text.replace(/\s+/g, " ") ?? "";
}

export interface MoveInfo {
  name: string;
  type: PokemonType;
  damageClass: "physical" | "special" | "status";
  power: number | null;
  accuracy: number | null;
  pp: number | null;
}

interface MoveResponse {
  name: string;
  type: NamedResource;
  damage_class: NamedResource;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
}

export async function getMoveInfo(name: string): Promise<MoveInfo> {
  const m = await getJSON<MoveResponse>(`/move/${name}`);
  return {
    name: m.name,
    type: m.type.name as PokemonType,
    damageClass: m.damage_class.name as MoveInfo["damageClass"],
    power: m.power,
    accuracy: m.accuracy,
    pp: m.pp,
  };
}
