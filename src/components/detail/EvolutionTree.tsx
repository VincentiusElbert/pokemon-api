import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { artworkUrl, displayName, formatId } from "../../lib/format";
import type { EvolutionNode } from "../../services/api";

// Renders the chain left to right; branching evolutions (e.g. Eevee) stack vertically
const EvolutionTree = ({ root, currentId }: { root: EvolutionNode; currentId: number }) => {
  if (root.children.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Stage node={root} current={root.id === currentId} />
        <p className="text-sm text-neutral-500">This Pokémon does not evolve.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <Branch node={root} currentId={currentId} />
    </div>
  );
};

function Branch({ node, currentId }: { node: EvolutionNode; currentId: number }) {
  // Many final branches (e.g. Eevee): one arrow into a grid, each option labelled with its own condition,
  // so the options never read as evolving into each other
  const wideBranch = node.children.length > 3 && node.children.every((c) => c.children.length === 0);
  if (wideBranch) {
    return (
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
        <Stage node={node} current={node.id === currentId} />
        <ArrowRight className="h-5 w-5 shrink-0 rotate-90 text-neutral-400 md:rotate-0" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {node.children.map((child) => (
            <div key={child.id} className="flex flex-col items-center gap-1.5">
              <Stage node={child} current={child.id === currentId} />
              {child.condition && (
                <span className="w-28 text-center text-[11px] font-medium capitalize leading-tight text-neutral-500 sm:w-32">
                  {child.condition}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Stage node={node} current={node.id === currentId} />
      {node.children.length > 0 && (
        <div className="flex flex-col gap-3">
          {node.children.map((child) => (
            <div key={child.id} className="flex items-center gap-2">
              <div className="flex w-24 shrink-0 flex-col items-center text-center sm:w-28">
                <ArrowRight className="h-5 w-5 text-neutral-400" />
                {child.condition && <span className="mt-1 text-[11px] font-medium capitalize leading-tight text-neutral-500">{child.condition}</span>}
              </div>
              <Branch node={child} currentId={currentId} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stage({ node, current }: { node: EvolutionNode; current: boolean }) {
  return (
    <Link
      to={`/pokemon/${node.name}`}
      aria-current={current ? "page" : undefined}
      className={`flex w-28 shrink-0 flex-col items-center rounded-2xl border p-3 text-center transition hover:-translate-y-0.5 hover:shadow-md sm:w-32 ${
        current ? "border-secondary-300 bg-secondary-100/60 ring-2 ring-secondary-300" : "border-neutral-200 bg-white"
      }`}
    >
      <img src={artworkUrl(node.id)} alt={displayName(node.name)} loading="lazy" className="h-20 w-20 object-contain" />
      <span className="mt-1 text-xs text-neutral-500">{formatId(node.id)}</span>
      <span className="text-sm font-semibold text-neutral-900">{displayName(node.name)}</span>
    </Link>
  );
}

export default EvolutionTree;
