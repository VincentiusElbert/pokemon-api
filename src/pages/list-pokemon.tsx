import React, { useEffect, useRef, useState } from "react";
import Card from "../components/ui/Card";
import { fetchPokemonList, type PokemonListItem } from "../services/api";

export const ListPokemon: React.FC = () => {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 24; // Matches the limit in fetchPokemonList

  const hasFetchedInitial = useRef(false); // 👈 Mencegah double-fetch di dev mode

  const loadPokemon = async (newOffset: number) => {
    try {
      setLoading(true);
      const data = await fetchPokemonList(limit, newOffset);
      setPokemonList((prev) => [...prev, ...data]);
      setOffset(newOffset + limit);
      setHasMore(data.length === limit); // Jika jumlah data < limit, anggap sudah habis
    } catch (err) {
      console.error("Failed to fetch Pokémon list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Hanya jalankan saat pertama kali mount (meskipun React dev mode render 2x)
    if (!hasFetchedInitial.current) {
      loadPokemon(0);
      hasFetchedInitial.current = true;
    }
  }, []);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadPokemon(offset);
    }
  };

  return (
    <div className="custom-container">
      <h1 className="text-2xl font-bold text-display-xs md:text-display-md text-neutral-800">List Pokémon</h1>

      {loading && pokemonList.length === 0 ? (
        <p className="text-center text-gray-500">Loading Pokémon...</p>
      ) : (
        <div className="flex justify-center items-center flex-wrap gap-4 pt-6">
          {pokemonList.map((pokemon) => (
            <Card id={pokemon.id} key={pokemon.id} name={pokemon.name} image={pokemon.image || "/placeholder.png"} types={pokemon.types} />
          ))}
        </div>
      )}

      <div className="flex justify-center items-center mt-8">
        {hasMore && (
          <button className="h-11 md:h-13 px-13.25 md:px-19 text-neutral-900 border border-neutral-300 rounded-full disabled:opacity-50" onClick={handleLoadMore} disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </button>
        )}
      </div>
    </div>
  );
};
