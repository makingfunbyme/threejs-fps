// Run a fixed-step match, or render a seeded capture and signal window.__shotReady.
import * as THREE from 'three';
import { state,GUNS,randomGenerator } from './state.js';
import { PALETTE } from './palette.js';
import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { createInput } from './input.js';
import { createWeapon } from './weapon.js';
import { createCombat } from './combat.js';
import { createBots } from './bots.js';
import { createGrenades } from './grenades.js';
import { createRounds } from './rounds.js';
import { createHud } from './hud.js';
import { createAudio } from './audio.js';
import { createEffects } from './effects.js';
const params=new URLSearchParams(location.search),shot=params.get('shot'),seed=parseInt(params.get('seed')||'1',10)||1,random=randomGenerator(seed);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;document.getElementById('game').appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(PALETTE.sky);scene.fog=new THREE.Fog(PALETTE.sky,24,76);
const camera=new THREE.PerspectiveCamera(76,innerWidth/innerHeight,.04,120);scene.add(camera);
const world=createWorld(scene),player=createPlayer(world.colliders);state.player=player.state;
const audio=createAudio(randomGenerator(seed+917)),effects=createEffects(scene,randomGenerator(seed+337)),weapon=createWeapon(camera,audio),combat=createCombat(world,random,effects,audio),bots=createBots(scene,world,combat,random,audio),grenades=createGrenades(scene,world,combat,audio),rounds=createRounds(player,weapon,bots,grenades,effects,audio),hud=createHud();
const direction=new THREE.Vector3(),emptyKeys=new Set();let accumulator=0,last=performance.now();
const input=createInput(renderer.domElement,locked=>{if(shot)return;if(locked){audio.unlock();if(state.phase==='start')rounds.begin();else if(state.phase==='paused')state.phase=state.previous;}else if(!state.buyOpen&&!['start','match','paused'].includes(state.phase)){state.previous=state.phase;state.phase='paused';}hud.render();});
function sync(){const p=player.state;camera.position.set(p.position.x,p.position.y+(state.alive?p.eye:.55),p.position.z);camera.rotation.set(Math.min(1.5,p.pitch+effects.cameraKick),p.yaw,0,'YXZ');const target=state.aiming?(state.weapon.id===3?32:58):76;if(camera.fov!==target){camera.fov=target;camera.updateProjectionMatrix();}}
function closeBuy(){state.buyOpen=false;if(!shot)input.requestLock();}
hud.onPlay(()=>{audio.unlock();if(!shot)input.requestLock();});hud.onBuy(rounds.buy);hud.onClose(closeBuy);
window.addEventListener('click',e=>{if(state.phase==='match'&&e.target===renderer.domElement){state.scores[0]=state.scores[1]=0;state.round=0;state.money=3200;state.lossStreak=0;state.kills=0;state.feed.length=0;state.armor=50;state.died=true;rounds.begin();input.requestLock();}});
function step(dt){const c=input.state,pressed=c.pressed;
  if(pressed.has('KeyB')&&state.phase==='buy'){state.buyOpen=!state.buyOpen;if(state.buyOpen&&document.pointerLockElement)document.exitPointerLock();else if(!shot)input.requestLock();}
  if(state.buyOpen){for(let i=1;i<=8;i++)if(pressed.has('Digit'+i))rounds.buy(i-1);}
  state.aiming=c.aiming&&c.locked&&!state.buyOpen&&state.alive;
  if((state.phase==='live'||state.phase==='buy')&&state.alive&&c.locked&&!state.buyOpen){
    player.look(c.lookX,c.lookY,state.aiming);c.lookX=c.lookY=0;
    if(state.phase==='live')player.step(dt,c.keys,state.aiming);sync();
    for(let i=1;i<=4;i++)if(pressed.has('Digit'+i))weapon.switchTo(i-1);
    if(pressed.has('KeyR'))weapon.reload();
    if(state.phase==='live'){
      if(player.state.onGround&&!player.state.crouching&&!c.keys.has('ShiftLeft')&&player.groundSpeed()>2.5)audio.step(state.elapsed);
      if(pressed.has('KeyG'))grenades.throwFrag(camera);if(pressed.has('KeyX'))grenades.throwSmoke(camera);
      if(c.firing&&weapon.ready()&&state.bomb.progress===0){const gun=GUNS[state.weapon.id],burst=state.weapon.burst;camera.getWorldDirection(direction);combat.fire(camera.position,direction,state,gun.damage,weapon.spread(player.groundSpeed(),player.state.crouching,!player.state.onGround));weapon.fire();effects.eject(camera,state.weapon.id);const scale=state.aiming?.65:1;player.recoil(gun.recoil*(.65+Math.min(burst,8)*.075)*scale,gun.pattern[burst%gun.pattern.length]*gun.recoil*scale);}
    }
  }else c.lookX=c.lookY=0;
  if(state.phase==='live'){bots.step(dt);grenades.step(dt);}
  if(!['paused','start'].includes(state.phase)){weapon.step(dt);effects.step(dt);}
  const wasBuy=state.phase==='buy';rounds.step(dt,c.locked&&!state.buyOpen?c.keys:emptyKeys);
  audio.update(dt,state.bomb.planted&&state.phase==='live',state.bomb.timer);
  if(wasBuy&&state.phase==='live'&&!c.locked&&!shot){state.previous='live';state.phase='paused';}
  pressed.clear();
}
function draw(){sync();grenades.preview(camera,input.state.keys.has('KeyF')&&state.phase==='live');hud.render();renderer.render(scene,camera);}
function frame(now){requestAnimationFrame(frame);accumulator+=Math.min(.1,(now-last)/1000);last=now;while(accumulator>=1/60){step(1/60);accumulator-=1/60;}draw();}
function capture(name){
  if(name==='start'){player.state.position.set(10,0,13);player.state.yaw=.15;player.state.pitch=-.02;bots.reset();}
  else {rounds.begin();weapon.equip(2);state.money=4700;
    if(name==='play'){state.phase='live';state.time=68;player.state.position.set(10,0,-3);player.state.yaw=.13;player.state.pitch=-.015;state.bots[3].position.set(8,0,-10);state.bots[4].position.set(5,0,-14);state.bots[5].position.set(10,0,-14);state.bots[0].position.set(11.5,0,-5);state.weapon.mag=19;state.feed.push({text:'ROOK  ›  SABLE',time:0});}
    else if(name==='end'){state.phase='end';state.winner=0;state.reason='Uplink detonated at A';state.scores[0]=1;state.time=5;player.state.position.set(10,0,-4);}
    else {state.phase='buy';state.buyOpen=true;}
  }
  weapon.step(0);let paints=0;function paint(){draw();if(++paints===3){window.__shotReady=true;return;}requestAnimationFrame(paint);}requestAnimationFrame(paint);
}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
sync();hud.render();if(shot)capture(shot);else requestAnimationFrame(frame);
