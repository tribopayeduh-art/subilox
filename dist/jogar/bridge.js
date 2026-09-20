'use strict';
(()=>{
const read=(key,other)=>{try{return JSON.parse(localStorage.getItem(key))??other}catch{return other}};
let round=read('subway-demo-round',null),finished=false,engine=null,getCoins=()=>0,cashoutUnlocked=false;
const cash=document.querySelector('#cashout'),dialog=document.querySelector('#result'),note=document.querySelector('#cashout-note'),hudTarget=document.querySelector('#hud-target'),hudValue=document.querySelector('#hud-value'),hudScore=document.querySelector('#hud-score');
if(!round||round.status!=='active'||round.email!==read('subway-demo-session',null)){location.replace('/#jogar');return}
const money=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
hudTarget.textContent=money(round.entry*4);
hudValue.textContent=money(round.entry);
function finish(outcome){
 if(finished||(outcome==='cashout'&&!cashoutUnlocked))return;
 const stored=read('subway-demo-round',null);
 if(!stored||stored.id!==round.id||stored.status!=='active')return;
 const users=read('subway-demo-users',[]),coins=getCoins();
 if(!SubwayRound.settle(stored,users,outcome,coins))return;
 finished=true;round=stored;engine?.pause?.();
 localStorage.setItem('subway-demo-users',JSON.stringify(users));localStorage.setItem('subway-demo-round',JSON.stringify(round));
 cash.disabled=true;cash.hidden=true;note.hidden=true;
 document.querySelector('#result-title').textContent=outcome==='loss'?'Você perdeu':outcome==='win'?'Você ganhou!':'Cashout realizado!';
 document.querySelector('#result-icon').setAttribute('data-lucide',outcome==='loss'?'heart-crack':'trophy');
 document.querySelector('#result-value').textContent=outcome==='loss'?money(round.entry):money(round.payout);
 document.querySelector('#result-detail').textContent=outcome==='loss'?'A corrida terminou. Sua entrada demo foi consumida.':'Créditos fictícios adicionados ao seu saldo.';
 dialog.showModal();lucide.createIcons();document.querySelector('#result-home').focus();
}
window.SubwayBridge={
 value(coins){return SubwayRound.payout(round.entry,Math.max(0,Number(coins)||0))},
 attach(game,coins){if(finished){game.pause?.();return}engine=game;getCoins=coins;cash.disabled=true;cash.hidden=true;note.textContent='Cashout libera ao atingir 2x ('+money(round.entry*2)+').'},
 lose(){finish('loss')}
};
cash.onclick=()=>{if(engine&&!finished&&cashoutUnlocked)finish('cashout')};
document.querySelector('#leave')?.addEventListener('click',()=>{if(finished){location.href='/#jogar';return}document.querySelector('#leave-dialog').showModal()});
document.querySelector('#stay').onclick=()=>document.querySelector('#leave-dialog').close();
document.querySelector('#confirm-leave').onclick=()=>{document.querySelector('#leave-dialog').close();finish('loss')};
dialog.addEventListener('cancel',e=>e.preventDefault());
document.querySelector('#result-home').onclick=()=>location.href='/#jogar';document.querySelector('#result-retry').onclick=()=>location.href='/#jogar';
setInterval(()=>{
 if(finished||!engine)return;
 const coins=Math.max(0,Number(getCoins())||0);
 const value=SubwayRound.payout(round.entry,coins);
 hudValue.textContent=money(value);
 hudScore.textContent=Math.max(0,Math.floor(Number(engine?.stats?.score)||0)).toString().padStart(6,'0');
 cashoutUnlocked=SubwayRound.canCashout(round.entry,coins);
 cash.hidden=!cashoutUnlocked;cash.disabled=!cashoutUnlocked;note.hidden=cashoutUnlocked;
 if(cashoutUnlocked)cash.querySelector('span').textContent='Cashout · '+money(value);
 note.textContent='Cashout libera ao atingir 2x ('+money(round.entry*2)+').';
 if(coins>=300)finish('cashout');
},150);
lucide.createIcons();
})();
