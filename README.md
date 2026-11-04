# Final Fantasy VII — The Field Guide

An interactive, independently written companion for the **1997 original Final Fantasy VII** and ports of that game.

## Run locally

No installation or build step is required. With Python 3 installed:

```sh
python3 -m http.server 4173 --directory dist
```

Open `http://localhost:4173`. Alternatively, serve `dist/` using any static web host.

## Vercel hosting

The `ff7walkthrough` Vercel project is connected to this repository. `vercel.json` serves `dist/` directly without installing dependencies or running a build. Both the standalone root and `/ff7` are supported; the page sets its asset base to `/ff7/` when mounted there.

The `nws` project owns `nowindowshopping.com`. Its project-level route proxies only `/ff7` and its child paths to `https://ff7walkthrough.vercel.app/ff7/`, preserving the main NWS deployment and existing project routes. The domain retains its existing canonical redirect to `www.nowindowshopping.com`.

Journals are local to each origin. To move a journal from the ChatGPT Sites address, export it from **Journal and settings**, then import the JSON at the new address.

## Visual direction

The interface draws on the 1997 PlayStation release: deep blue menu windows, silver frames, a Meteor-inspired mark, cinematic Midgar artwork and illustrated party portraits. The artwork is original generated fan art, not extracted game graphics. Generation prompts are in `ART_DIRECTION.txt`.

## Mobile use

Phones and small tablets have a fixed Guide / Chapters / Search / More menu, a dismissible chapter drawer, 16px reading text, larger checklist controls, sticky chapter tabs, and single-column collection and breeding tools. Form text stays at least 16px to avoid automatic focus zoom on iOS. Safe-area padding keeps controls clear of notches and home indicators.

## Features

- 33 story chapters, 179 parent objectives and 420 detailed navigation checkpoints.
- Front/rear Shinra HQ entry routes, the lobby, each accessible floor, puzzles and boss preparation.
- 164 chapter inventory entries and a 201-entry item/event register with deadlines, limited steals, recovery notes and personal outcome tracking.
- Earliest recruitment instructions for all nine characters, including Yuffie after Mythril Mine and Vincent at the first Nibelheim visit.
- A dedicated Chocobo handbook, six-stall log, standard-route pairing checker, breeding checklist and four cave rewards.
- Eleven optional quest routes and a searchable collection of 55 useful Materia.
- Focus mode, chapter notes, hidden future chapter names, search and JSON journal export/import.

Progress is browser-local. Backups include objectives, detailed checkpoints, notes, collection checks, item/event outcomes, recruitment goals and stable records. The app does not read or modify game saves. Different hostnames and browsers keep separate journals.

## Files

- `dist/data.js`: main route, optional quests, Materia and base references.
- `dist/extras-data.js`: deadline register, recruitment data and breeding route.
- `dist/detailed-route.js`: detailed navigation and expanded chapter inventories.
- `dist/app.js`: core navigation, rendering, persistence and backup validation.
- `dist/extras-ui.js`: item register, recruitment, stable planner and detailed-checkpoint interactions.
- `dist/style.css`: responsive styling and component layout. `dist/ffvii-theme.css` supplies the original-game visual direction.
- `validate.cjs`: dependency-free data/rendering, state compatibility and breeding-planner checks.

## Validate

Requires Node.js:

```sh
node --check dist/app.js
node --check dist/extras-ui.js
node --check dist/detailed-route.js
node validate.cjs
```

## Editorial scope

The walkthrough is original prose organized around practical navigation, route alternatives, important pickups and event windows. Sources are linked in the app, including the supplied IGN and AbsoluteSteve references, independent guides, and the original BradyGames guide. IGN's page could not be read directly during the initial research; it is retained as the user's reference, not represented as a verified source.

The register distinguishes permanent losses, conditional/limited windows, later recovery routes and optional goals. Browsing a later chapter never automatically declares an item missed. It is not a quantity-perfect inventory audit of every ordinary consumable, nor a version-specific achievement route. Button mappings and some names vary by port. The breeding planner models the standard race-win route; it does not emulate the game's random-number generator or perform RNG manipulation.

## Attribution

Unofficial fan companion, not affiliated with Square Enix. Final Fantasy VII, its characters and game content belong to their respective owners. The interface and walkthrough prose are original. Midgar artwork and character portraits are original generated fan art inspired by the 1997 designs. Linked guides remain with their authors; no book scans or personal photos are bundled.
