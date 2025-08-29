import { useEffect, useState } from "react";
import logo from "../assets/logo-pokemon.svg";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`flex items-center justify-center gap-2 p-4 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow" : "bg-transparent"}`}>
      <img src={logo} alt="Pokemon Logo" className="h-8 md:h-10" />
      <div className="text-neutral-900 text-[19px] md:text-[28px] font-bold">Pokedex</div>
    </div>
  );
};

export default Navbar;
