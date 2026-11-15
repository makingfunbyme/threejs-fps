// Allocation-free ray tests against world geometry and articulated actor hit boxes.
import * as THREE from 'three';
import { state, GUNS } from './state.js';
export function createCombat(world,random) {
  const ray=new THREE.Ray(), point=new THREE.Vector3(), box=new THREE.Box3(), dir=new THREE.Vector3();
  function wallDistance(origin,direction,max=100){ray.set(origin,direction);let best=max;for(const b of world.colliders){if(ray.intersectBox(b,point)){const d=origin.distanceTo(point);if(d<best)best=d;}}return best;}
  function damage(actor,amount,attacker,head=false){
    if(!actor.alive)return;
    const armor=actor.armor||0, absorbed=Math.min(armor,amount*.35);actor.armor=Math.max(0,armor-absorbed);actor.health-=amount-absorbed;
    if(actor.health>0)return;
    actor.health=0;actor.alive=false;
    const victim=actor===state?'YOU':actor.name;
    const name=attacker===state?'YOU':attacker?.name||'FRAG';
    state.feed.unshift({text:`${name}  ${head?'⌖':'›'}  ${victim}`,time:state.elapsed});if(state.feed.length>5)state.feed.pop();
    if(attacker===state&&actor.team===1){state.money+=300;state.kills++;}
    if(actor===state&&state.attacking&&!state.bomb.planted){state.bomb.dropped=true;state.bomb.x=state.player.position.x;state.bomb.z=state.player.position.z;}
    if(actor.group){actor.group.rotation.z=Math.PI/2;actor.group.position.y=.2;}
  }
  function fire(origin,direction,shooter,damageValue,spread){
    dir.copy(direction);dir.x+=(random()-.5)*spread*2;dir.y+=(random()-.5)*spread*2;dir.z+=(random()-.5)*spread*2;dir.normalize();
    let best=wallDistance(origin,dir), victim=null, head=false;
    ray.set(origin,dir);
    for(let i=-1;i<state.bots.length;i++){
      const a=i===-1?state:state.bots[i];if(a===shooter||!a.alive)continue;
      const pos=i===-1?state.player.position:a.position;const height=i===-1?(state.player.crouching?1.12:1.72):1.72;
      for(let part=0;part<2;part++){
        const r=part===1?.19:.29;box.min.set(pos.x-r,pos.y+(part===1?height-.34:.3),pos.z-r);box.max.set(pos.x+r,pos.y+(part===1?height:height-.34),pos.z+r);
        if(ray.intersectBox(box,point)){const d=origin.distanceTo(point);if(d<best){best=d;victim=a;head=part===1;}}
      }
    }
    if(victim){damage(victim,damageValue*(head?3.5:1),shooter,head);if(shooter===state)state.hit=.12;}
    state.noise.x=origin.x;state.noise.z=origin.z;state.noise.time=state.elapsed;state.noise.team=shooter===state?0:shooter.team;
    return !!victim;
  }
  function visible(origin,target){dir.subVectors(target,origin);const d=dir.length();dir.multiplyScalar(1/(d||1));return wallDistance(origin,dir,d)>=d-.05;}
  return {fire,damage,visible,wallDistance};
}
