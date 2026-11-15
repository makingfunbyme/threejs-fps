import * as THREE from 'three';
import { PALETTE } from './palette.js';
export const SITES=[{x:8,z:-11,radius:3.2,name:'A'},{x:-10,z:-10,radius:3.1,name:'B'}];
export const ROUTES=[
  [[-12,13],[-12,6],[-11,1],[-11,-5],[-10,-10]],
  [[4,13],[4,7],[-4,5],[-4,-5],[0,-7],[4,-7],[8,-11]],
  [[12.5,13],[12.5,6],[12.5,0],[12.5,-5],[9,-7],[8,-11]],
];
export function createWorld(scene){
  const colliders=[],shootables=[],group=new THREE.Group();scene.add(group);
  const mats={};for(const key in PALETTE)mats[key]=new THREE.MeshStandardMaterial({color:PALETTE[key],roughness:.83,metalness:.16,flatShading:true});
  function box(w,h,d,x,y,z,key,solid=true){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mats[key]);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);if(solid){colliders.push(new THREE.Box3().setFromObject(mesh));shootables.push(mesh);}return mesh;}
  function sign(text,x,y,z,w=4,color=PALETTE.accent){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const c=canvas.getContext('2d');c.fillStyle=PALETTE.canvas;c.fillRect(0,0,1024,256);c.fillStyle=color;c.font='bold 95px monospace';c.fillText(text,35,160);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas)}));m.position.set(x,y,z);group.add(m);return m;}
  function crate(x,z,w=1.6,h=1.4){box(w,h,w,x,h/2,z,'hairline');for(const side of [-1,1]){box(w+.03,.08,.07,x,.18,z+side*w/2,'accent',false);box(w+.03,.08,.07,x,h-.18,z+side*w/2,'canvas',false);}box(.1,h,.06,x-w/2+.16,h/2,z+w/2+.02,'canvas',false);box(.1,h,.06,x+w/2-.16,h/2,z+w/2+.02,'canvas',false);}
  box(30,.4,36,0,-.2,0,'surface');box(.5,5,36,-15,2.5,0,'surface');box(.5,5,36,15,2.5,0,'surface');box(30,5,.5,0,2.5,-18,'surface');box(30,5,.5,0,2.5,18,'surface');
  box(5,4.6,8,0,2.3,0,'canvas');box(1,3.5,6,-7,1.75,1,'hairline');box(3,3.2,5,6,1.6,1,'hairline');
  crate(-10,7,2.3,1.1);crate(10,1,1.7,1.2);crate(-6,-10,1.7,1.4);crate(3,-11,2,1.3);crate(11,-14,1.6,2);crate(-1,10,2,1.2);crate(-12,-1,1.3,1.6);crate(9,7,1.4,1.35);crate(-3,-15,2,1.2);
  // Walkable loading deck and shallow stairs provide a second height without sealing a route.
  box(4,1.2,3,-10,.6,-15,'canvas');for(let i=0;i<4;i++)box(1.5,(i+1)*.3,.65,-10,(i+1)*.15,-11.8-i*.65,'hairline');
  box(.12,.85,3,-12,1.62,-15,'accent',false);box(.12,.85,3,-8,1.62,-15,'accent',false);
  for(let z=-15;z<=15;z+=5){box(.25,5,.35,-14.6,2.5,z,'hairline',false);box(.25,5,.35,14.6,2.5,z,'hairline',false);box(.08,.12,2,-14.42,3,z,'accent',false);}
  for(let z=-3;z<=3;z+=1.5)box(5.06,.1,.16,0,3.8,z,'accent',false);
  box(29,.3,.6,0,5.5,-7,'hairline',false);box(.3,5.5,.6,-13.7,2.75,-7,'hairline');box(.3,5.5,.6,13.7,2.75,-7,'hairline');
  for(let x=-12;x<=12;x+=3)box(.04,.02,32,x,.012,0,'hairline',false);
  for(let z=-16;z<17;z+=2)box(.14,.024,.8,11.5,.02,z,'accent',false);
  for(const site of SITES){const ring=new THREE.Mesh(new THREE.RingGeometry(2.8,2.94,48),mats.accent);ring.rotation.x=-Math.PI/2;ring.position.set(site.x,.035,site.z);group.add(ring);box(.9,.7,.65,site.x,.35,site.z-1,'canvas');box(.65,.04,.42,site.x,.72,site.z-1,'accent',false);sign(site.name+' / UPLINK',site.x,3.1,-17.71,4.5);const lamp=new THREE.PointLight(PALETTE.accent,12,9);lamp.position.set(site.x,3,site.z);scene.add(lamp);}
  sign('RELAY / 07',0,3,4.02,4.7);sign('CINDER INDUSTRIES',-2,4.1,-17.7,6);sign('MID →',6,2.4,3.52,2.8);
  // Distant industrial silhouettes and a shader sky create depth without external textures.
  for(let i=0;i<14;i++){const x=-45+i*7;box(4,8+(i%4)*4,6,x,1,-30-(i%3)*5,'hairline',false);}
  const sky=new THREE.Mesh(new THREE.SphereGeometry(95,24,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{top:{value:new THREE.Color('#344c68')},bottom:{value:new THREE.Color('#d5b994')}},vertexShader:'varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec3 v;uniform vec3 top;uniform vec3 bottom;void main(){gl_FragColor=vec4(mix(bottom,top,smoothstep(-8.0,65.0,v.y)),1.0);}'}));scene.add(sky);
  scene.add(new THREE.HemisphereLight('#d5e7ff','#4a4136',2));const sun=new THREE.DirectionalLight('#ffe4bb',3.1);sun.position.set(-12,24,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-23,right:23,top:25,bottom:-25,far:65});sun.shadow.bias=-.0005;scene.add(sun);
  return {colliders,shootables,group};
}
