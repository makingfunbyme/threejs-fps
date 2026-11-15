# Cinder Protocol

A round-based tactical first-person shooter built on three.js, made as an entry for [make.fun](https://make.fun).

Two teams, eight rounds to win, a bomb to plant and defuse, a money economy and a buy menu, recoil and headshots. Original map (Relay Yard), art and names.

[![make.fun · threejs-fps-02](https://make.fun/badge/threejs-fps-02.svg)](https://make.fun/bounty/threejs-fps-02?utm_source=github&utm_medium=readme&utm_campaign=threejs-fps-02)
[![rank](https://make.fun/badge/threejs-fps-02/makingfunbyme/threejs-fps/rank.svg)](https://make.fun/bounty/threejs-fps-02/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=threejs-fps-02)
[![reward](https://make.fun/badge/threejs-fps-02/makingfunbyme/threejs-fps/reward.svg)](https://make.fun/bounty/threejs-fps-02?utm_source=github&utm_medium=readme&utm_campaign=threejs-fps-02)

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Controls: WASD move, mouse look, left click fire, right click scope, R reload, Ctrl crouch, Space jump, B buy menu, G frag grenade, F trajectory, E interact (plant/defuse).

## Structure

- `game/index.html` — the page and its import map
- `game/src/` — ES modules: `main.js` (boot and loop), `player.js`, `weapon.js`, `combat.js`, `bots.js`, `rounds.js`, `grenades.js`, `hud.js`, `world.js`, `input.js`, `state.js`, `palette.js`
- `game/vendor/three/` — three.js 0.187.0, unchanged
- `main.ts` — hands the entry in: copies `game/` and `screenshots/` to `/output` and writes the dossier
- `vendor/makefun-threejs.ts` — the kit's dossier library, unchanged
