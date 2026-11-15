// Weapon slots preserve ammunition independently when switching loadouts.
// The firing loop repeats each gun’s horizontal recoil pattern by burst index;
// releasing the trigger lets burst recovery restore first-shot accuracy.
import * as THREE from 'three';
import { PALETTE } from './palette.js';
import { state,GUNS } from './state.js';
export function createWeapon(camera,audio){
  const dark=new THREE.MeshStandardMaterial({color:PALETTE.canvas,metalness:.7,roughness:.36}),steel=new THREE.MeshStandardMaterial({color:PALETTE.hairline,metalness:.6,roughness:.4}),accent=new THREE.MeshStandardMaterial({color:PALETTE.accent,metalness:.5,roughness:.4});
  const model=new THREE.Group();camera.add(model);
  function part(w,h,d,x,y,z,mat){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);model.add(mesh);return mesh;}
  part(.13,.14,.46,0,0,0,steel);part(.05,.05,.45,0,.02,-.4,dark);part(.1,.13,.24,0,-.01,.3,dark);part(.075,.22,.1,0,-.15,.06,dark);part(.08,.2,.16,0,-.15,-.15,accent);part(.055,.04,.16,0,.1,-.05,dark);part(.025,.04,.025,0,.105,-.46,accent);
  for(let i=0;i<5;i++)part(.14,.025,.025,0,.085,-.2+i*.045,dark);
  const scope=part(.09,.09,.25,0,.14,-.03,dark),hands=part(.14,.13,.23,.03,-.2,.17,steel);
  const flash=new THREE.Mesh(new THREE.OctahedronGeometry(.12),new THREE.MeshBasicMaterial({color:'#ffe3a0'}));flash.position.set(0,.02,-.67);model.add(flash);const light=new THREE.PointLight('#ffb653',0,4);light.position.copy(flash.position);model.add(light);
  const slots=GUNS.map((g,i)=>({owned:i===0,mag:g.mag,reserve:g.reserve}));
  const s=state.weapon={id:0,mag:12,reserve:60,cooldown:0,reloadLeft:0,flash:0,kick:0,burst:0,recovery:0,slots};
  function save(){slots[s.id].mag=s.mag;slots[s.id].reserve=s.reserve;}
  function switchTo(id){if(!slots[id].owned||id===s.id)return;save();s.id=id;s.mag=slots[id].mag;s.reserve=slots[id].reserve;s.reloadLeft=0;s.cooldown=.24;s.burst=0;model.scale.z=id===0?.65:id===3?1.35:1;scope.visible=id===3;}
  function equip(id){save();slots[id].owned=true;slots[id].mag=GUNS[id].mag;slots[id].reserve=GUNS[id].reserve;if(id!==s.id)switchTo(id);else{s.mag=slots[id].mag;s.reserve=slots[id].reserve;}s.reloadLeft=0;s.cooldown=0;}
  function reset(dead){if(dead){for(let i=1;i<4;i++)slots[i].owned=false;s.id=0;}for(let i=0;i<4;i++){slots[i].mag=GUNS[i].mag;slots[i].reserve=GUNS[i].reserve;}s.mag=GUNS[s.id].mag;s.reserve=GUNS[s.id].reserve;s.burst=0;s.reloadLeft=0;s.cooldown=0;model.scale.z=s.id===0?.65:s.id===3?1.35:1;scope.visible=s.id===3;}
  scope.visible=false;
  return {state:s,model,equip,switchTo,reset,ready(){return s.mag>0&&s.cooldown<=0&&s.reloadLeft<=0;},
    fire(){s.mag--;s.cooldown=GUNS[s.id].gap;s.flash=.05;s.kick=.065;s.burst++;s.recovery=.24;audio.shot(s.id);},
    reload(){if(!s.reloadLeft&&s.mag<GUNS[s.id].mag&&s.reserve){s.reloadLeft=GUNS[s.id].reload;audio.reload();}},
    spread(speed,crouch,air){return (GUNS[s.id].spread+speed*.0044+Math.min(s.burst,14)*.0015+(air?.045:0))*(crouch?.55:1)*(state.aiming?.38:1);},
    step(dt){s.cooldown=Math.max(0,s.cooldown-dt);s.flash=Math.max(0,s.flash-dt);s.recovery-=dt;if(s.recovery<=0)s.burst=0;s.kick*=Math.max(0,1-dt*13);
      const speed=Math.hypot(state.player.velocity.x,state.player.velocity.z),bob=Math.sin(state.elapsed*10)*Math.min(speed,5)*.0018;
      model.position.set(state.aiming?.025:.26,(state.aiming?-.18:-.27)+Math.abs(bob),-.48+s.kick);model.rotation.set(s.kick*2,Math.sin(state.elapsed*5)*.004*speed,bob*.8);hands.visible=!state.aiming;model.visible=state.alive;flash.visible=s.flash>0;light.intensity=s.flash>0?7:0;
      if(s.reloadLeft>0){s.reloadLeft=Math.max(0,s.reloadLeft-dt);model.rotation.z=-.35;model.rotation.x=-.5;model.position.y-=.08*Math.sin(s.reloadLeft/GUNS[s.id].reload*Math.PI);if(!s.reloadLeft){const n=Math.min(GUNS[s.id].mag-s.mag,s.reserve);s.mag+=n;s.reserve-=n;audio.reload();}}
    }};
}
