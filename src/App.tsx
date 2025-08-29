import "./styles/App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import PokemonDetail from "./pages/pokemon-detail";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pokemon/:pokemonName" element={<PokemonDetail />} />
      {/* bahsa manusia nya. browser arahkan saya ke alamt yang saya klik */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

export default App;
