import { state, GUNS } from './state.js';
import { SITE } from './world.js';
export function createRounds(player,weapon,bots,grenades) {
  function begin(){
    state.round++;state.attacking=state.round%2===1;state.phase='buy';state.time=18;state.buyOpen=false;state.bought=false;
    state.health=100;state.armor=Math.max(50,state.armor);state.alive=true;state.grenade=Math.max(1,state.grenade);
    player.state.position.set(state.attacking?9:7,0,state.attacking?14:-14);player.state.velocity.set(0,0,0);player.state.yaw=state.attacking?0:Math.PI;player.state.pitch=0;
    if(state.round===1||state.died)weapon.equip(0);else weapon.equip(state.weapon.id);
    state.died=false;state.bomb.planted=false;state.bomb.dropped=false;state.bomb.carrier=-1;state.bomb.timer=36;state.bomb.progress=0;state.bomb.actor=-2;
    bots.reset();grenades.reset();
  }
  function finish(team,reason){if(state.phase!=='live')return;state.winner=team;state.reason=reason;state.scores[team]++;state.money=Math.min(16000,state.money+(team===0?3250:1900));state.died=!state.alive;state.phase=state.scores[team]>=8?'match':'end';state.time=6;state.buyOpen=false;}
  function buy(id){if(state.phase!=='buy'||!state.alive)return;const cost=id<4?GUNS[id].price:id===4?650:300;
    if(state.money<cost){state.message='Insufficient credits';state.messageTime=2;return;}
    if(id===5&&state.grenade>=2){state.message='Maximum two frags';state.messageTime=2;return;}
    if(id===4&&state.armor>=100)return;
    state.money-=cost;if(id<4)weapon.equip(id);else if(id===4)state.armor=100;else state.grenade++;
  }
  function step(dt,keys){
    state.elapsed+=dt;state.messageTime=Math.max(0,state.messageTime-dt);state.hit=Math.max(0,(state.hit||0)-dt);
    if(state.phase==='start'||state.phase==='paused'||state.phase==='match')return;
    state.time-=dt;
    if(state.phase==='buy'){if(state.time<=0){state.phase='live';state.time=95;state.buyOpen=false;}return;}
    if(state.phase==='end'){if(state.time<=0)begin();return;}
    let allies=state.alive?1:0,enemies=0;for(const b of state.bots){if(b.alive){if(b.team===0)allies++;else enemies++;}}
    const attackTeam=state.attacking?0:1,defendTeam=1-attackTeam;
    if(!state.bomb.planted){
      if(allies===0){finish(1,'Squad eliminated');return;}if(enemies===0){finish(0,'Squad eliminated');return;}
      if(state.time<=0){finish(defendTeam,'Uplink secured · time expired');return;}
    }else {
      if((defendTeam===0?allies:enemies)===0){finish(attackTeam,'Defenders eliminated');return;}
      state.bomb.timer-=dt;if(state.bomb.timer<=0){finish(attackTeam,'Uplink detonated');return;}
    }
    let actor=-2;
    const p=player.state.position,bomb=state.bomb;
    if(bomb.dropped){
      for(let i=-1;i<state.bots.length;i++){
        const a=i===-1?state:state.bots[i],team=i===-1?0:a.team,pos=i===-1?p:a.position;
        if(a.alive&&team===attackTeam&&Math.hypot(pos.x-bomb.x,pos.z-bomb.z)<1.6){bomb.carrier=i;bomb.dropped=false;break;}
      }
    }
    const near=Math.hypot(p.x-SITE.x,p.z-SITE.z)<SITE.radius;
    if(state.alive&&near&&keys.has('KeyE')&&(bomb.planted?!state.attacking:state.attacking&&!bomb.dropped&&bomb.carrier===-1))actor=-1;
    for(let i=0;i<state.bots.length;i++){
      const b=state.bots[i];if(!b.alive||Math.hypot(b.position.x-SITE.x,b.position.z-SITE.z)>SITE.radius)continue;
      if(bomb.planted?b.team===defendTeam:b.team===attackTeam&&(!state.attacking||bomb.carrier===i)){actor=i;break;}
    }
    if(actor!==-2){if(bomb.actor!==actor)bomb.progress=0;bomb.actor=actor;bomb.progress+=dt;
      if(bomb.progress>=(bomb.planted?5:3)){
        if(bomb.planted){finish(defendTeam,'Uplink defused');return;}
        bomb.planted=true;bomb.timer=36;bomb.progress=0;bomb.actor=-2;state.message='UPLINK ARMED • 36 SECONDS';state.messageTime=4;
      }
    }else {bomb.progress=0;bomb.actor=-2;}
    // A bot carrying a recovered device drops it on death.
    if(!bomb.planted&&bomb.carrier>=0&&!state.bots[bomb.carrier].alive&&!bomb.dropped){const b=state.bots[bomb.carrier];bomb.dropped=true;bomb.x=b.position.x;bomb.z=b.position.z;}
  }
  return {begin,finish,buy,step};
}
