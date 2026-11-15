import * as THREE from 'three';
import { PALETTE } from './palette.js';
import { state, GUNS } from './state.js';
export function createWeapon(camera) {
  const dark=new THREE.MeshStandardMaterial({color:PALETTE.canvas,metalness:.65,roughness:.4});
  const light=new THREE.MeshStandardMaterial({color:PALETTE.hairline,metalness:.55,roughness:.4});
  const accent=new THREE.MeshStandardMaterial({color:PALETTE.accent,metalness:.4,roughness:.35});
  const model=new THREE.Group();camera.add(model);
  function part(w,h,d,x,y,z,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);model.add(m);return m;}
  part(.13,.14,.46,0,0,0,light);part(.05,.05,.45,0,.02,-.4,dark);part(.1,.13,.25,0,-.01,.3,dark);
  part(.075,.22,.1,0,-.15,.06,dark);part(.08,.2,.16,0,-.15,-.15,accent);part(.055,.05,.16,0,.1,-.05,dark);
  part(.025,.04,.025,0,.105,-.46,accent);
  const flash=new THREE.Mesh(new THREE.OctahedronGeometry(.12),new THREE.MeshBasicMaterial({color:PALETTE.accent}));flash.position.set(0,.02,-.67);model.add(flash);
  const s=state.weapon={id:0,mag:12,reserve:60,cooldown:0,reloadLeft:0,flash:0,kick:0,burst:0,recovery:0};
  function equip(id){s.id=id;s.mag=GUNS[id].mag;s.reserve=GUNS[id].reserve;s.reloadLeft=0;s.cooldown=0;s.burst=0;model.scale.z=id===0?.65:id===3?1.35:1;}
  return {state:s,equip,model,
    ready(){return s.mag>0&&s.cooldown<=0&&s.reloadLeft<=0;},
    fire(){const gun=GUNS[s.id];s.mag--;s.cooldown=gun.gap;s.flash=.045;s.kick=.055;s.burst++;s.recovery=.22;},
    reload(){if(!s.reloadLeft&&s.mag<GUNS[s.id].mag&&s.reserve)s.reloadLeft=GUNS[s.id].reload;},
    spread(speed,crouch,air){return (GUNS[s.id].spread+speed*.006+Math.min(s.burst,12)*.0016+(air?.045:0))*(crouch?.55:1);},
    step(dt){s.cooldown=Math.max(0,s.cooldown-dt);s.flash=Math.max(0,s.flash-dt);s.recovery-=dt;if(s.recovery<=0)s.burst=0;
      s.kick*=Math.max(0,1-dt*13);model.position.set(.26,-.25,-.48+s.kick);model.rotation.x=s.kick*2;
      model.visible=state.alive;flash.visible=s.flash>0;
      if(s.reloadLeft>0){s.reloadLeft=Math.max(0,s.reloadLeft-dt);model.rotation.x=-.5;if(!s.reloadLeft){const n=Math.min(GUNS[s.id].mag-s.mag,s.reserve);s.mag+=n;s.reserve-=n;}}
    }};
}
