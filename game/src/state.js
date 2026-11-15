// All mutable match state. Rendering modules keep only scene resources.
export const state = {
  phase: 'start', previous: 'buy', time: 18, round: 0, scores: [0, 0], money: 3200,
  attacking: true, bought: false, buyOpen: false, winner: -1, reason: '', elapsed: 0,
  health: 100, armor: 50, alive: true, kills: 0, grenade: 1,
  bomb: { planted: false, carrier: -1, dropped: false, x: 0, z: 0, timer: 36, progress: 0, actor: -2 },
  bots: [], feed: [], noise: { x: 0, z: 0, time: -100, team: 0 },
  projectiles: [], effects: [], message: '', messageTime: 0,
};
export const GUNS = [
  { name: 'Kestrel / pistol', short: 'KESTREL', price: 0, damage: 28, gap: .23, mag: 12, reserve: 60, spread: .002, recoil: .018, reload: 1.35 },
  { name: 'Wisp / SMG', short: 'WISP', price: 1200, damage: 23, gap: .075, mag: 32, reserve: 128, spread: .005, recoil: .012, reload: 1.65 },
  { name: 'Vandal / rifle', short: 'VANDAL', price: 2500, damage: 36, gap: .105, mag: 25, reserve: 100, spread: .0015, recoil: .021, reload: 1.9 },
  { name: 'Longglass / sniper', short: 'LONGGLASS', price: 4200, damage: 88, gap: 1.1, mag: 5, reserve: 25, spread: .0003, recoil: .065, reload: 2.5 },
];
export function randomGenerator(seed) {
  let a = seed | 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
