import { state, GUNS } from './state.js';
import { SITE } from './world.js';
export function createHud() {
  const $=id=>document.getElementById(id),overlay=$('overlay'),buy=$('buy');
  const nodes={};for(const id of ['phase','timer','scores','vitals','credits','ammo','weapon','objective','feed','banner','roster','progress','status'])nodes[id]=$(id);
  let lastFeed='',lastPhase='';
  for(let i=0;i<6;i++){
    const button=document.createElement('button');button.dataset.item=i;
    button.innerHTML=`<span>0${i+1}</span><b>${i<4?GUNS[i].name:i===4?'Ceramic armor':'Fragment grenade'}</b><small>${i<4?'$'+GUNS[i].price:i===4?'$650':'$300'}</small>`;
    buy.querySelector('.stock').appendChild(button);
  }
  function render(){
    const phase=state.phase,gun=GUNS[state.weapon.id];
    nodes.phase.textContent=`ROUND ${String(state.round||1).padStart(2,'0')} / ${state.attacking?'BREACH':'WARDEN'} · ${phase==='buy'?'REQUISITION':phase==='live'?'LIVE':phase.toUpperCase()}`;
    const seconds=Math.ceil(state.bomb.planted?state.bomb.timer:state.time);nodes.timer.textContent=`${Math.floor(Math.max(0,seconds)/60)}:${String(Math.max(0,seconds)%60).padStart(2,'0')}`;
    nodes.timer.classList.toggle('armed',state.bomb.planted);nodes.scores.textContent=`${state.scores[0]}   :   ${state.scores[1]}`;
    nodes.vitals.textContent=`${Math.ceil(state.health)}  HP     ${Math.ceil(state.armor)}  ARM`;
    nodes.credits.textContent=`$${state.money.toLocaleString()}  /  ${state.kills} KILLS`;
    nodes.ammo.textContent=`${state.weapon.mag} / ${state.weapon.reserve}`;nodes.weapon.textContent=`${gun.short}${state.weapon.reloadLeft>0?' • RELOADING':''}   [R]`;
    let living0=state.alive?1:0,living1=0;for(const b of state.bots)if(b.alive){if(b.team)living1++;else living0++;}
    nodes.roster.textContent=`CINDER  ${'◆'.repeat(living0)}${'◇'.repeat(4-living0)}     /     SENTINEL  ${'◆'.repeat(living1)}${'◇'.repeat(4-living1)}`;
    const near=Math.hypot(state.player.position.x-SITE.x,state.player.position.z-SITE.z)<SITE.radius;
    nodes.objective.textContent=state.bomb.planted?'UPLINK ARMED / '+(state.attacking?'Protect the device':'Hold E at A to defuse'):state.bomb.dropped?'DEVICE DROPPED / Recover the uplink':state.attacking?(near?'HOLD [E] TO PLANT · 3 SEC':'CARRYING UPLINK / Reach site A'):'DEFEND SITE A / Stop the uplink';
    nodes.progress.style.width=`${Math.min(100,state.bomb.progress/(state.bomb.planted?5:3)*100)}%`;
    nodes.status.textContent=state.messageTime>0?state.message:!state.alive?'ELIMINATED · Squad still in action':phase==='buy'?'[B] REQUISITIONS • Buy now, deploy when the timer expires':'[G] THROW FRAG · HOLD [F] TRAJECTORY · [E] INTERACT';
    nodes.banner.hidden=phase!=='end'&&phase!=='match';
    if(!nodes.banner.hidden){nodes.banner.querySelector('strong').textContent=phase==='match'?(state.winner===0?'MATCH VICTORY':'MATCH LOST'):(state.winner===0?'ROUND SECURED':'ROUND LOST');nodes.banner.querySelector('p').textContent=`${state.reason} · ${phase==='match'?'Click to play a new match':'Next deployment in '+Math.ceil(state.time)+'s'}`;}
    buy.hidden=!state.buyOpen;buy.querySelector('.balance').textContent=`AVAILABLE  $${state.money.toLocaleString()}`;
    let feed='';for(const f of state.feed)if(state.elapsed-f.time<7)feed+=(feed?'\n':'')+f.text;if(feed!==lastFeed){nodes.feed.textContent=feed;lastFeed=feed;}
    $('hitmarker').classList.toggle('on',state.hit>0);
    if(lastPhase!==phase){overlay.hidden=phase!=='start'&&phase!=='paused';$('overlay-title').textContent=phase==='paused'?'OPERATION PAUSED':'CINDER PROTOCOL';$('play').textContent=phase==='paused'?'RESUME OPERATION':'DEPLOY TO RELAY YARD';lastPhase=phase;}
  }
  return {render,onPlay(fn){$('play').addEventListener('click',fn);},onBuy(fn){buy.addEventListener('click',e=>{const b=e.target.closest('[data-item]');if(b)fn(Number(b.dataset.item));});},onClose(fn){$('close-buy').addEventListener('click',fn);}};
}
