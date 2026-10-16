import { useEffect, useState } from "react";
import { STAT_LABELS } from "../../lib/format";

const MAX_STAT = 255; // highest possible base stat

// Color by strength, so weak and strong stats read at a glance
function statColor(value: number) {
  if (value < 50) return "#F34444";
  if (value < 80) return "#FF7F0F";
  if (value < 100) return "#FFDD57";
  if (value < 130) return "#A0E515";
  return "#23CD5E";
}

const StatBars = ({ stats, accent }: { stats: { name: string; value: number }[]; accent: string }) => {
  // Animate bars from 0 on first paint
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const total = stats.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-3">
      {stats.map((s, i) => (
        <div key={s.name} className="grid grid-cols-[5.5rem_2.5rem_1fr] items-center gap-3 text-sm">
          <span className="font-medium text-neutral-500">{STAT_LABELS[s.name] ?? s.name}</span>
          <span className="text-right font-bold tabular-nums text-neutral-900">{s.value}</span>
          <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100" role="meter" aria-valuenow={s.value} aria-valuemin={0} aria-valuemax={MAX_STAT} aria-label={STAT_LABELS[s.name]}>
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: ready ? `${(s.value / MAX_STAT) * 100}%` : "0%",
                backgroundColor: statColor(s.value),
                transitionDelay: `${i * 60}ms`,
              }}
            />
          </div>
        </div>
      ))}
      <div className="grid grid-cols-[5.5rem_2.5rem_1fr] items-center gap-3 border-t border-neutral-100 pt-3 text-sm">
        <span className="font-semibold text-neutral-900">Total</span>
        <span className="text-right font-bold tabular-nums" style={{ color: accent }}>
          {total}
        </span>
        <span className="text-xs text-neutral-400">Bars are scaled to the maximum base stat of 255.</span>
      </div>
    </div>
  );
};

export default StatBars;
