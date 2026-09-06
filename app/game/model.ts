export type Kind = 'house' | 'coop' | 'barn' | 'sheepfold' | 'mill' | 'field';
export type AnimalKind = 'chicken' | 'cow' | 'sheep';
export type Cost = { coins: number; wood: number; stone: number };
export type Building = { id: string; kind: Kind; x: number; z: number; level: number; animals: number; lastCollect: number; planted: boolean };
export type State = { version: 1; coins: number; wood: number; stone: number; xp: number; elapsed: number; buildings: Building[]; harvested: number; bought: number; upgrades: number; claimed: string[]; nextId: number };
export const TYPES: Record<Kind, { name: string; desc: string; cost: Cost; capacity: number; period: number; income: number; product: string; looks: string[] }> = {
 house:{name:'Farmhouse',desc:'The heart of your little homestead.',cost:{coins:0,wood:0,stone:0},capacity:0,period:0,income:0,product:'Crop bonus',looks:['Country cottage','Gabled homestead','Grand country house']},
 coop:{name:'Chicken coop',desc:'A cozy home for fresh-egg makers.',cost:{coins:160,wood:35,stone:5},capacity:3,period:18,income:14,product:'Eggs',looks:['Timber coop','Painted coop & run','Grand coop & weathervane']},
 barn:{name:'Dairy barn',desc:'Happy cows, fresh milk every day.',cost:{coins:280,wood:55,stone:20},capacity:2,period:26,income:32,product:'Milk',looks:['Little red barn','Stone barn & hayloft','Grand barn & silo']},
 sheepfold:{name:'Sheep pasture',desc:'Soft grass for your woolly friends.',cost:{coins:220,wood:45,stone:10},capacity:3,period:32,income:25,product:'Wool',looks:['Open timber shelter','Blue-roofed sheepfold','Stone lodge & hay store']},
 mill:{name:'Windmill',desc:'Turn a gentle breeze into income.',cost:{coins:380,wood:70,stone:35},capacity:0,period:30,income:60,product:'Flour',looks:['Wooden windmill','Stone windmill','Grand mill & outbuilding']},
 field:{name:'Wheat patch',desc:'Plant, grow, harvest. A fresh start.',cost:{coins:45,wood:5,stone:0},capacity:0,period:28,income:48,product:'Wheat',looks:['Wheat patch','Raised wheat beds','Abundant wheat beds']},
};
export const ANIMALS:Record<AnimalKind,{name:string;home:Kind;price:number;desc:string}> = {
 chicken:{name:'Chicken',home:'coop',price:55,desc:'A little cluck. A lot of eggs.'},
 cow:{name:'Dairy cow',home:'barn',price:140,desc:'Your very own milk producer.'},
 sheep:{name:'Sheep',home:'sheepfold',price:95,desc:'The fluffiest addition to the farm.'},
};
export const freshState=():State=>({version:1,coins:800,wood:160,stone:80,xp:0,elapsed:0,buildings:[{id:'b1',kind:'house',x:0,z:-4,level:1,animals:0,lastCollect:0,planted:false},{id:'b2',kind:'field',x:-4,z:0,level:1,animals:0,lastCollect:-28,planted:true}],harvested:0,bought:0,upgrades:0,claimed:[],nextId:3});
export const capacity=(b:Building)=>TYPES[b.kind].capacity*b.level;
export const upgradeCost=(b:Building):Cost=>({coins:(b.kind==='house'?180:Math.max(80,TYPES[b.kind].cost.coins))*b.level,wood:30*b.level,stone:15*b.level});
export const seedCost=(s:State)=>s.coins<8&&!s.buildings.some(b=>b.planted||b.animals>0||b.kind==='mill')?0:8;
export const affordable=(s:State,c:Cost)=>s.coins>=c.coins&&s.wood>=c.wood&&s.stone>=c.stone;
export const progress=(s:State,b:Building)=>!TYPES[b.kind].period||(b.kind==='field'&&!b.planted)||(TYPES[b.kind].capacity>0&&!b.animals)?0:Math.min(1,(s.elapsed-b.lastCollect)/TYPES[b.kind].period);
export const revenue=(s:State,b:Building)=>Math.round(TYPES[b.kind].income*(TYPES[b.kind].capacity?b.animals:1)*(1+(b.level-1)*.35)*(b.kind==='field'?1+((s.buildings.find(x=>x.kind==='house')?.level??1)-1)*.2:1));
export function canPlace(s:State,x:number,z:number){return Number.isInteger(x/4)&&Number.isInteger(z/4)&&Math.abs(x)<=8&&Math.abs(z)<=8&&!s.buildings.some(b=>b.x===x&&b.z===z);}
export type Action={type:'build';kind:Kind;x:number;z:number}|{type:'buy';kind:AnimalKind;homeId?:string}|{type:'upgrade';id:string}|{type:'collect';id:string}|{type:'collectAll'}|{type:'plant';id:string}|{type:'resource';kind:'wood'|'stone'}|{type:'claim';id:string}|{type:'tick';seconds:number};
export const QUESTS=[
 {id:'harvest',title:'Your first harvest',desc:'Collect your golden wheat.',reward:75,done:(s:State)=>s.harvested>0},
 {id:'build',title:'Room for a little company',desc:'Build your first animal home.',reward:100,done:(s:State)=>s.buildings.some(b=>TYPES[b.kind].capacity>0)},
 {id:'animal',title:'Meet the new neighbors',desc:'Buy your first farm animal.',reward:100,done:(s:State)=>s.bought>0},
 {id:'upgrade',title:'Bigger dreams',desc:'Upgrade any building to level 2.',reward:150,done:(s:State)=>s.upgrades>0},
];
export function perform(state:State,a:Action):{state:State;message:string;ok:boolean}{
 const s=structuredClone(state);const fail=(message:string)=>({state,message,ok:false});const pay=(c:Cost)=>{s.coins-=c.coins;s.wood-=c.wood;s.stone-=c.stone;};let message='';let xp=0;
 if(a.type==='tick'){s.elapsed+=Math.max(0,Math.min(3600,a.seconds));return {state:s,message:'',ok:true};}
 if(a.type==='build'){
  if(!TYPES[a.kind]||a.kind==='house')return fail('Choose a building from the shop.');
  if(!canPlace(s,a.x,a.z))return fail('Choose an empty square inside the farm.');
  if(!affordable(s,TYPES[a.kind].cost))return fail('You need more resources to build this.');
  pay(TYPES[a.kind].cost);s.buildings.push({id:'b'+s.nextId++,kind:a.kind,x:a.x,z:a.z,level:1,animals:0,lastCollect:s.elapsed,planted:a.kind==='field'});xp=20;message=TYPES[a.kind].name+' built!';
 }
 if(a.type==='buy'){
  const animal=ANIMALS[a.kind];if(!animal)return fail('Choose a chicken, cow, or sheep.');
  const b=s.buildings.find(b=>b.kind===animal.home&&b.animals<capacity(b)&&(!a.homeId||a.homeId===b.id));
  if(!b)return fail('Build or upgrade a '+TYPES[animal.home].name.toLowerCase()+' for more room.');
  if(s.coins<animal.price)return fail('You need more coins for this animal.');
  s.coins-=animal.price;if(b.animals===0)b.lastCollect=s.elapsed;b.animals++;s.bought++;xp=10;message='Welcome home, little '+a.kind+'!';
 }
 if(a.type==='upgrade'){
  const b=s.buildings.find(b=>b.id===a.id);if(!b)return fail('Choose a building.');if(b.level>=3)return fail('This building is already at its highest level.');
  const cost=upgradeCost(b);if(!affordable(s,cost))return fail('Gather more coins, wood, or stone first.');pay(cost);b.level++;s.upgrades++;xp=35;message=TYPES[b.kind].name+' is now level '+b.level+'!';
 }
 if(a.type==='collect'||a.type==='collectAll'){
  let total=0;for(const b of s.buildings){if(a.type==='collect'&&a.id!==b.id)continue;if(progress(s,b)<1)continue;total+=revenue(s,b);b.lastCollect=s.elapsed;if(b.kind==='field'){b.planted=false;s.harvested++;}xp+=8;}
  if(!total)return fail('Nothing is ready yet. Give your farm a moment to grow.');s.coins+=total;message='Fresh from the farm! +'+total+' coins';
 }
 if(a.type==='plant'){
  const b=s.buildings.find(b=>b.id===a.id);if(!b||b.kind!=='field'||b.planted)return fail('Choose an empty wheat patch.');const cost=seedCost(s);if(s.coins<cost)return fail('You need 8 coins for seeds.');s.coins-=cost;b.planted=true;b.lastCollect=s.elapsed;message=cost?'Wheat planted. Ready in 28 seconds.':'A neighbor shared some seeds. Your next harvest is on its way!';
 }
 if(a.type==='resource'){
  if(a.kind!=='wood'&&a.kind!=='stone')return fail('Choose wood or stone.');if(s.coins<50)return fail('You need 50 coins for these supplies.');s.coins-=50;s[a.kind]+=a.kind==='wood'?30:20;message=(a.kind==='wood'?30:20)+' '+a.kind+' added to your supplies.';
 }
 if(a.type==='claim'){
  const q=QUESTS.find(q=>q.id===a.id);if(!q||!q.done(s)||s.claimed.includes(q.id))return fail('This reward is not available.');s.claimed.push(q.id);s.coins+=q.reward;xp=15;message='Milestone complete! +'+q.reward+' coins';
 }
 const previous=Math.floor(s.xp/100);s.xp+=xp;if(Math.floor(s.xp/100)>previous){s.coins+=80;s.wood+=20;s.stone+=10;message+=' Farm level up! +80 coins, 20 wood, 10 stone.';}
 return {state:s,message,ok:true};
}
export function restore(raw:string|null):State{
 if(!raw)return freshState();try{const s=JSON.parse(raw);if(s.version!==1||!Array.isArray(s.buildings)||s.buildings.length>25||!['coins','wood','stone','xp','elapsed','harvested','bought','upgrades','nextId'].every(k=>Number.isFinite(s[k])&&s[k]>=0)||!Array.isArray(s.claimed))return freshState();
 if(!s.buildings.every((b:Building)=>TYPES[b.kind]&&Number.isInteger(b.level)&&b.level>=1&&b.level<=3&&Number.isInteger(b.animals)&&b.animals>=0&&b.animals<=capacity(b)&&Number.isFinite(b.lastCollect)&&typeof b.planted==='boolean'&&typeof b.id==='string'&&Math.abs(b.x)<=8&&Math.abs(b.z)<=8&&b.x%4===0&&b.z%4===0))return freshState();
 if(new Set(s.buildings.map((b:Building)=>b.x+','+b.z)).size!==s.buildings.length||s.buildings.filter((b:Building)=>b.kind==='house').length!==1)return freshState();return s;
 }catch{return freshState();}
}