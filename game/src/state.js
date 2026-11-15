// Shared match data; rendering resources are managed by the modules that create them.
export const state = {
  phase:'start', previous:'buy', time:20, round:0, scores:[0,0], money:3200,
  attacking:true, buyOpen:false, winner:-1, reason:'', elapsed:0, lossStreak:0,
  health:100, armor:50, alive:true, kills:0, grenade:1, smoke:1, kit:false,
  aiming:false, hit:0, hurt:0, message:'', messageTime:0, died:false,
  bomb:{planted:false, carrier:-1, dropped:false, x:7, z:-11, timer:40, progress:0, actor:-2, site:0, duration:3.5},
  bots:[], feed:[], noise:{x:0,z:0,time:-100,team:0}, projectiles:[], smokes:[],
};
export const GUNS = [
  {name:'Kestrel / sidearm',short:'KESTREL',price:0,damage:29,gap:.24,mag:12,reserve:60,spread:.0017,recoil:.016,reload:1.25,pattern:[0,.2,-.3,.4,-.1]},
  {name:'Wisp / submachine',short:'WISP',price:1200,damage:23,gap:.075,mag:32,reserve:128,spread:.004,recoil:.011,reload:1.65,pattern:[0,.1,.2,.4,.6,.3,-.4,-.6,-.3]},
  {name:'Vandal / assault rifle',short:'VANDAL',price:2500,damage:37,gap:.11,mag:25,reserve:100,spread:.001,recoil:.021,reload:1.95,pattern:[0,0,.1,.2,.4,.6,.7,.3,-.3,-.6,-.6,-.2]},
  {name:'Longglass / marksman',short:'LONGGLASS',price:4200,damage:90,gap:1.05,mag:5,reserve:25,spread:.0004,recoil:.062,reload:2.5,pattern:[0,.2,-.2]},
];
export function randomGenerator(seed){let a=seed|0;return ()=>{a=(a+0x6d2b79f5)|0;let t=Math.imul(a^a>>>15,1|a);t=(t+Math.imul(t^t>>>7,61|t))^t;return ((t^t>>>14)>>>0)/4294967296;};}
