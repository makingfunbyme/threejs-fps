// Route navigation and visibility checks share the combat collision model.
import * as THREE from 'three';
import { PALETTE } from './palette.js';
import { state } from './state.js';
import { ROUTES,SITES } from './world.js';
export function createBots(scene,world,combat,random,audio){
  const torsoGeo=new THREE.BoxGeometry(.5,.68,.33),headGeo=new THREE.BoxGeometry(.32,.32,.32),legGeo=new THREE.BoxGeometry(.17,.65,.22),origin=new THREE.Vector3(),target=new THREE.Vector3(),direction=new THREE.Vector3();
  const names=['MICA','ROOK','FERN','SABLE','HEX','ASH','KITE'];
  for(let i=0;i<7;i++){const team=i<3?0:1,group=new THREE.Group(),mat=new THREE.MeshStandardMaterial({color:team?PALETTE.enemy:PALETTE.friendly,roughness:.7}),dark=new THREE.MeshStandardMaterial({color:PALETTE.canvas});
    const torso=new THREE.Mesh(torsoGeo,mat),head=new THREE.Mesh(headGeo,mat);torso.position.y=1.05;head.position.y=1.56;group.add(torso,head);
    const visor=new THREE.Mesh(new THREE.BoxGeometry(.34,.09,.05),dark);visor.position.set(0,1.58,-.18);group.add(visor);
    const legs=[];for(const side of [-1,1]){const leg=new THREE.Mesh(legGeo,dark);leg.position.set(side*.15,.35,0);group.add(leg);legs.push(leg);}
    const gun=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.65),dark);gun.position.set(.3,1.12,-.3);group.add(gun);group.traverse(m=>{if(m.isMesh)m.castShadow=true;});scene.add(group);
    state.bots.push({name:names[i],team,group,legs,position:group.position,health:100,armor:35,alive:true,route:i%3,node:0,cooldown:0,reaction:0,hold:0,think:0,target:null,lastX:0,lastZ:0,heard:0,fall:0,kit:i%2===0,peek:i%2?1:-1});
  }
  function reset(){for(let i=0;i<state.bots.length;i++){const b=state.bots[i],attack=b.team===(state.attacking?0:1),r=ROUTES[b.route],p=r[attack?0:r.length-1];b.position.set(p[0]+(attack?0:(i%2)*.65),0,p[1]);b.group.rotation.set(0,attack?0:Math.PI,0);b.alive=true;b.health=100;b.armor=35;b.node=attack?1:r.length-2;b.cooldown=.6+random();b.target=null;b.reaction=0;b.hold=0;b.think=0;b.heard=0;b.fall=0;}}
  function move(b,x,z,dt,speed=2.7){const dx=x-b.position.x,dz=z-b.position.z,d=Math.hypot(dx,dz);if(d<.3)return true;const step=Math.min(d,dt*speed),nx=b.position.x+dx/d*step,nz=b.position.z+dz/d*step;let bx=false,bz=false;
    for(const c of world.colliders){if(c.max.y<.1)continue;if(nx+.31>c.min.x&&nx-.31<c.max.x&&b.position.z+.31>c.min.z&&b.position.z-.31<c.max.z)bx=true;if(b.position.x+.31>c.min.x&&b.position.x-.31<c.max.x&&nz+.31>c.min.z&&nz-.31<c.max.z)bz=true;}
    if(!bx)b.position.x=nx;if(!bz)b.position.z=nz;b.group.rotation.y=Math.atan2(-dx,-dz);b.legs[0].rotation.x=Math.sin(state.elapsed*10)*.3;b.legs[1].rotation.x=-b.legs[0].rotation.x;return false;
  }
  function step(dt){for(const b of state.bots){if(!b.alive){b.fall=Math.min(1,b.fall+dt*3);b.group.rotation.z=b.fall*1.5;continue;}b.cooldown-=dt;b.think-=dt;b.hold-=dt;origin.copy(b.position);origin.y+=1.5;
    if(b.think<=0){b.think=.15+random()*.1;let nearest=34;b.target=null;
      for(let i=-1;i<state.bots.length;i++){const enemy=i===-1?state:state.bots[i];if(!enemy.alive||(i===-1?0:enemy.team)===b.team)continue;target.copy(i===-1?state.player.position:enemy.position);target.y+=1.2;const dist=origin.distanceTo(target);if(dist<nearest&&combat.visible(origin,target)){nearest=dist;b.target=enemy;}}
      if(!b.target&&state.elapsed-state.noise.time<1.2&&state.noise.team!==b.team&&Math.hypot(b.position.x-state.noise.x,b.position.z-state.noise.z)<19){b.lastX=state.noise.x;b.lastZ=state.noise.z;b.heard=2.5;}
    }
    if(b.target&&b.target.alive){target.copy(b.target===state?state.player.position:b.target.position);target.y+=1.2;direction.subVectors(target,origin).normalize();b.reaction+=dt;
      if(Math.sin(state.elapsed*2+b.route)>.55)move(b,b.position.x+direction.z*b.peek,b.position.z-direction.x*b.peek,dt,1.1);
      b.group.rotation.y=Math.atan2(-direction.x,-direction.z);
      if(b.cooldown<=0&&b.reaction>.36&&combat.visible(origin,target)){combat.fire(origin,direction,b,18,.035+origin.distanceTo(target)*.001);b.cooldown=.23+random()*.2;if(origin.distanceTo(state.player.position)<20)audio.shot(2,true);}continue;
    }
    b.reaction=0;const attack=b.team===(state.attacking?0:1),site=SITES[state.bomb.site];
    if(state.bomb.planted){if(!attack)move(b,site.x,site.z,dt);else if(Math.hypot(b.position.x-site.x,b.position.z-site.z)>5)move(b,site.x+3,site.z+2,dt);continue;}
    if(attack&&state.bomb.dropped){move(b,state.bomb.x,state.bomb.z,dt);continue;}
    if(b.heard>0){b.heard-=dt;move(b,b.lastX,b.lastZ,dt);continue;}
    if(b.hold>0)continue;const route=ROUTES[b.route],p=route[b.node];if(move(b,p[0],p[1],dt)){if(attack&&b.node<route.length-1)b.node++;else if(!attack&&b.node>2){b.node--;b.hold=1.6+random()*2;}}
  }}
  return {reset,step};
}
