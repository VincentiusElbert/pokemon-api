export const TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonType = (typeof TYPES)[number];

// Classic type colors: `bg` for badges and accents, `soft` for page tints
export const TYPE_COLORS: Record<PokemonType, { bg: string; soft: string; text: string }> = {
  normal: { bg: "#A8A77A", soft: "#F1F1E6", text: "#ffffff" },
  fire: { bg: "#EE8130", soft: "#FDEBDD", text: "#ffffff" },
  water: { bg: "#6390F0", soft: "#E3ECFD", text: "#ffffff" },
  electric: { bg: "#F7D02C", soft: "#FEF7D6", text: "#3d3200" },
  grass: { bg: "#7AC74C", soft: "#E9F6E1", text: "#ffffff" },
  ice: { bg: "#96D9D6", soft: "#E8F7F6", text: "#16403e" },
  fighting: { bg: "#C22E28", soft: "#F7DFDE", text: "#ffffff" },
  poison: { bg: "#A33EA1", soft: "#F2E0F1", text: "#ffffff" },
  ground: { bg: "#E2BF65", soft: "#FAF2DE", text: "#3f3000" },
  flying: { bg: "#A98FF3", soft: "#EFEAFD", text: "#ffffff" },
  psychic: { bg: "#F95587", soft: "#FEE2EA", text: "#ffffff" },
  bug: { bg: "#A6B91A", soft: "#F0F4D9", text: "#ffffff" },
  rock: { bg: "#B6A136", soft: "#F3EFDB", text: "#ffffff" },
  ghost: { bg: "#735797", soft: "#E8E2F0", text: "#ffffff" },
  dragon: { bg: "#6F35FC", soft: "#E7DEFE", text: "#ffffff" },
  dark: { bg: "#705746", soft: "#E8E2DE", text: "#ffffff" },
  steel: { bg: "#B7B7CE", soft: "#F0F0F5", text: "#2b2b3d" },
  fairy: { bg: "#D685AD", soft: "#F8E6EF", text: "#ffffff" },
};

export const typeColor = (type: string) => TYPE_COLORS[type as PokemonType] ?? TYPE_COLORS.normal;

export const GENERATIONS = [
  { id: 1, label: "Gen I", region: "Kanto", start: 1, end: 151 },
  { id: 2, label: "Gen II", region: "Johto", start: 152, end: 251 },
  { id: 3, label: "Gen III", region: "Hoenn", start: 252, end: 386 },
  { id: 4, label: "Gen IV", region: "Sinnoh", start: 387, end: 493 },
  { id: 5, label: "Gen V", region: "Unova", start: 494, end: 649 },
  { id: 6, label: "Gen VI", region: "Kalos", start: 650, end: 721 },
  { id: 7, label: "Gen VII", region: "Alola", start: 722, end: 809 },
  { id: 8, label: "Gen VIII", region: "Galar", start: 810, end: 905 },
  { id: 9, label: "Gen IX", region: "Paldea", start: 906, end: 1025 },
] as const;

export const MAX_POKEMON = 1025;
