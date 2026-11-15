import * as THREE from 'three';
import { state } from './state.js';
import { PALETTE } from './palette.js';
export function createGrenades(scene,world,combat) {
  const origin=new THREE.Vector3(),target=new THREE.Vector3();
  // Fixed pool: all geometry and trajectory samples are created once.
  for(let i=0;i<4;i++){
    const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(.13,1),new THREE.MeshStandardMaterial({color:PALETTE.accent}));mesh.visible=false;scene.add(mesh);
    const blast=new THREE.Mesh(new THREE.SphereGeometry(1,16,8),new THREE.MeshBasicMaterial({color:PALETTE.accent,wireframe:true,transparent:true,opacity:.6}));blast.visible=false;scene.add(blast);
    state.projectiles.push({mesh,blast,velocity:new THREE.Vector3(),active:false,fuse:0,fade:0});
  }
  const points=new Float32Array(60*3),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(points,3));
  const arc=new THREE.Line(geo,new THREE.LineBasicMaterial({color:PALETTE.accent,transparent:true,opacity:.5}));scene.add(arc);
  function throwFrag(camera){if(!state.grenade||!state.alive)return;for(const p of state.projectiles){if(p.active||p.fade>0)continue;p.active=true;p.fuse=1.8;p.mesh.visible=true;p.mesh.position.copy(camera.position);camera.getWorldDirection(p.velocity);p.velocity.multiplyScalar(12);p.velocity.y+=4;state.grenade--;break;}}
  function step(dt){for(const p of state.projectiles){
    if(p.fade>0){p.fade=Math.max(0,p.fade-dt);p.blast.visible=p.fade>0;p.blast.scale.setScalar((1-p.fade/.45)*6);p.blast.material.opacity=p.fade;}
    if(!p.active)continue;p.fuse-=dt;p.velocity.y-=13*dt;
    origin.copy(p.mesh.position);p.mesh.position.addScaledVector(p.velocity,dt);
    for(const c of world.colliders){if(c.max.y<.1)continue;if(c.containsPoint(p.mesh.position)){p.mesh.position.copy(origin);p.velocity.x*=-.55;p.velocity.z*=-.55;break;}}
    if(p.mesh.position.y<.15){p.mesh.position.y=.15;p.velocity.y=Math.abs(p.velocity.y)*.45;p.velocity.x*=.8;p.velocity.z*=.8;}
    if(p.fuse<=0){p.active=false;p.mesh.visible=false;p.fade=.45;p.blast.position.copy(p.mesh.position);
      for(let i=-1;i<state.bots.length;i++){const a=i===-1?state:state.bots[i];if(!a.alive)continue;target.copy(i===-1?state.player.position:a.position);target.y+=.8;const d=target.distanceTo(p.mesh.position);if(d<6&&combat.visible(p.mesh.position,target))combat.damage(a,135*(1-d/6),state);}
      state.noise.x=p.mesh.position.x;state.noise.z=p.mesh.position.z;state.noise.time=state.elapsed;state.noise.team=0;
    }
  }}
  function preview(camera,show){arc.visible=show&&state.grenade>0&&state.alive;if(!arc.visible)return;
    camera.getWorldDirection(target);target.multiplyScalar(12);target.y+=4;
    for(let i=0;i<60;i++){const t=i/35;points[i*3]=camera.position.x+target.x*t;points[i*3+1]=Math.max(.08,camera.position.y+target.y*t-6.5*t*t);points[i*3+2]=camera.position.z+target.z*t;}geo.attributes.position.needsUpdate=true;
  }
  function reset(){for(const p of state.projectiles){p.active=false;p.fade=0;p.mesh.visible=p.blast.visible=false;}}
  return {step,throwFrag,preview,reset};
}
