import { typeEffectiveness, type PokedexIndex } from "../../services/api";
import TypeBadge from "../ui/TypeBadge";

const GROUPS = [
  { label: "Weak to", match: (m: number) => m > 1, tone: "text-accent-red" },
  { label: "Resistant to", match: (m: number) => m > 0 && m < 1, tone: "text-emerald-600" },
  { label: "Immune to", match: (m: number) => m === 0, tone: "text-neutral-700" },
];

const formatMultiplier = (m: number) => (m === 0.25 ? "¼×" : m === 0.5 ? "½×" : `${m}×`);

const TypeMatchups = ({ types, relations }: { types: string[]; relations: PokedexIndex["relations"] }) => {
  const multipliers = typeEffectiveness(types, relations);

  return (
    <div className="space-y-5">
      {GROUPS.map((group) => {
        const list = Object.entries(multipliers)
          .filter(([, m]) => group.match(m))
          .sort((a, b) => (group.label === "Weak to" ? b[1] - a[1] : a[1] - b[1]));
        return (
          <div key={group.label}>
            <p className={`mb-2 text-sm font-semibold ${group.tone}`}>
              {group.label} <span className="font-normal text-neutral-400">({list.length})</span>
            </p>
            {list.length === 0 ? (
              <p className="text-sm text-neutral-400">None</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {list.map(([type, m]) => (
                  <span key={type} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 py-0.5 pl-0.5 pr-2.5">
                    <TypeBadge type={type} size="sm" />
                    <span className="text-xs font-bold text-neutral-700">{formatMultiplier(m)}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <p className="text-xs text-neutral-400">Damage taken from each attacking type, combining both of this Pokémon’s types.</p>
    </div>
  );
};

export default TypeMatchups;
