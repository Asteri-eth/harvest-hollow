import type {State,Action,Kind,AnimalKind} from './model';
type Tool={name:string;title:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean;untrustedContentHint:boolean};execute:(input:unknown)=>unknown};
type Context={registerTool:(tool:Tool,options?:{signal:AbortSignal})=>void|Promise<void>};
export function registerFarmTools(getState:()=>State,act:(action:Action)=>{ok:boolean;message:string;state:State}){
 const context=(document as Document & {modelContext?:Context}).modelContext;if(!context?.registerTool)return()=>{};
 const lifecycle=new AbortController();const props={additionalProperties:false,type:'object'};
 const summary=()=>{const s=getState();return {coins:s.coins,wood:s.wood,stone:s.stone,elapsed:s.elapsed,buildings:s.buildings};};
 const object=(x:unknown)=>{if(!x||typeof x!=='object'||Array.isArray(x))throw Error('An input object is required.');return x as Record<string,unknown>;};
 const complete=(a:Action)=>{const r=act(a);if(!r.ok)throw Error(r.message);return {message:r.message,...summary()};};
 const tools:Tool[]=[
 {name:'read_farm',title:'Read farm',description:'Read current resources, buildings, animal populations, and production timestamps.',inputSchema:{...props,properties:{}},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>summary()},
 {name:'build_farm_structure',title:'Build a farm structure',description:'Spend in-game resources to place one building on an empty farm square.',inputSchema:{...props,properties:{kind:{type:'string',enum:['coop','barn','sheepfold','mill','field']},x:{type:'integer',enum:[-8,-4,0,4,8]},z:{type:'integer',enum:[-8,-4,0,4,8]}},required:['kind','x','z']},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{const p=object(input);if(!['coop','barn','sheepfold','mill','field'].includes(String(p.kind))||!Number.isInteger(p.x)||!Number.isInteger(p.z))throw Error('Choose a valid building and integer coordinates.');return complete({type:'build',kind:p.kind as Kind,x:p.x as number,z:p.z as number});}},
 {name:'buy_farm_animal',title:'Buy a farm animal',description:'Spend in-game coins to add a chicken, cow, or sheep to an available matching home.',inputSchema:{...props,properties:{kind:{type:'string',enum:['chicken','cow','sheep']}},required:['kind']},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{const p=object(input);if(!['chicken','cow','sheep'].includes(String(p.kind)))throw Error('Choose a chicken, cow, or sheep.');return complete({type:'buy',kind:p.kind as AnimalKind});}},
 {name:'upgrade_farm_structure',title:'Upgrade a structure',description:'Spend resources to upgrade an existing structure, changing its appearance and improving production or capacity.',inputSchema:{...props,properties:{id:{type:'string'}},required:['id']},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{const p=object(input);if(typeof p.id!=='string')throw Error('A building ID is required.');return complete({type:'upgrade',id:p.id});}},
 {name:'collect_ready_farm_produce',title:'Collect farm produce',description:'Collect all currently ready farm produce and sell it for in-game coins.',inputSchema:{...props,properties:{}},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:()=>complete({type:'collectAll'})},
 ];
 for(const tool of tools){try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{/* Browsers without WebMCP still use the same visible game controls. */}}
 return()=>lifecycle.abort();
}
