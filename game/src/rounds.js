// Own round transitions, equipment purchases, and uplink interaction progress.
import { state,GUNS } from './state.js';
import { SITES } from './world.js';
export function createRounds(player,weapon,bots,grenades,effects,audio){
  function begin(){state.round++;state.attacking=state.round%2===1;state.phase='buy';state.time=18;state.buyOpen=false;state.health=100;state.armor=state.died?0:state.armor;state.alive=true;if(state.died)state.kit=false;state.grenade=Math.max(1,state.grenade);state.smoke=Math.max(1,state.smoke);weapon.reset(state.died||state.round===1);state.died=false;
    const p=player.state;p.position.set(state.attacking?9:8,0,state.attacking?14:-14);p.velocity.set(0,0,0);p.yaw=state.attacking?0:Math.PI;p.pitch=0;
    Object.assign(state.bomb,{planted:false,carrier:state.attacking?-1:3,dropped:false,x:7,z:-11,timer:40,progress:0,actor:-2,site:0,duration:3.5});bots.reset();grenades.reset();effects.reset();audio.beep();
  }
  function finish(team,reason){if(state.phase!=='live')return;state.winner=team;state.reason=reason;state.scores[team]++;if(team===0){state.lossStreak=0;state.money+=3250;}else{state.money+=1400+500*Math.min(state.lossStreak,4);state.lossStreak++;}state.money=Math.min(16000,state.money);state.died=!state.alive;state.phase=state.scores[team]>=8?'match':'end';state.time=6;state.buyOpen=false;audio.beep();}
  function buy(id){if(state.phase!=='buy'||!state.alive||id<0||id>7)return;const cost=id<4?GUNS[id].price:id===4?650:id===7?400:300;
    if(state.money<cost){state.message='INSUFFICIENT CREDITS';state.messageTime=2;return;}
    if((id===4&&state.armor>=100)||(id===5&&state.grenade>=2)||(id===6&&state.smoke>=2)||(id===7&&state.kit)){state.message='EQUIPMENT ALREADY FULL';state.messageTime=2;return;}
    state.money-=cost;if(id<4)weapon.equip(id);else if(id===4)state.armor=100;else if(id===5)state.grenade++;else if(id===6)state.smoke++;else state.kit=true;audio.reload();
  }
  function step(dt,keys){if(state.phase==='paused'||state.phase==='start')return;state.elapsed+=dt;state.messageTime=Math.max(0,state.messageTime-dt);state.hit=Math.max(0,state.hit-dt);state.hurt=Math.max(0,state.hurt-dt);if(state.phase==='match')return;state.time-=dt;
    if(state.phase==='buy'){if(state.time<=0||keys.has('Enter')){state.phase='live';state.time=100;state.buyOpen=false;audio.beep();}return;}
    if(state.phase==='end'){if(state.time<=0)begin();return;}
    let allies=state.alive?1:0,enemies=0;for(const b of state.bots)if(b.alive){if(b.team===0)allies++;else enemies++;}
    const attack=state.attacking?0:1,defend=1-attack,bomb=state.bomb,p=player.state.position;
    if(!bomb.planted){if(allies===0){finish(1,'Cinder squad eliminated');return;}if(enemies===0){finish(0,'Sentinel squad eliminated');return;}if(state.time<=0){finish(defend,'Relay secured · time expired');return;}}
    else {if((defend===0?allies:enemies)===0){finish(attack,'Defenders eliminated');return;}bomb.timer-=dt;if(bomb.timer<=0){audio.boom();finish(attack,'Uplink detonated at '+SITES[bomb.site].name);return;}}
    if(!bomb.planted&&bomb.carrier>=0&&!state.bots[bomb.carrier].alive&&!bomb.dropped){const b=state.bots[bomb.carrier];bomb.dropped=true;bomb.x=b.position.x;bomb.z=b.position.z;}
    if(bomb.dropped)for(let i=-1;i<state.bots.length;i++){const a=i===-1?state:state.bots[i],pos=i===-1?p:a.position;if(a.alive&&(i===-1?0:a.team)===attack&&Math.hypot(pos.x-bomb.x,pos.z-bomb.z)<1.6){bomb.carrier=i;bomb.dropped=false;break;}}
    let actor=-2,siteIndex=bomb.site;
    for(let i=-1;i<state.bots.length;i++){const a=i===-1?state:state.bots[i],team=i===-1?0:a.team,pos=i===-1?p:a.position;if(!a.alive||(i===-1&&!keys.has('KeyE'))||(i>=0&&a.target?.alive))continue;
      if(bomb.planted?team!==defend:team!==attack||bomb.dropped||bomb.carrier!==i)continue;
      for(let s=0;s<SITES.length;s++){const site=SITES[s];if(bomb.planted&&s!==bomb.site)continue;if(Math.hypot(pos.x-site.x,pos.z-site.z)<(bomb.planted?2.3:site.radius)){actor=i;siteIndex=s;break;}}if(actor!==-2)break;
    }
    if(actor===-2){bomb.progress=0;bomb.actor=-2;return;}
    if(bomb.actor!==actor)bomb.progress=0;bomb.actor=actor;bomb.site=siteIndex;bomb.duration=bomb.planted?((actor===-1?state.kit:state.bots[actor].kit)?3.5:7):3.5;bomb.progress+=dt;
    if(bomb.progress>=bomb.duration){if(bomb.planted){finish(defend,'Uplink defused at '+SITES[bomb.site].name);return;}bomb.planted=true;bomb.timer=40;bomb.progress=0;bomb.actor=-2;bomb.x=SITES[siteIndex].x;bomb.z=SITES[siteIndex].z;state.message='UPLINK ARMED AT '+SITES[siteIndex].name;state.messageTime=4;if(actor===-1)state.money=Math.min(16000,state.money+300);audio.beep();}
  }
  return {begin,finish,buy,step};
}
