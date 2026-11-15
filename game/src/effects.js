// Cinder Protocol: Reuse fixed pools for tracers, impact flecks, and floating damage labels.
import * as THREE from 'three';
import { state } from './state.js';
export function createEffects(scene,random){
  const tracers=[],particles=[],labels=[];let ti=0,pi=0,li=0;
  const cube=new THREE.BoxGeometry(.055,.055,.055);
  for(let i=0;i<32;i++){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));const mesh=new THREE.Line(geo,new THREE.LineBasicMaterial({color:'#ffda91',transparent:true,opacity:.8}));mesh.visible=false;scene.add(mesh);tracers.push({mesh,life:0});}
  for(let i=0;i<100;i++){const mesh=new THREE.Mesh(cube,new THREE.MeshBasicMaterial({color:'#f47a68',transparent:true}));mesh.visible=false;scene.add(mesh);particles.push({mesh,v:new THREE.Vector3(),life:0});}
  for(let i=0;i<16;i++){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const texture=new THREE.CanvasTexture(canvas),mesh=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false}));mesh.scale.set(1.1,.55,1);mesh.visible=false;scene.add(mesh);labels.push({mesh,canvas,texture,life:0});}
  function trace(origin,dir,distance){const t=tracers[ti++%tracers.length],a=t.mesh.geometry.attributes.position;a.setXYZ(0,origin.x,origin.y-.06,origin.z);a.setXYZ(1,origin.x+dir.x*distance,origin.y+dir.y*distance,origin.z+dir.z*distance);a.needsUpdate=true;t.life=.065;t.mesh.visible=true;}
  function impact(point,hit,amount,head){for(let j=0;j<6;j++){const p=particles[pi++%particles.length];p.mesh.position.copy(point);p.mesh.material.color.set(hit?'#f47a68':'#ffce89');p.v.set((random()-.5)*3,random()*2,(random()-.5)*3);p.life=.35+random()*.2;p.mesh.visible=true;}
    if(amount){const l=labels[li++%labels.length],c=l.canvas.getContext('2d');c.clearRect(0,0,128,64);c.font='bold 38px monospace';c.textAlign='center';c.fillStyle=head?'#ffcf7b':'#ffffff';c.fillText((head?'⌖ ':'')+Math.round(amount),64,43);l.texture.needsUpdate=true;l.mesh.position.copy(point);l.mesh.position.y+=.4;l.life=.8;l.mesh.visible=true;}
  }
  return {trace,impact,step(dt){for(const t of tracers)if(t.life>0){t.life-=dt;t.mesh.visible=t.life>0;}for(const p of particles)if(p.life>0){p.life-=dt;p.mesh.visible=p.life>0;p.v.y-=5*dt;p.mesh.position.addScaledVector(p.v,dt);p.mesh.material.opacity=Math.min(1,p.life*3);}for(const l of labels)if(l.life>0){l.life-=dt;l.mesh.visible=l.life>0;l.mesh.position.y+=dt*.8;l.mesh.material.opacity=Math.min(1,l.life*3);}},reset(){for(const t of tracers){t.life=0;t.mesh.visible=false;}for(const p of particles){p.life=0;p.mesh.visible=false;}for(const l of labels){l.life=0;l.mesh.visible=false;}state.hit=0;}};
}
