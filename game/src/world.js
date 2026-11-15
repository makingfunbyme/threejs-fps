import * as THREE from 'three';
import { PALETTE } from './palette.js';
export const SITE = { x: 7, z: -11, radius: 3.3 };
// Routes deliberately skirt every solid block; reverse them for the defenders.
export const ROUTES = [
  [[-12,12],[-12,5],[-10,-3],[-10,-10],[-4,-13],[3,-13],[7,-11]],
  [[4,12],[4,7],[-4,5],[-4,-5],[0,-7],[4,-7],[7,-11]],
  [[12.8,12],[12.8,5],[12.8,-3],[10,-5],[10,-7],[7,-11]],
];
export function createWorld(scene) {
  const colliders = [], shootables = [], group = new THREE.Group(); scene.add(group);
  const materials = {};
  for (const key in PALETTE) materials[key] = new THREE.MeshStandardMaterial({ color: PALETTE[key], roughness: .83, metalness: .12 });
  function box(w,h,d,x,y,z,key,solid = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), materials[key]);
    mesh.position.set(x,y,z); mesh.castShadow = mesh.receiveShadow = true; group.add(mesh);
    if (solid) { colliders.push(new THREE.Box3().setFromObject(mesh)); shootables.push(mesh); }
    return mesh;
  }
  box(29,.4,35,0,-.2,0,'surface');
  box(.6,5,35,-14.5,2.5,0,'surface'); box(.6,5,35,14.5,2.5,0,'surface');
  box(29,5,.6,0,2.5,-17.5,'surface'); box(29,5,.6,0,2.5,17.5,'surface');
  // Main relay building, west service wall, east turbine bank.
  box(5,4.6,8,0,2.3,0,'canvas'); box(1,3.5,6,-7,1.75,1,'hairline');
  box(3,3.2,5,6,1.6,1,'hairline');
  box(3,1.15,1.3,-10,.575,7,'hairline'); box(2,1.2,2,10,.6,1,'hairline');
  box(2,1.1,2,-6,.55,-10,'hairline'); box(2,1.3,2,3,.65,-11,'hairline');
  box(3,1.1,1,0,.55,10,'hairline'); box(1.4,2,1.4,11,1,-13,'hairline');
  // Architectural trim, ribs, illuminated conduits and an overhead gantry.
  for (let z=-15;z<=15;z+=5) {
    box(.22,5,.3,-14.1,2.5,z,'hairline',false); box(.22,5,.3,14.1,2.5,z,'hairline',false);
    box(.08,.14,3,-14.12,2.9,z,'accent',false);
  }
  for (let z=-3;z<=3;z+=1.5) box(5.08,.12,.12,0,3.8,z,'accent',false);
  box(28,.3,.6,0,5.4,-7,'hairline',false);
  box(.3,5.4,.6,-12,2.7,-7,'hairline'); box(.3,5.4,.6,12,2.7,-7,'hairline');
  for (let x=-12;x<=12;x+=3) box(.08,.03,28,x,.018,0,'hairline',false);
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.8,3.05,64),materials.accent);
  ring.rotation.x=-Math.PI/2; ring.position.set(SITE.x,.035,SITE.z); group.add(ring);
  box(1.1,.7,.7,7,.35,-12,'canvas'); box(.85,.04,.5,7,.72,-12,'accent',false);
  function sign(text,x,y,z,w=4) {
    const canvas=document.createElement('canvas'); canvas.width=1024; canvas.height=256;
    const ctx=canvas.getContext('2d'); ctx.fillStyle=PALETTE.canvas;ctx.fillRect(0,0,1024,256);
    ctx.fillStyle=PALETTE.accent;ctx.font='bold 100px monospace';ctx.fillText(text,35,158);
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas)}));mesh.position.set(x,y,z);group.add(mesh);
  }
  sign('RELAY / 07',0,3.1,4.02,4.7); sign('A • UPLINK',7,3,-17.16,5); sign('CINDER INDUSTRIES',-6,4,-17.15,7);
  scene.add(new THREE.HemisphereLight(PALETTE.ink,PALETTE.canvas,2));
  const sun=new THREE.DirectionalLight(PALETTE.ink,2.7);sun.position.set(-8,20,12);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048); Object.assign(sun.shadow.camera,{left:-22,right:22,top:24,bottom:-24,far:60});sun.shadow.bias=-.0004;scene.add(sun);
  const lamp=new THREE.PointLight(PALETTE.accent,25,12);lamp.position.set(7,4,-11);scene.add(lamp);
  return {colliders,shootables,group};
}
