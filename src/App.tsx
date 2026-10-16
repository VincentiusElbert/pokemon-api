import { Link, Route, Routes } from "react-router-dom";
import CreatorBadge from "./components/CreatorBadge";
import Home from "./pages/Home";
import PokemonDetail from "./pages/pokemon-detail";
import Navbar from "./pages/navbar";
import "./styles/App.css";

function NotFound() {
  return (
    <>
      <Navbar solid />
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-display-2xl font-bold text-neutral-900">404</p>
        <p className="text-neutral-500">This page wandered into the tall grass.</p>
        <Link to="/" className="mt-2 rounded-full bg-secondary-300 px-6 py-2.5 font-semibold text-white hover:bg-secondary-400">
          Back to Pokédex
        </Link>
      </div>
    </>
  );
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pokemon/:pokemonName" element={<PokemonDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CreatorBadge />
    </>
  );
}

export default App;
