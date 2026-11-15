// Cinder Protocol: Track held keys separately from presses consumed by the fixed simulation step.
export function createInput(canvas,onLockChange){
  const keys=new Set(),pressed=new Set();
  const state={keys,pressed,locked:false,firing:false,aiming:false,lookX:0,lookY:0};
  function clear(){keys.clear();pressed.clear();state.firing=state.aiming=false;state.lookX=state.lookY=0;}
  window.addEventListener('keydown',e=>{if(!keys.has(e.code))pressed.add(e.code);keys.add(e.code);if(['Space','Tab','KeyB'].includes(e.code))e.preventDefault();});
  window.addEventListener('keyup',e=>keys.delete(e.code));
  window.addEventListener('blur',clear);
  window.addEventListener('mousemove',e=>{if(state.locked){state.lookX+=e.movementX;state.lookY+=e.movementY;}});
  window.addEventListener('mousedown',e=>{if(state.locked){if(e.button===0)state.firing=true;if(e.button===2)state.aiming=true;}});
  window.addEventListener('mouseup',e=>{if(e.button===0)state.firing=false;if(e.button===2)state.aiming=false;});
  window.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('pointerlockchange',()=>{state.locked=document.pointerLockElement===canvas;if(!state.locked)clear();onLockChange(state.locked);});
  return {state,requestLock(){const result=canvas.requestPointerLock();if(result?.catch)result.catch(()=>{});}};
}
