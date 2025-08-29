import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPokemonDetail, type PokemonData } from "../services/api";
import Navbar from "./navbar";

const PokemonDetail: React.FC = () => {
  const { pokemonName } = useParams<{ pokemonName: string }>();
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (pokemonName) {
          const data = await fetchPokemonDetail(pokemonName);
          setPokemon(data);
        }
      } catch (err) {
        console.error("Error fetching Pokémon data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pokemonName]);

  if (loading) return <p className="text-center mt-8">Loading...</p>;
  if (!pokemon) return <p className="text-center mt-8">No data found.</p>;

  const getBarColor = (value: number) => {
    if (value >= 70) return "bg-green-500";
    if (value >= 50) return "bg-yellow-400";
    return "bg-red-500";
  };

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-20 font-sans">
        <button
          className="text-sm text-gray-500 mb-4 cursor-pointer hover:text-gray-700 transition-colors"
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back(); // Kembali ke halaman sebelumnya
            } else {
              window.location.href = "/"; // Fallback ke halaman utama
            }
          }}
        >
          ← Back
        </button>
        <div className="flex flex-col md:flex-row gap-10">
          <img src={pokemon.artwork} alt={pokemon.name} className="w-64 h-64 object-contain" />
          <div className="flex-1">
            <h2 className="text-sm text-gray-500">{String(pokemon.id).padStart(3, "0")}</h2>
            <h1 className="text-4xl text-neutral-900 font-bold capitalize">{pokemon.name}</h1>
            <p className="mt-2 text-gray-600 max-w-md">{pokemon.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Type</p>
                <div className="flex gap-2">
                  {pokemon.types.map((type) => (
                    <span key={type} className="px-2 py-1 text-sm bg-gray-100 rounded capitalize">
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Abilities</p>
                <div className="flex gap-2 flex-wrap">
                  {pokemon.abilities.map((ability) => (
                    <span key={ability} className="px-2 py-1 text-sm border rounded capitalize">
                      {ability}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p>Size</p>
                <div>
                  <div>
                    <img src="" alt="" />
                    <p className="text-sm text-gray-400 mb-1">Weight</p>
                  </div>
                  <p className="text-lg font-bold">{pokemon.weight}</p>
                </div>
                <div>
                  <div>
                    <img src="" alt="" />
                    <p className="text-sm text-gray-400 mb-1">Height</p>
                  </div>
                  <p className="text-lg font-bold">{pokemon.height}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Stats</h3>
              <div className="space-y-2">
                {Object.entries(pokemon.stats).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{key.replace("-", " ")}</span>
                      <span>{value}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded">
                      <div className={`h-2 rounded ${getBarColor(value)}`} style={{ width: `${value > 100 ? 100 : value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Evolution Chain</h3>
          <div className="flex gap-6">
            {pokemon.evolution.map((evo) => (
              <div key={evo.name} className="p-4 border rounded flex flex-col items-center shadow-sm w-32">
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`} alt={evo.name} className="w-20 h-20 object-contain" />
                <p className="text-sm text-gray-500">{String(evo.id).padStart(3, "0")}</p>
                <p className="capitalize font-semibold">{evo.name}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="text-center text-sm text-gray-400 mt-12">©2025 Pokedex</footer>
      </div>
    </>
  );
};

export default PokemonDetail;
