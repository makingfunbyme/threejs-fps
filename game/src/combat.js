// Cinder Protocol: Resolve hits against world geometry before applying enemy damage.
import * as THREE from 'three';
import { state } from './state.js';
export function createCombat(world,random,effects,audio){
  const ray=new THREE.Ray(),point=new THREE.Vector3(),box=new THREE.Box3(),dir=new THREE.Vector3(),impact=new THREE.Vector3();
  function wallDistance(origin,direction,max=100){ray.set(origin,direction);let best=max;for(const b of world.colliders)if(ray.intersectBox(b,point)){const d=origin.distanceTo(point);if(d<best)best=d;}return best;}
  function smokeBlocked(origin,target){const dx=target.x-origin.x,dy=target.y-origin.y,dz=target.z-origin.z,len=dx*dx+dy*dy+dz*dz;for(const s of state.smokes){if(s.life<=0)continue;const p=s.mesh.position,t=Math.max(0,Math.min(1,((p.x-origin.x)*dx+(p.y-origin.y)*dy+(p.z-origin.z)*dz)/(len||1)));if(Math.hypot(origin.x+dx*t-p.x,origin.y+dy*t-p.y,origin.z+dz*t-p.z)<s.radius*.88)return true;}return false;}
  function damage(actor,amount,attacker,head=false){if(!actor.alive)return;const absorbed=Math.min(actor.armor||0,amount*.35);actor.armor=Math.max(0,(actor.armor||0)-absorbed);actor.health=Math.max(0,actor.health-amount+absorbed);if(actor===state)state.hurt=.4;if(actor.health>0)return;actor.alive=false;
    state.feed.unshift({text:`${attacker===state?'YOU':attacker?.name||'UPLINK'}  ${head?'⌖':'›'}  ${actor===state?'YOU':actor.name}`,time:state.elapsed});if(state.feed.length>5)state.feed.pop();
    if(attacker===state&&actor.team===1){state.money=Math.min(16000,state.money+300);state.kills++;}
    if(actor===state&&state.attacking&&!state.bomb.planted&&state.bomb.carrier===-1){state.bomb.dropped=true;state.bomb.x=state.player.position.x;state.bomb.z=state.player.position.z;}
    if(actor.group)actor.fall=0;
  }
  function fire(origin,direction,shooter,value,spread){dir.copy(direction);dir.x+=(random()-.5)*spread*2;dir.y+=(random()-.5)*spread*2;dir.z+=(random()-.5)*spread*2;dir.normalize();let best=wallDistance(origin,dir),victim=null,head=false;ray.set(origin,dir);
    const team=shooter===state?0:shooter.team;
    for(let i=-1;i<state.bots.length;i++){const a=i===-1?state:state.bots[i];if(!a.alive||(i===-1?0:a.team)===team)continue;const p=i===-1?state.player.position:a.position,h=i===-1?state.player.height:1.72;
      for(let part=0;part<2;part++){const r=part?.19:.29;box.min.set(p.x-r,p.y+(part?h-.34:.25),p.z-r);box.max.set(p.x+r,p.y+(part?h:h-.34),p.z+r);if(ray.intersectBox(box,point)){const d=origin.distanceTo(point);if(d<best){best=d;victim=a;head=!!part;}}}
    }
    impact.copy(origin).addScaledVector(dir,best);effects.trace(origin,dir,best);const amount=value*(head?2.5:1);
    if(best<99)effects.impact(impact,!!victim,shooter===state&&victim?amount:0,head);
    if(victim){damage(victim,amount,shooter,head);if(shooter===state){state.hit=.14;audio.hit();}}
    state.noise.x=origin.x;state.noise.z=origin.z;state.noise.time=state.elapsed;state.noise.team=team;
  }
  function visible(origin,target){if(smokeBlocked(origin,target))return false;dir.subVectors(target,origin);const d=dir.length();dir.multiplyScalar(1/(d||1));return wallDistance(origin,dir,d)>=d-.04;}
  return {fire,damage,visible,wallDistance};
}
