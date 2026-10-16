import { useEffect, useRef, useState } from "react";
import { titleCase } from "../../lib/format";
import { getMoveInfo, type LevelUpMove, type MoveInfo } from "../../services/api";
import TypeBadge from "../ui/TypeBadge";

const INITIAL = 12;

const MovesTable = ({ moves }: { moves: LevelUpMove[] }) => {
  const [info, setInfo] = useState<Record<string, MoveInfo>>({});
  const [visible, setVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const shown = showAll ? moves : moves.slice(0, INITIAL);

  // Fetch move details only once the table scrolls into view
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    for (const m of shown) {
      if (info[m.name]) continue;
      getMoveInfo(m.name)
        .then((data) => active && setInfo((prev) => ({ ...prev, [m.name]: data })))
        .catch(() => {});
    }
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, showAll, moves]);

  if (moves.length === 0) return <p className="text-sm text-neutral-500">No level-up moves recorded.</p>;

  return (
    <div ref={ref}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-500">
              <th className="py-2 pr-3 font-medium">Lv.</th>
              <th className="py-2 pr-3 font-medium">Move</th>
              <th className="py-2 pr-3 font-medium">Type</th>
              <th className="py-2 pr-3 font-medium">Category</th>
              <th className="py-2 pr-3 text-right font-medium">Power</th>
              <th className="py-2 pr-3 text-right font-medium">Acc.</th>
              <th className="py-2 text-right font-medium">PP</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((m) => {
              const d = info[m.name];
              return (
                <tr key={`${m.name}-${m.level}`} className="border-b border-neutral-100 last:border-0">
                  <td className="py-2.5 pr-3 font-semibold tabular-nums text-neutral-500">{m.level || "Evo"}</td>
                  <td className="py-2.5 pr-3 font-semibold text-neutral-900">{titleCase(m.name)}</td>
                  <td className="py-2.5 pr-3">{d ? <TypeBadge type={d.type} size="sm" /> : <Placeholder />}</td>
                  <td className="py-2.5 pr-3 capitalize text-neutral-600">{d ? d.damageClass : <Placeholder />}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-800">{d ? d.power ?? "-" : <Placeholder />}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-neutral-800">{d ? (d.accuracy ? `${d.accuracy}%` : "-") : <Placeholder />}</td>
                  <td className="py-2.5 text-right tabular-nums text-neutral-800">{d ? d.pp ?? "-" : <Placeholder />}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {moves.length > INITIAL && (
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="mt-4 cursor-pointer text-sm font-semibold text-secondary-300 hover:underline"
        >
          {showAll ? "Show fewer moves" : `Show all ${moves.length} moves`}
        </button>
      )}
    </div>
  );
};

const Placeholder = () => <span className="inline-block h-3 w-10 animate-pulse rounded bg-neutral-100 align-middle" />;

export default MovesTable;
