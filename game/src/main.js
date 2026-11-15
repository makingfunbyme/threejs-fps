// Fixed 60 Hz simulation; rendering never advances gameplay. Deterministic captures freeze after two paints.
import * as THREE from 'three';
import { PALETTE } from './palette.js';
import { state, GUNS, randomGenerator } from './state.js';
import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { createInput } from './input.js';
import { createWeapon } from './weapon.js';
import { createCombat } from './combat.js';
import { createBots } from './bots.js';
import { createGrenades } from './grenades.js';
import { createRounds } from './rounds.js';
import { createHud } from './hud.js';
const params=new URLSearchParams(location.search),shot=params.get('shot'),random=randomGenerator(parseInt(params.get('seed')||'1',10)||1);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;document.getElementById('game').appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(PALETTE.sky);scene.fog=new THREE.Fog(PALETTE.sky,25,65);
const camera=new THREE.PerspectiveCamera(76,innerWidth/innerHeight,.04,110);scene.add(camera);
const world=createWorld(scene),player=createPlayer(world.colliders);state.player=player.state;
const weapon=createWeapon(camera),combat=createCombat(world,random),bots=createBots(scene,world,combat,random),grenades=createGrenades(scene,world,combat),rounds=createRounds(player,weapon,bots,grenades),hud=createHud();
const direction=new THREE.Vector3(),emptyKeys=new Set();let accumulator=0,last=performance.now();
const input=createInput(renderer.domElement,locked=>{
  if(shot)return;
  if(locked){if(state.phase==='start'){rounds.begin();}else if(state.phase==='paused')state.phase=state.previous;}
  else if(!state.buyOpen&&state.phase!=='start'&&state.phase!=='match'){state.previous=state.phase;state.phase='paused';}
  hud.render();
});
function sync(){const p=player.state;camera.position.set(p.position.x,p.position.y+p.eye,p.position.z);camera.rotation.set(p.pitch,p.yaw,0,'YXZ');const fov=input.state.aiming&&state.weapon.id===3?32:76;if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}}
function closeBuy(){state.buyOpen=false;if(!shot)input.requestLock();}
hud.onPlay(()=>{if(!shot)input.requestLock();});hud.onBuy(rounds.buy);hud.onClose(closeBuy);
window.addEventListener('click',e=>{if(state.phase==='match'&&e.target===renderer.domElement){state.scores[0]=state.scores[1]=0;state.round=0;state.money=3200;rounds.begin();input.requestLock();}});
function step(dt){
  const controls=input.state,pressed=controls.pressed;
  if(pressed.has('KeyB')&&state.phase==='buy'){state.buyOpen=!state.buyOpen;if(state.buyOpen&&document.pointerLockElement)document.exitPointerLock();else if(!shot)input.requestLock();}
  if(state.buyOpen){for(let i=1;i<=6;i++)if(pressed.has('Digit'+i))rounds.buy(i-1);}
  if(state.phase==='live'&&state.alive&&controls.locked&&!state.buyOpen){
    player.look(controls.lookX,controls.lookY);controls.lookX=controls.lookY=0;
    player.step(dt,controls.keys);sync();
    if(controls.keys.has('KeyR'))weapon.reload();
    if(pressed.has('KeyG'))grenades.throwFrag(camera);
    if(controls.firing&&weapon.ready()){
      const gun=GUNS[state.weapon.id],burst=state.weapon.burst;
      camera.getWorldDirection(direction);combat.fire(camera.position,direction,state,gun.damage,weapon.spread(player.groundSpeed(),player.state.crouching,!player.state.onGround));
      weapon.fire();player.recoil(gun.recoil*(.6+Math.min(burst,7)*.09),Math.sin(burst*1.7)*gun.recoil*.45);
    }
  }else {controls.lookX=controls.lookY=0;}
  if(state.phase==='live'){scene.updateMatrixWorld(true);bots.step(dt);grenades.step(dt);}
  if(state.phase!=='paused'&&state.phase!=='start')weapon.step(dt);
  const wasBuy=state.phase==='buy';rounds.step(dt,controls.locked?controls.keys:emptyKeys);if(wasBuy&&state.phase==='live'&&!controls.locked&&!shot){state.previous='live';state.phase='paused';}pressed.clear();
}
function draw(){sync();grenades.preview(camera,input.state.keys.has('KeyF')&&state.phase==='live');hud.render();renderer.render(scene,camera);}
function frame(now){requestAnimationFrame(frame);accumulator+=Math.min(.1,(now-last)/1000);last=now;while(accumulator>=1/60){step(1/60);accumulator-=1/60;}draw();}
function capture(name){
  if(name==='start'){player.state.position.set(10,0,13);player.state.yaw=.15;player.state.pitch=-.02;bots.reset();}
  else {rounds.begin();weapon.equip(2);state.money=4700;
    if(name==='play'){
      state.phase='live';state.time=68;player.state.position.set(10,0,-3);player.state.yaw=.13;player.state.pitch=-.015;
      state.bots[3].position.set(8,0,-10);state.bots[4].position.set(5,0,-14);state.bots[5].position.set(10,0,-14);
      state.bots[0].position.set(11.5,0,-5);state.weapon.mag=19;state.feed.push({text:'ROOK  ›  SABLE',time:0});
    }else {state.phase='buy';state.winner=0;state.reason='Uplink detonated';state.scores[0]=1;state.time=5;player.state.position.set(10,0,-4);state.buyOpen=true;}
  }
  let count=0;function paint(){draw();if(++count===2){window.__shotReady=true;return;}requestAnimationFrame(paint);}requestAnimationFrame(paint);
}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
sync();hud.render();if(shot)capture(shot);else requestAnimationFrame(frame);
