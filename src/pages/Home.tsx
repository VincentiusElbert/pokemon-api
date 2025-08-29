import Navbar from "./navbar";
import pokemonTitle from "../assets/pokemon-title.svg";
import { Search } from "lucide-react";
import { ListPokemon } from "./list-pokemon";
import Footer from "./footer";

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <div
        className="bg-accent-yellow relative overflow-hidden pb-52"
        style={{
          backgroundImage: "url('background-hero.png')",
          backgroundRepeat: "repeat",
        }}
      >
        <Navbar />

        <div className=" flex flex-col items-center justify-center text-center pt-36 gap-3.5 max-w-[686px] mx-auto px-4">
          <div>
            <img src={pokemonTitle} alt="Pokemon Title" />
          </div>
          <h1 className="text-display-sm md:text-display-2xl text-neutral-900 font-bold">Discover the Most Powerful Pokémon in the Wild!</h1>
          <p className="text-sm md:text-md font-medium text-neutral-800">Train, Battle, and Collect Your Favorites!</p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mt-10 px-4">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search Pokemon"
              className="w-full bg-white text-neutral-700 py-3.5 pl-6 pr-12 border border-neutral-300 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-yellow placeholder:text-neutral-400"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center bg-blue-500 rounded-full hover:bg-blue-600 transition">
              <Search className="text-white w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cloud + Decorations */}
        <div className="absolute bottom-0 left-0 w-full z-10">
          {/* Cloud */}
          <img src="../cloud-1.png" alt="cloud" className="w-full object-cover" />

          {/* Pokemon Dekorasi */}
          <img
            src="../pokemon-1.png"
            alt="Charizard"
            className="absolute bottom-0 left-4 md:left-20 -z-1"
            style={{
              width: "clamp(10.06rem, 19.2vw, 17.38rem)",
              height: "clamp(10.06rem, 19.2vw, 17.38rem)",
              left: "clamp(1.19rem, 3.6vw, 3.19rem)",
            }}
          />
          <img
            src="../pokemon-2.png"
            alt="Pikachu"
            className="absolute bottom-0 right-4 md:right-20 -z-1 "
            style={{
              width: "clamp(10.06rem, 19.2vw, 17.38rem)",
              height: "clamp(10.06rem, 19.2vw, 17.38rem)",
              right: "clamp(1.19rem, 3.6vw, 3.19rem)",
            }}
          />
        </div>
      </div>

      {/* List Section */}
      <div className="bg-white relative z-20 px-4 md:px-10 pb-20 pt-8">
        <ListPokemon />
      </div>

      {/* Footer Section */}
      <Footer />
    </>
  );
};

export default Home;
