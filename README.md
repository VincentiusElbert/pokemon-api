# Pokédex

A fast Pokédex for all 1,025 Pokémon, built with React, TypeScript, Vite and Tailwind CSS on top of [PokéAPI](https://pokeapi.co).

Live demo: https://pokedex-api-elbert.vercel.app/

## Features

- **Search:** by name or number, with live suggestions, keyboard navigation and typo tolerance ("pikchu" still finds Pikachu)
- **Filters:** by type (pick two for dual types, e.g. Fire + Flying), by generation, and by favorites. Sort by number or name. Filters are kept in the URL, so any view can be shared.
- **Detail pages:**
  - colors themed by the Pokémon's primary type, a shiny artwork toggle and its cry
  - base stats on the real 0–255 scale, with the total
  - size in kg and m, gender ratio, catch rate, egg groups and friendship
  - abilities with descriptions, with the hidden ability marked
  - type matchups (weaknesses, resistances and immunities), combined across both types
  - the full evolution tree, including branches like Eevee and how each stage evolves
  - level-up moves with type, category, power, accuracy and PP
  - previous / next navigation, also with the ← → keys
- **Favorites**, saved in your browser
- **Fast:** the list loads every Pokémon and their types in 19 requests, cached for a week. Artwork loads lazily, and each request is fetched only once per visit.

## How it works

- `src/services/api.ts` holds the data layer: a request cache, the Pokédex index and the detail model.
  - The index combines `/pokemon?limit=1025` with the 18 `/type/{type}` endpoints. Those give every Pokémon's types and the type chart, so search and filters work across the whole Pokédex without a request per card.
- `src/lib/search.ts` ranks results: exact number, name prefix, name contains, then close typos (edit distance).
- Detail data (`/pokemon`, `/pokemon-species`, `/evolution-chain`) loads on demand. Ability and move details load lazily.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command           | What it does                        |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start the dev server                |
| `npm run build`   | Type-check and build for production |
| `npm run preview` | Preview the production build        |
| `npm run lint`    | Lint the project                    |

`vercel.json` rewrites every route to `index.html`, so detail pages work when opened directly.

Pokémon and Pokémon names are trademarks of Nintendo. Data from PokéAPI.
