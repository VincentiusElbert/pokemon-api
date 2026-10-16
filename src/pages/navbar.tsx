import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo-pokemon.svg";

// `solid` keeps a white bar on pages without the yellow hero behind it
const Navbar = ({ solid = false }: { solid?: boolean }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isScrolled || solid ? "bg-white/90 shadow-sm backdrop-blur" : "bg-transparent"
      }`}
    >
      <Link to="/" className="flex items-center gap-2" aria-label="Pokédex home">
        <img src={logo} alt="" className="h-8 md:h-10" />
        <span className="text-[19px] font-bold text-neutral-900 md:text-[28px]">Pokédex</span>
      </Link>
    </header>
  );
};

export default Navbar;
