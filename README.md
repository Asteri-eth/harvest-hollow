# Harvest Hollow

A cozy 3D farming game inspired by classic farm and strategy games.

Start with a small homestead, a wheat patch, and a modest budget. Buy animals, place buildings, collect produce, and upgrade your farm. Every structure has three visibly different upgrade levels.

## Features

- An interactive 3D farm with soft shadows, animated animals, and an adjustable camera.
- Chickens, dairy cows, and sheep, each requiring an appropriate home.
- Placeable chicken coops, dairy barns, sheep pastures, windmills, and wheat patches.
- Three building levels with new models, increased capacity, and improved production.
- Wheat planting and harvesting, animal produce, and supply purchases.
- Farm experience, milestone rewards, and recovery seeds if you run out of money.
- Automatic saves in the current browser.

## Run locally

Use **Node.js 24 LTS** and npm.

```sh
git clone https://github.com/Asteri-eth/harvest-hollow.git
cd harvest-hollow
npm ci
npm run dev
```

Open the local address printed by the development server, usually http://localhost:3000.

## How to play

1. Collect the ready wheat to earn your first harvest income.
2. Choose a building in the shop, then click an empty farm square. **Auto-place** can pick a square for you.
3. Buy animals after building their homes.
4. Click buildings to collect produce or upgrade them.
5. Replant wheat, claim journal rewards, and buy wood or stone when needed.

Drag to rotate the farm and scroll to zoom. The **My farm** tab also opens building controls. **Pause** stops production time.

Progress is stored locally in your browser; it is not shared between devices. Production advances while the game is open, and this version does not simulate offline progress.

## Development checks

```sh
node tests/economy.test.mjs
npx tsc --noEmit
npm run build
```

The gameplay suite covers placement, animal housing and capacity, harvest and production cycles, upgrades, milestone rewards, supplies, save recovery, and an empty-wallet recovery path.

## Project structure

| Path | Purpose |
| --- | --- |
| `app/game/FarmGame.tsx` | Game interface and state integration |
| `app/game/model.ts` | Economy and gameplay rules |
| `app/game/scene.ts` | Three.js terrain, buildings, animals, and camera |
| `app/game/webmcp.ts` | Optional structured browser actions |
| `app/globals.css` | Responsive interface styles |
| `components/ui/` | Shared interface components |
| `tests/economy.test.mjs` | Gameplay checks |

Built with React, TypeScript, Three.js, Vinext, and Tailwind CSS.

The included hosting configuration is a blank template with no deployment identifier or credentials.

---

**По-русски:** это 3D-игра про ферму с покупкой животных, строительством и тремя уровнями зданий. Для запуска установите Node.js 24, выполните команды из раздела **Run locally** и откройте адрес, который появится в терминале. Прогресс сохраняется в текущем браузере.
