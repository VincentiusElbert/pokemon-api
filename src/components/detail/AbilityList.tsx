import { useAsync } from "../../hooks/use-async";
import { titleCase } from "../../lib/format";
import { getAbilityDescription } from "../../services/api";

const AbilityList = ({ abilities }: { abilities: { name: string; hidden: boolean }[] }) => {
  const key = abilities.map((a) => a.name).join(",");
  const { data: descriptions } = useAsync(
    () => Promise.all(abilities.map((a) => getAbilityDescription(a.name).catch(() => ""))),
    [key],
  );

  return (
    <ul className="space-y-3">
      {abilities.map((a, i) => (
        <li key={a.name} className="rounded-2xl bg-neutral-50 p-3">
          <p className="flex items-center gap-2 font-semibold text-neutral-900">
            {titleCase(a.name)}
            {a.hidden && (
              <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Hidden
              </span>
            )}
          </p>
          {descriptions ? (
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">{descriptions[i] || "No description available."}</p>
          ) : (
            <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-neutral-200" />
          )}
        </li>
      ))}
    </ul>
  );
};

export default AbilityList;
