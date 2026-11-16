# Cinder Protocol

A round-based tactical FPS built with three.js — my entry for the [make.fun](https://make.fun) threejs-fps bounties.

You play a 4v4 bomb defusal match against bots on an original map, "Relay Yard". Buy weapons each round, plant or defuse the uplink, first team to 8 rounds wins.

## What's in the game

- Round-based 4v4 (you + 3 bot teammates vs 4 bot enemies), first to 8
- Buy menu (B) with 4 weapons, armor, defuse kit; money for kills, round wins and plants
- Bomb: plant at a site (E), defuse (E), frag grenades (G) with real physics
- Recoil patterns per weapon, headshots (2.5x), ADS/scope on the sniper
- Bots that navigate the map, take cover, react to smoke, flank and hold angles
- Procedural WebAudio: per-weapon fire sounds, footsteps, reloads, explosions, planted-bomb alarm
- HUD: health/armor, ammo, money, minimap, kill feed, compass, round timer, streak pips, defuse progress
- Deterministic capture paths for the grader (`?shot=` with a fixed seed)

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

It's all client-side; three.js 0.187.0 is vendored, no build step.

## Controls

| Input | Action |
|---|---|
| WASD | Move |
| Mouse | Look, left click fire, right click ADS/scope |
| R | Reload |
| Ctrl | Crouch |
| Space | Jump |
| B | Buy menu |
| G | Frag grenade |
| F | Grenade trajectory preview |
| E | Plant / defuse |

## Structure

- `game/index.html` — the page and its import map
- `game/src/` — ES modules: `main.js` (boot and loop), `player.js`, `weapon.js`, `combat.js`, `bots.js`, `rounds.js`, `grenades.js`, `hud.js`, `world.js`, `input.js`, `state.js`, `palette.js`, `audio.js`, `effects.js`
- `game/vendor/three/` — three.js 0.187.0, unchanged
- `main.ts` — hands the entry in: copies `game/` and `screenshots/` to `/output` and writes the dossier
- `vendor/makefun-threejs.ts` — the kit's dossier library, unchanged
