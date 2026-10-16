import { Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../../hooks/use-favorites";
import { artworkUrl, displayName, formatId } from "../../lib/format";
import { typeColor } from "../../lib/types";
import TypeBadge from "./TypeBadge";

type CardProps = {
  id: number;
  name: string;
  types: string[];
};

const Card = ({ id, name, types }: CardProps) => {
  const { isFavorite, toggle } = useFavorites();
  const [loaded, setLoaded] = useState(false);
  const favorite = isFavorite(id);
  const tint = typeColor(types[0] ?? "normal");
  const label = displayName(name);

  return (
    <Link
      to={`/pokemon/${name}`}
      className="group relative block animate-[fade-up_0.4s_ease-out_both] rounded-3xl border border-neutral-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-300"
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          toggle(id);
        }}
        aria-label={favorite ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
        aria-pressed={favorite}
        className="absolute right-4 top-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/80 backdrop-blur transition hover:scale-110"
      >
        <Heart className={`h-4 w-4 transition ${favorite ? "fill-accent-red text-accent-red" : "text-neutral-400"}`} />
      </button>

      <div className="relative m-2 overflow-hidden rounded-2xl" style={{ backgroundColor: tint.soft }}>
        {/* Pokéball watermark */}
        <svg
          viewBox="0 0 24 24"
          className="absolute -bottom-6 -right-6 h-40 w-40 opacity-15 transition duration-500 group-hover:rotate-45"
          style={{ fill: tint.bg }}
          aria-hidden
        >
          <path d="M21.95 11h-3.021A6.988 6.988 0 0012 6a6.988 6.988 0 00-6.929 5H2.05a10.005 10.005 0 0119.9 0zM2.05 13h3.021A6.988 6.988 0 0012 18a6.988 6.988 0 006.929-5h3.021a10.005 10.005 0 01-19.9 0zM12 9a3 3 0 100 6 3 3 0 000-6z" />
        </svg>
        {!loaded && <div className="absolute inset-0 m-auto h-24 w-24 animate-pulse rounded-full bg-white/60" />}
        <img
          src={artworkUrl(id)}
          alt={label}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`relative z-10 mx-auto h-40 w-40 object-contain p-2 transition duration-300 group-hover:scale-110 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <div className="flex flex-col gap-2 px-5 pb-5 pt-2">
        <p className="text-sm font-medium text-neutral-500">{formatId(id)}</p>
        <h2 className="text-lg font-bold text-neutral-900">{label}</h2>
        <div className="flex flex-wrap gap-1.5">
          {types.map((type) => (
            <TypeBadge key={type} type={type} size="sm" />
          ))}
        </div>
      </div>
    </Link>
  );
};

export const CardSkeleton = () => (
  <div className="rounded-3xl border border-neutral-200 bg-white p-2 shadow-sm">
    <div className="h-44 animate-pulse rounded-2xl bg-neutral-100" />
    <div className="space-y-2 px-3 pb-3 pt-4">
      <div className="h-3 w-12 animate-pulse rounded bg-neutral-100" />
      <div className="h-5 w-28 animate-pulse rounded bg-neutral-100" />
      <div className="h-5 w-20 animate-pulse rounded-full bg-neutral-100" />
    </div>
  </div>
);

export default Card;
