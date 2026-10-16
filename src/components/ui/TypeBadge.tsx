import { typeColor } from "../../lib/types";

type Props = { type: string; size?: "sm" | "md"; onClick?: () => void; active?: boolean };

const TypeBadge = ({ type, size = "md", onClick, active }: Props) => {
  const color = typeColor(type);
  const className = `inline-flex items-center rounded-full font-semibold capitalize transition ${
    size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
  }`;
  const style = { backgroundColor: color.bg, color: color.text };

  if (!onClick) {
    return (
      <span className={className} style={style}>
        {type}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`${className} cursor-pointer ${active ? "ring-2 ring-offset-2 ring-neutral-900" : "opacity-80 hover:opacity-100"}`}
      style={style}
    >
      {type}
    </button>
  );
};

export default TypeBadge;
