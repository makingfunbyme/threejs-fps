// Cache HUD elements once and render their values from shared match state.
import { state,GUNS } from './state.js';
import { SITES } from './world.js';
export function createHud(){
  const $=id=>document.getElementById(id),nodes={};for(const id of ['overlay','buy','phase','timer','scores','vitals','credits','ammo','weapon','objective','feed','banner','roster','progress','status','hitmarker','crosshair','damage','map-player','map-bomb','slots'])nodes[id]=$(id);
  const labels=['','','','','Ceramic armor','Fragmentation grenade','Smoke canister','Defuse kit'],costs=[0,1200,2500,4200,650,300,300,400];let lastPhase='';
  for(let i=0;i<8;i++){const b=document.createElement('button');b.dataset.item=i;b.innerHTML=`<span>0${i+1}</span><b>${i<4?GUNS[i].name:labels[i]}</b><small>$${costs[i]}</small>`;nodes.buy.querySelector('.stock').appendChild(b);}
  const slotNodes=[];for(let i=0;i<4;i++){const el=document.createElement('span');el.textContent=`${i+1} ${GUNS[i].short}`;nodes.slots.appendChild(el);slotNodes.push(el);}
  return {render(){const phase=state.phase,w=state.weapon,bomb=state.bomb;
    nodes.phase.textContent=`ROUND ${String(state.round||1).padStart(2,'0')} / ${state.attacking?'ATTACK':'DEFEND'} · ${phase==='buy'?'REQUISITION':phase.toUpperCase()}`;
    const secs=Math.max(0,Math.ceil(bomb.planted?bomb.timer:state.time));nodes.timer.textContent=`${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`;nodes.timer.classList.toggle('armed',bomb.planted);nodes.scores.textContent=`${state.scores[0]}   :   ${state.scores[1]}`;
    nodes.vitals.textContent=`${Math.ceil(state.health)} HP   /   ${Math.ceil(state.armor)} ARM`;nodes.credits.textContent=`$${state.money.toLocaleString()}   ·   ${state.kills} KILLS${state.kit?'   ·   KIT':''}`;
    nodes.ammo.textContent=`${w.mag} / ${w.reserve}`;nodes.weapon.textContent=GUNS[w.id].short+(w.reloadLeft>0?' / RELOADING':' / '+(state.aiming?'ADS':'READY TO FIRE'));
    let a=state.alive?1:0,b=0;for(const bot of state.bots)if(bot.alive){if(bot.team)b++;else a++;}nodes.roster.textContent=`CINDER ${'◆'.repeat(a)}${'◇'.repeat(4-a)}  /  SENTINEL ${'◆'.repeat(b)}${'◇'.repeat(4-b)}`;
    const p=state.player.position;let near='';for(const s of SITES)if(Math.hypot(p.x-s.x,p.z-s.z)<s.radius)near=s.name;
    nodes.objective.textContent=bomb.planted?`ARMED / ${SITES[bomb.site].name} · ${state.attacking?'Protect the uplink':'Hold E to defuse · '+(state.kit?'3.5':'7')+'s'}`:bomb.dropped?'DEVICE DROPPED / Recover the uplink':state.attacking?(near?'HOLD E / PLANT AT '+near+' · 3.5s':'CARRYING UPLINK / Choose A or B'):'HOLD A + B / Deny the uplink';nodes.progress.style.width=`${Math.min(100,bomb.progress/bomb.duration*100)}%`;
    nodes.status.textContent=state.messageTime>0?state.message:!state.alive?'ELIMINATED / Your squad is still fighting':phase==='buy'?'B / REQUISITIONS     ENTER / READY UP':`G / FRAG ${state.grenade}     X / SMOKE ${state.smoke}     E / INTERACT`;
    nodes.banner.hidden=phase!=='end'&&phase!=='match';if(!nodes.banner.hidden){nodes.banner.querySelector('strong').textContent=phase==='match'?(state.winner===0?'MATCH VICTORY':'MATCH LOST'):(state.winner===0?'ROUND SECURED':'ROUND LOST');nodes.banner.querySelector('p').textContent=state.reason+' · '+(phase==='match'?'Click to redeploy':Math.ceil(state.time)+'s to next round');}
    nodes.buy.hidden=!state.buyOpen;nodes.buy.querySelector('.balance').textContent=`AVAILABLE $${state.money.toLocaleString()} / EQUIPMENT PERSISTS ON SURVIVAL`;
    for(const button of nodes.buy.querySelectorAll('[data-item]'))button.disabled=costs[Number(button.dataset.item)]>state.money;
    let feed='';for(const f of state.feed)if(state.elapsed-f.time<7)feed+=(feed?'\n':'')+f.text;nodes.feed.textContent=feed;
    nodes.hitmarker.classList.toggle('on',state.hit>0);nodes.damage.style.opacity=String(state.hurt*1.5);nodes.crosshair.style.transform=`translate(-50%,-50%) scale(${state.aiming?.65:1+Math.min(w.burst,10)*.06+Math.hypot(state.player.velocity.x,state.player.velocity.z)*.07})`;
    nodes['map-player'].style.left=((p.x+15)/30*100)+'%';nodes['map-player'].style.top=((p.z+18)/36*100)+'%';nodes['map-player'].style.transform=`translate(-50%,-50%) rotate(${-state.player.yaw}rad)`;nodes['map-bomb'].hidden=!bomb.planted&&!bomb.dropped;nodes['map-bomb'].style.left=((bomb.x+15)/30*100)+'%';nodes['map-bomb'].style.top=((bomb.z+18)/36*100)+'%';
    for(let i=0;i<4;i++){slotNodes[i].classList.toggle('active',i===w.id);slotNodes[i].classList.toggle('owned',w.slots[i].owned);}
    if(lastPhase!==phase){nodes.overlay.hidden=phase!=='start'&&phase!=='paused';$('overlay-title').textContent=phase==='paused'?'OPERATION PAUSED':'CINDER PROTOCOL';$('play').textContent=phase==='paused'?'RESUME OPERATION':'DEPLOY TO RELAY YARD';lastPhase=phase;}
  },onPlay(fn){$('play').addEventListener('click',fn);},onBuy(fn){nodes.buy.addEventListener('click',e=>{const b=e.target.closest('[data-item]');if(b)fn(Number(b.dataset.item));});},onClose(fn){$('close-buy').addEventListener('click',fn);}};
}
