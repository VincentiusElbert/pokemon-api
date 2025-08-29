import axios from "axios";

export interface PokemonSummary {
  name: string;
  url: string;
}

export interface PokemonListItem {
  id: number;
  name: string;
  image: string;
  types: string[];
}

export interface PokemonData {
  id: number;
  name: string;
  description: string;
  artwork: string;
  types: string[];
  abilities: string[];
  weight: number;
  height: number;
  stats: {
    [key: string]: number;
  };
  evolution: {
    id: number;
    name: string;
  }[];
}

interface PokemonAPIResponse {
  id: number;
  name: string;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
  weight: number;
  height: number;
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
  species: {
    url: string;
  };
}

interface SpeciesAPIResponse {
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
  }[];
  evolution_chain: {
    url: string;
  };
}

interface EvolutionChain {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChain[];
}

// Untuk halaman daftar (list)
export async function fetchPokemonList(limit = 24, offset = 0): Promise<PokemonListItem[]> {
  const res = await axios.get<{ results: PokemonSummary[] }>(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);

  const promises = res.data.results.map((pokemon) =>
    axios.get<PokemonAPIResponse>(pokemon.url).then((res) => {
      const data = res.data;
      return {
        id: data.id,
        name: data.name,
        image: data.sprites.other["official-artwork"].front_default,
        types: data.types.map((t) => t.type.name),
      };
    })
  );

  return Promise.all(promises);
}

// Untuk halaman detail
export async function fetchPokemonDetail(name: string): Promise<PokemonData> {
  const res = await axios.get<PokemonAPIResponse>(`https://pokeapi.co/api/v2/pokemon/${name}`);
  const speciesRes = await axios.get<SpeciesAPIResponse>(res.data.species.url);
  const evoRes = await axios.get<{ chain: EvolutionChain }>(speciesRes.data.evolution_chain.url);

  const descriptionEntry = speciesRes.data.flavor_text_entries.find((entry) => entry.language.name === "en");

  const evolution: { id: number; name: string }[] = [];
  let current: EvolutionChain | undefined = evoRes.data.chain;

  while (current) {
    const idMatch = current.species.url.match(/\/(\d+)\//);
    evolution.push({
      id: idMatch ? parseInt(idMatch[1], 10) : 0,
      name: current.species.name,
    });
    current = current.evolves_to[0];
  }

  return {
    id: res.data.id,
    name: res.data.name,
    description: descriptionEntry ? descriptionEntry.flavor_text.replace(/\f/g, " ") : "No description available.",
    artwork: res.data.sprites.other["official-artwork"].front_default,
    types: res.data.types.map((t) => t.type.name),
    abilities: res.data.abilities.map((a) => a.ability.name),
    weight: res.data.weight,
    height: res.data.height,
    stats: res.data.stats.reduce((acc, stat) => {
      acc[stat.stat.name] = stat.base_stat;
      return acc;
    }, {} as Record<string, number>),
    evolution,
  };
}
