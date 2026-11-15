import * as THREE from 'three';
import { PALETTE } from './palette.js';
import { state } from './state.js';
import { ROUTES, SITE } from './world.js';
export function createBots(scene,world,combat,random) {
  const geometry=new THREE.BoxGeometry(.5,.68,.33), headGeo=new THREE.BoxGeometry(.32,.32,.32);
  const origin=new THREE.Vector3(),targetPoint=new THREE.Vector3(),direction=new THREE.Vector3();
  const names=['MICA','ROOK','FERN','SABLE','HEX','ASH','KITE'];
  for(let i=0;i<7;i++){
    const team=i<3?0:1,group=new THREE.Group();
    const mat=new THREE.MeshStandardMaterial({color:team?PALETTE.enemy:PALETTE.friendly,roughness:.7});
    const dark=new THREE.MeshStandardMaterial({color:PALETTE.canvas,roughness:.85});
    const torso=new THREE.Mesh(geometry,mat);torso.position.y=1.05;
    const head=new THREE.Mesh(headGeo,mat);head.position.y=1.56;
    const visor=new THREE.Mesh(new THREE.BoxGeometry(.34,.09,.05),dark);visor.position.set(0,1.58,-.18);
    group.add(torso,head,visor);
    for(let side=-1;side<=1;side+=2){const leg=new THREE.Mesh(new THREE.BoxGeometry(.17,.65,.22),dark);leg.position.set(side*.15,.35,0);group.add(leg);}
    const gun=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.65),dark);gun.position.set(.3,1.12,-.3);group.add(gun);
    group.traverse(m=>{if(m.isMesh)m.castShadow=true;});scene.add(group);
    state.bots.push({name:names[i],team,group,position:group.position,health:100,armor:35,alive:true,route:i%3,node:0,cooldown:0,reaction:0,hold:0,think:0,target:null,lastX:0,lastZ:0,heard:0});
  }
  function reset(){
    for(let i=0;i<state.bots.length;i++){
      const b=state.bots[i],attack=b.team===(state.attacking?0:1),r=ROUTES[b.route],p=r[attack?0:r.length-1];
      b.position.set(p[0]+(attack?0:(i%3-1)*.8+(i===6?1.4:0)),0,p[1]);b.group.rotation.set(0,attack?0:Math.PI,0);b.alive=true;b.health=100;b.armor=35;b.node=attack?1:r.length-2;b.cooldown=.5+random();b.target=null;b.hold=0;b.think=0;b.heard=0;
    }
  }
  function move(b,x,z,dt){
    const dx=x-b.position.x,dz=z-b.position.z,d=Math.hypot(dx,dz);if(d<.25)return true;
    const step=Math.min(d,dt*2.8),nx=b.position.x+dx/d*step,nz=b.position.z+dz/d*step;
    let blockX=false,blockZ=false;
    for(const c of world.colliders){if(c.max.y<.1)continue;
      if(nx+.32>c.min.x&&nx-.32<c.max.x&&b.position.z+.32>c.min.z&&b.position.z-.32<c.max.z)blockX=true;
      if(b.position.x+.32>c.min.x&&b.position.x-.32<c.max.x&&nz+.32>c.min.z&&nz-.32<c.max.z)blockZ=true;
    }
    if(!blockX)b.position.x=nx;if(!blockZ)b.position.z=nz;b.group.rotation.y=Math.atan2(-dx,-dz);return false;
  }
  function step(dt){
    for(const b of state.bots){if(!b.alive)continue;b.cooldown-=dt;b.think-=dt;b.hold-=dt;
      origin.copy(b.position);origin.y=1.5;
      if(b.think<=0){
        b.think=.15+random()*.12;let nearest=40;b.target=null;
        for(let i=-1;i<state.bots.length;i++){
          const enemy=i===-1?state:state.bots[i],team=i===-1?0:enemy.team;if(!enemy.alive||team===b.team)continue;
          targetPoint.copy(i===-1?state.player.position:enemy.position);targetPoint.y+=1.2;
          const dist=origin.distanceTo(targetPoint);if(dist<nearest&&combat.visible(origin,targetPoint)){nearest=dist;b.target=enemy;}
        }
        if(!b.target&&state.elapsed-state.noise.time<1.2&&state.noise.team!==b.team&&Math.hypot(b.position.x-state.noise.x,b.position.z-state.noise.z)<18){b.lastX=state.noise.x;b.lastZ=state.noise.z;b.heard=3;}
      }
      if(b.target&&b.target.alive){
        const enemy=b.target;targetPoint.copy(enemy===state?state.player.position:enemy.position);targetPoint.y+=1.15;
        direction.subVectors(targetPoint,origin).normalize();b.group.rotation.y=Math.atan2(-direction.x,-direction.z);
        b.reaction+=dt;if(b.cooldown<=0&&b.reaction>.3&&combat.visible(origin,targetPoint)){combat.fire(origin,direction,b,19,.045+origin.distanceTo(targetPoint)*.0008);b.cooldown=.22+random()*.22;}
        continue;
      }
      b.reaction=0;
      const attack=b.team===(state.attacking?0:1);
      // Defenders converge on an armed uplink. Attackers hold the planted device.
      if(state.bomb.planted){if(!attack)move(b,SITE.x,SITE.z,dt);continue;}
      if(b.heard>0){b.heard-=dt;move(b,b.lastX,b.lastZ,dt);continue;}
      const route=ROUTES[b.route],p=route[b.node];
      if(b.hold>0)continue;
      if(move(b,p[0],p[1],dt)){
        if(attack){if(b.node<route.length-1)b.node++;}
        else if(b.node>2){b.node--;b.hold=1.5+random()*2;}
      }
    }
  }
  return {reset,step};
}
