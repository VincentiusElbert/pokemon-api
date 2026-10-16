const SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

// Artwork URLs follow a fixed pattern, so the list needs no extra request per card
export const artworkUrl = (id: number, shiny = false) =>
  `${SPRITE_BASE}/other/official-artwork/${shiny ? "shiny/" : ""}${id}.png`;

export const spriteUrl = (id: number) => `${SPRITE_BASE}/${id}.png`;

export const formatId = (id: number) => `#${String(id).padStart(4, "0")}`;

// Names that don't title-case cleanly from the API slug
const SPECIAL_NAMES: Record<string, string> = {
  "mr-mime": "Mr. Mime",
  "mr-rime": "Mr. Rime",
  "mime-jr": "Mime Jr.",
  "type-null": "Type: Null",
  "ho-oh": "Ho-Oh",
  "porygon-z": "Porygon-Z",
  "jangmo-o": "Jangmo-o",
  "hakamo-o": "Hakamo-o",
  "kommo-o": "Kommo-o",
  "nidoran-f": "Nidoran♀",
  "nidoran-m": "Nidoran♂",
  farfetchd: "Farfetch’d",
  sirfetchd: "Sirfetch’d",
  flabebe: "Flabébé",
};

// Default forms come with a suffix in /pokemon (e.g. "deoxys-normal"); strip it for display
const FORM_SUFFIXES = [
  "-normal", "-altered", "-land", "-red-striped", "-standard", "-incarnate", "-ordinary", "-aria",
  "-male", "-shield", "-average", "-50", "-baile", "-midday", "-solo", "-disguised", "-amped",
  "-ice", "-full-belly", "-single-strike", "-plant", "-zero", "-curly", "-two-segment", "-family",
  "-green-plumage", "-combat", "-hero", "-red-meteor",
];

export function displayName(slug: string) {
  if (SPECIAL_NAMES[slug]) return SPECIAL_NAMES[slug];
  let base = slug;
  for (const suffix of FORM_SUFFIXES) {
    if (base.endsWith(suffix) && base !== suffix.slice(1)) {
      base = base.slice(0, -suffix.length);
      break;
    }
  }
  if (SPECIAL_NAMES[base]) return SPECIAL_NAMES[base];
  return base
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export const titleCase = (slug: string) =>
  slug
    .split(/[-\s]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

// PokéAPI uses hectograms and decimeters
export const formatWeight = (hg: number) => `${(hg / 10).toFixed(1)} kg`;
export const formatHeight = (dm: number) => `${(dm / 10).toFixed(1)} m`;

export const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};
