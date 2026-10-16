import logo from "../assets/logo-pokemon.svg";
import { INSTAGRAM_URL, InstagramIcon } from "../components/CreatorBadge";

const Footer = () => {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="custom-container flex flex-col items-start gap-3 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="flex items-center gap-2">
          <img src={logo} alt="" width={33} height={33} />
          <p className="text-[19px] font-bold text-neutral-900 md:text-[24px]">Pokédex</p>
        </div>
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="group flex items-center gap-3">
          <img src="/creator-avatar.png" alt="" className="h-10 w-10 rounded-full transition group-hover:scale-110" />
          <span className="leading-tight">
            <span className="block text-xs text-neutral-500">Designed &amp; built by</span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900 group-hover:text-secondary-300">
              Vincentius Elbert · <InstagramIcon /> @v.elbert
            </span>
          </span>
        </a>
        <p className="text-xs text-neutral-500 md:text-sm">
          Data from{" "}
          <a href="https://pokeapi.co" target="_blank" rel="noreferrer" className="font-medium text-secondary-300 hover:underline">
            PokéAPI
          </a>
          . Pokémon and Pokémon names are trademarks of Nintendo. © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
