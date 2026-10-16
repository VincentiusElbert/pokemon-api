import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export const INSTAGRAM_URL = "https://www.instagram.com/v.elbert/";

// A small signature in the corner: who made this Pokédex, linking to Instagram
const CreatorBadge = () => {
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem("creator-badge-hidden") === "1";
    } catch {
      return false;
    }
  });

  const { pathname } = useLocation();
  const [footerVisible, setFooterVisible] = useState(false);

  // The footer already carries the credit, so step aside while it is on screen.
  // Checked on scroll because some pages render their footer only after data loads.
  useEffect(() => {
    let frame = 0;
    const check = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const top = document.querySelector("footer")?.getBoundingClientRect().top;
        setFooterVisible(top !== undefined && top < window.innerHeight);
      });
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [pathname]);

  if (hidden) return null;

  const hide = () => {
    setHidden(true);
    try {
      sessionStorage.setItem("creator-badge-hidden", "1");
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 flex animate-[fade-up_0.5s_0.8s_ease-out_backwards] items-center rounded-full border border-neutral-200 bg-white/90 p-1 shadow-lg backdrop-blur transition duration-300 ${
        footerVisible ? "pointer-events-none translate-y-4 opacity-0" : ""
      }`}
    >
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Made by Vincentius Elbert, @v.elbert on Instagram"
        className="group flex items-center gap-2 sm:pr-2"
      >
        <img src="/creator-avatar.png" alt="" className="h-9 w-9 rounded-full transition group-hover:scale-110" />
        {/* On phones only the avatar shows, so the badge doesn't cover the filters */}
        <span className="hidden leading-tight sm:block">
          <span className="block text-[11px] text-neutral-500">Made by Vincentius Elbert</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-neutral-900 group-hover:text-secondary-300">
            <InstagramIcon />
            @v.elbert
          </span>
        </span>
      </a>
      <button
        type="button"
        onClick={hide}
        aria-label="Hide credit"
        className="hidden h-6 w-6 cursor-pointer items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 sm:flex"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export function InstagramIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default CreatorBadge;
