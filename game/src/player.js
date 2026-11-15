// Resolve movement per axis; preserve crouch height beneath low ceilings.
import * as THREE from 'three';
export function createPlayer(colliders){
  const p={position:new THREE.Vector3(9,0,14),velocity:new THREE.Vector3(),yaw:0,pitch:0,eye:1.6,height:1.72,onGround:true,crouching:false};
  const probe=new THREE.Box3(),wish=new THREE.Vector3();
  function overlap(x,y,z,height,lift){probe.min.set(x-.32,y+lift,z-.32);probe.max.set(x+.32,y+height-lift,z+.32);for(const c of colliders)if(probe.intersectsBox(c))return c;return null;}
  function step(dt,keys,aiming=false){
    const crouch=keys.has('ControlLeft')||keys.has('ControlRight')||keys.has('KeyC');
    if(crouch){p.crouching=true;p.height=1.12;}else if(!overlap(p.position.x,p.position.y,p.position.z,1.72,.025)){p.crouching=false;p.height=1.72;}
    p.eye+=((p.crouching?1.02:1.6)-p.eye)*Math.min(1,dt*14);
    const forward=Number(keys.has('KeyW'))-Number(keys.has('KeyS')),side=Number(keys.has('KeyD'))-Number(keys.has('KeyA'));
    const sin=Math.sin(p.yaw),cos=Math.cos(p.yaw);wish.set(-sin*forward+cos*side,0,-cos*forward-sin*side);if(wish.lengthSq())wish.normalize();
    const speed=p.crouching?2.3:aiming?3.2:keys.has('ShiftLeft')?2.7:5.1,blend=Math.min(1,(p.onGround?13:3)*dt);
    p.velocity.x+=(wish.x*speed-p.velocity.x)*blend;p.velocity.z+=(wish.z*speed-p.velocity.z)*blend;
    if(keys.has('Space')&&p.onGround){p.velocity.y=6.3;p.onGround=false;}
    p.velocity.y-=20*dt;
    const nx=p.position.x+p.velocity.x*dt,nz=p.position.z+p.velocity.z*dt;
    if(!overlap(nx,p.position.y,p.position.z,p.height,.04))p.position.x=nx;else p.velocity.x=0;
    if(!overlap(p.position.x,p.position.y,nz,p.height,.04))p.position.z=nz;else p.velocity.z=0;
    p.position.y+=p.velocity.y*dt;p.onGround=false;const hit=overlap(p.position.x,p.position.y,p.position.z,p.height,0);
    if(hit&&p.velocity.y<=0){p.position.y=hit.max.y;p.velocity.y=0;p.onGround=true;}else if(hit){p.position.y=hit.min.y-p.height;p.velocity.y=0;}
    if(p.position.y<0){p.position.y=0;p.velocity.y=0;p.onGround=true;}
  }
  return {state:p,step,look(dx,dy,aim=false){p.yaw-=dx*(aim?.00125:.0021);p.pitch=Math.max(-1.45,Math.min(1.45,p.pitch-dy*(aim?.00125:.0021)));},recoil(up,side){p.pitch=Math.min(1.45,p.pitch+up);p.yaw+=side;},groundSpeed(){return Math.hypot(p.velocity.x,p.velocity.z);}};
}
