import * as T from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { type State, type Kind, type Building, type AnimalKind, canPlace, progress } from './model';

const materials = new Map<string,T.MeshStandardMaterial>();
const mat=(c:string)=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.85,flatShading:true}));return materials.get(c)!;};
const box=(g:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,c:string)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
const ball=(g:T.Object3D,r:number,x:number,y:number,z:number,c:string,detail=0)=>{const m=new T.Mesh(new T.IcosahedronGeometry(r,detail),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
const cylinder=(g:T.Object3D,rt:number,rb:number,h:number,x:number,y:number,z:number,c:string,n=8)=>{const m=new T.Mesh(new T.CylinderGeometry(rt,rb,h,n),mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
function roof(g:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,c:string){
 const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,h);shape.lineTo(w/2,0);shape.closePath();
 const m=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}),mat(c));m.position.set(x,y,z-d/2);m.castShadow=true;m.receiveShadow=true;g.add(m);
 for(let i=1;i<=5;i++){const strip=box(g,w/2+.05,.025,.045,x-w/4,y+h/2,z-d/2+i*d/6,c);strip.rotation.z=Math.atan2(h,w/2);const strip2=box(g,w/2+.05,.025,.045,x+w/4,y+h/2,z-d/2+i*d/6,c);strip2.rotation.z=-Math.atan2(h,w/2);}
}
function fence(g:T.Object3D,x:number,z:number,w:number,d:number,color='#eee4be'){
 for(const zz of [-d/2,d/2])for(let i=0;i<=3;i++)box(g,.11,.62,.11,x-w/2+i*w/3,.31,z+zz,color);
 for(const xx of [-w/2,w/2])for(let i=1;i<3;i++)box(g,.11,.62,.11,x+xx,.31,z-d/2+i*d/3,color);
 for(const yy of [.23,.47]){for(const zz of [-d/2,d/2])box(g,w,.075,.07,x,yy,z+zz,color);for(const xx of [-w/2,w/2])box(g,.07,.075,d,x+xx,yy,z,color);}
}
function window(g:T.Object3D,x:number,y:number,z:number){box(g,.41,.51,.045,x,y,z,'#fff1c8');box(g,.29,.38,.055,x,y,z+.025,'#5c8f96');box(g,.035,.38,.06,x,y,z+.04,'#fff1c8');box(g,.29,.035,.06,x,y,z+.04,'#fff1c8');}
function barrel(g:T.Object3D,x:number,z:number){cylinder(g,.22,.21,.47,x,.24,z,'#bd8447');for(const y of [.1,.37])cylinder(g,.23,.23,.05,x,y,z,'#655744');}
function hay(g:T.Object3D,x:number,y:number,z:number){box(g,.57,.36,.42,x,y+.18,z,'#ebbf54');box(g,.07,.38,.43,x,y+.18,z,'#b68e37');}
function flowers(g:T.Object3D,x:number,z:number){for(let i=0;i<4;i++){const xx=x+Math.sin(i*5)*.25,zz=z+Math.cos(i*4)*.25;cylinder(g,.018,.018,.23,xx,.12,zz,'#64893e',4);ball(g,.095,xx,.29,zz,i%2?'#fff3c0':'#f0b262');}}
function tree(g:T.Object3D,x:number,z:number,size:number,pine=false){
 const t=new T.Group();t.position.set(x,0,z);t.scale.setScalar(size);cylinder(t,.12,.22,1.8,0,.9,0,'#7c603e');
 if(pine){for(let i=0;i<3;i++)cylinder(t,0,1.12-i*.19,1.6,0,1.5+i*.65,0,['#436e41','#518142','#648f47'][i],7);}
 else{ball(t,1.15,0,2.15,0,'#6e9647');ball(t,.85,-.62,1.8,.18,'#7ea44d');ball(t,.86,.55,2.5,-.12,'#8fad52');ball(t,.75,.62,1.8,.4,'#638b3e');}
 g.add(t);return t;
}
export function animalModel(kind:AnimalKind){
 const g=new T.Group();const chicken=kind==='chicken',sheep=kind==='sheep';const white=sheep?'#fff2d5':'#fff9e8',dark='#544b40';
 if(chicken){
  const body=ball(g,.25,0,.33,0,white,1);body.scale.set(1,1,1.3);ball(g,.155,0,.57,.19,white,1);const beak=cylinder(g,0,.075,.15,0,.55,.35,'#eeb241',4);beak.rotation.x=Math.PI/2;
  for(let i=0;i<3;i++)ball(g,.06,0,.72,.12+i*.055,'#d65e3d');
  for(const x of [-.08,.08]){box(g,.033,.16,.035,x,.09,0,'#d2a13e');ball(g,.024,x<0?-.13:.13,.61,.25,'#2a3530');}
  const tail=box(g,.14,.22,.09,0,.43,-.23,white);tail.rotation.x=-.5;
 }else{
  const body=ball(g,.49,0,.67,0,white,1);body.scale.set(.9,.9,1.4);
  for(const x of [-.26,.26])for(const z of [-.36,.36]){box(g,.12,.42,.13,x,.25,z,sheep?dark:white);box(g,.13,.1,.14,x,.065,z,dark);}
  const head=box(g,.36,.39,.4,0,.9,.68,sheep?'#746756':white);head.rotation.x=.1;
  box(g,.37,.17,.16,0,.79,.91,sheep?dark:'#e3ad9b');
  for(const x of [-.24,.24]){const ear=box(g,.24,.075,.16,x,1.04,.66,white);ear.rotation.z=x>0?.3:-.3;ball(g,.026,x>0?.185:-.185,.98,.82,'#29332e');if(!sheep)cylinder(g,.015,.055,.2,x*.65,1.19,.58,'#cfbd8e',5);}
  if(sheep){for(let i=0;i<9;i++)ball(g,.24,Math.sin(i*2.4)*.35,.83+Math.sin(i)*.15,Math.cos(i*2.4)*.49,white);}
  else{const patch=ball(g,.29,.34,.79,-.18,dark);patch.scale.set(.22,1,1.3);const patch2=ball(g,.25,-.34,.67,.15,dark);patch2.scale.x=.2;}
  const tail=box(g,.04,.42,.045,0,.5,-.72,white);tail.rotation.x=-.3;
 }
 return g;
}
export function buildingModel(b:Pick<Building,'kind'|'level'|'planted'>){
 const g=new T.Group();const l=b.level;const k=b.kind;
 if(k==='field'){
  box(g,3.35,.1,3.35,0,.055,0,'#77522f');
  for(let i=0;i<6;i++)box(g,.21,.075,3.15,-1.34+i*.54,.13,0,'#936839');
  if(l>1)fence(g,0,0,3.45,3.45,'#bfa17a');
  if(b.planted){const crops=new T.Group();crops.name='crops';for(let i=0;i<6;i++)for(let j=0;j<7;j++){
   const x=-1.33+i*.53,z=-1.35+j*.44;box(crops,.045,.53,.04,x,.4,z,'#caab48');
   for(let n=0;n<3;n++){const ear=ball(crops,.09,x+Math.sin(n*3)*.065,.62+n*.1,z,'#efc863');ear.scale.set(.65,1.55,.55);}
  }g.add(crops);}return g;
 }
 const animalHome=k==='coop'||k==='barn'||k==='sheepfold';
 const w=k==='coop'?1.75:k==='house'?2.65:2.2,d=k==='house'?2.2:1.65;
 const h=k==='coop'?1.0:k==='mill'?2.6:1.7;
 const z=animalHome?-.68:0;
 if(animalHome){box(g,3.6,.045,3.55,0,.025,0,'#92a75b');fence(g,0,0,3.65,3.65,l===1?'#b99a63':'#f3e8be');}
 const wall=k==='house'?'#f4dfb5':k==='barn'?(l===1?'#b75b45':'#c9664b'):k==='coop'?(l===1?'#bc9659':'#f1d993'):k==='mill'?(l===1?'#baa377':'#e5d8b6'):l===1?'#b9a574':'#e6d4a7';
 const roofColor=k==='house'?['#ad663f','#3f7771','#2d635d'][l-1]:k==='coop'?['#a97642','#668b78','#397569'][l-1]:k==='barn'?['#9b543e','#53716c','#374f57'][l-1]:k==='sheepfold'?['#998352','#7594a0','#4c7486'][l-1]:'#865e47';
 if(k==='mill'){
  cylinder(g,.7,1.02,h+.35*l,0,(h+.35*l)/2,0,wall,8);
  cylinder(g,0,1.12,1,0,h+.35*l+.48,0,roofColor,8);
  const blades=new T.Group();blades.name='blades';blades.position.set(0,h-.15,1.02);
  for(let i=0;i<4;i++){const wing=new T.Group();wing.rotation.z=i*Math.PI/2;box(wing,.1,1.75,.1,0,.9,0,'#f0ddb0');box(wing,.4,1.1,.05,.16,1.1,.06,'#eaddba');for(let j=0;j<5;j++)box(wing,.46,.035,.07,.15,.6+j*.22,.08,'#ae8959');blades.add(wing);}
  cylinder(blades,.15,.15,.18,0,0,.1,'#77583f').rotation.x=Math.PI/2;g.add(blades);
  box(g,.48,.85,.07,0,.43,1,'#705740');if(l>=2)window(g,0,1.62,.88);
 }else{
  box(g,w+.15,.21,d+.15,0,.105,z,l>1?'#a9a38b':'#c8ba91');
  box(g,w,h,d,0,h/2+.18,z,wall);
  if(k==='barn'||k==='coop')for(let i=0;i<8;i++)box(g,.027,h,.015,-w/2+.12+i*(w-.24)/7,h/2+.18,z+d/2+.008,l===1?'#99734d':'#e8c79d');
  const roofH=k==='house'?.95:.72;roof(g,w+.45,roofH,d+.42,0,h+.18,z,roofColor);
  box(g,.65,.97,.06,0,.67,z+d/2+.045,'#695740');box(g,.065,.97,.09,-.36,.67,z+d/2+.06,'#f1e1b7');box(g,.065,.97,.09,.36,.67,z+d/2+.06,'#f1e1b7');box(g,.8,.07,.09,0,1.16,z+d/2+.06,'#f1e1b7');
  if(k==='barn'){box(g,1.1,1.27,.065,0,.81,z+d/2+.08,'#843e31');for(const sign of [-1,1]){const brace=box(g,.065,1.55,.055,0,.81,z+d/2+.13,'#efdcad');brace.rotation.z=sign*.66;}box(g,.06,1.3,.07,0,.81,z+d/2+.16,'#efdcad');}
  if(k==='house'){window(g,-.87,1.06,z+d/2+.045);window(g,.87,1.06,z+d/2+.045);box(g,1.18,.16,.52,0,.12,z+d/2+.32,'#d6c6a0'); }
  if(k==='house'||l>=2){
   box(g,.38,.85,.4,-w*.28,h+roofH*.65,z-.24,'#bb8b68');box(g,.47,.13,.48,-w*.28,h+roofH*.65+.43,z-.24,'#dfc2a0');
  }
  if(l>=2){
   const wingX=k==='house'?1.27:1.02;box(g,.82,1.15,1.04,wingX,.65,z-.17,wall);roof(g,1.12,.48,1.31,wingX,1.25,z-.17,roofColor);window(g,wingX,.83,z+.36);
   box(g,.7,.22,.22,-.87,.52,z+d/2+.18,'#a4764c');flowers(g,-.87,z+d/2+.16);
  }
  if(l===3){
   roof(g,1.1,.56,.8,0,h+.7,z+.54,roofColor);box(g,.82,.53,.55,0,h+.63,z+.54,wall);window(g,0,h+.64,z+.84);
   cylinder(g,.018,.018,.85,0,h+roofH+.6,z,'#655d48',5);const flag=box(g,.45,.22,.045,.2,h+roofH+.86,z,'#f0c44f');flag.name='flag';
  }
 }
 if(l>=3&&k==='barn'){cylinder(g,.43,.48,2.7,-1.32,1.35,-.95,'#c8c6a9');cylinder(g,0,.51,.45,-1.32,2.92,-.95,'#5a7275');}
 if(l>=3&&k==='mill'){box(g,1.15,.95,1.3,-.98,.48,-.74,wall);roof(g,1.4,.58,1.6,-.98,.95,-.74,roofColor);}
 if(animalHome){hay(g,-1.25,0,-.3);if(l>=2)hay(g,-1.25,.36,-.3);box(g,.6,.25,.27,1.15,.13,.5,'#87704c');box(g,.51,.02,.2,1.15,.265,.5,'#6ea8a1');}
 if(k==='house'){barrel(g,-1.6,.55);flowers(g,1.4,1.28);for(let i=0;i<3;i++)box(g,.8,.07,.32,0,.04,1.6+i*.4,'#d6c6a0');}
 return g;
}
type Handlers={pick:(id:string|null,x:number,z:number)=>void;ready:(thumbs:Record<string,string>)=>void;error:(message:string)=>void};
export class FarmScene{
 renderer:T.WebGLRenderer;scene=new T.Scene();camera=new T.OrthographicCamera();controls:OrbitControls;buildings=new T.Group();decor=new T.Group();grid:T.GridHelper;selector:T.Mesh;ghost:T.Group|null=null;state:State;selected:string|null=null;placing:Kind|null=null;frame=0;resize:ResizeObserver;disposed=false;start=performance.now();signature='';creatures:T.Group[]=[];ground:T.Mesh;pointer=new T.Vector2();ray=new T.Raycaster();down={x:0,y:0};hover={x:0,z:0};aspect=1;handlers:Handlers;
 constructor(public container:HTMLElement,state:State,handlers:Handlers){
  this.state=state;this.handlers=handlers;
  this.renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.22;
  this.renderer.domElement.setAttribute('aria-label','Interactive 3D farm. Click a building to manage it. Drag to turn the view.');this.renderer.domElement.setAttribute('role','img');container.appendChild(this.renderer.domElement);
  this.camera.position.set(28,30,35);this.camera.near=.1;this.camera.far=180;
  this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.target.set(0,0,0);this.controls.enableDamping=true;this.controls.enablePan=true;this.controls.minZoom=.65;this.controls.maxZoom=2.4;this.controls.minPolarAngle=.35;this.controls.maxPolarAngle=1.15;this.controls.maxDistance=90;
  this.controls.mouseButtons={LEFT:T.MOUSE.ROTATE,MIDDLE:T.MOUSE.DOLLY,RIGHT:T.MOUSE.PAN};this.controls.touches={ONE:T.TOUCH.ROTATE,TWO:T.TOUCH.DOLLY_PAN};
  this.scene.add(new T.HemisphereLight('#fff4d1','#738966',2.6));
  const sun=new T.DirectionalLight('#fff0c7',4.2);sun.position.set(-15,30,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:80});sun.shadow.normalBias=.035;sun.shadow.bias=-.0002;sun.shadow.radius=3;this.scene.add(sun);
  this.scene.add(this.decor);this.scene.add(this.buildings);this.makeTerrain();
  this.ground=new T.Mesh(new T.PlaneGeometry(24,24),new T.MeshBasicMaterial({visible:false}));this.ground.rotation.x=-Math.PI/2;this.scene.add(this.ground);
  this.grid=new T.GridHelper(20,5,'#fff1bd','#fff1bd');this.grid.position.y=.08;(this.grid.material as T.Material).transparent=true;(this.grid.material as T.Material).opacity=.7;this.grid.visible=false;this.scene.add(this.grid);
  this.selector=new T.Mesh(new T.PlaneGeometry(3.85,3.85),new T.MeshBasicMaterial({color:'#f9d77d',transparent:true,opacity:.32,depthWrite:false}));this.selector.rotation.x=-Math.PI/2;this.selector.position.y=.07;this.selector.visible=false;this.scene.add(this.selector);
  this.resize=new ResizeObserver(()=>this.fit());this.resize.observe(container);this.fit();
  this.renderer.domElement.addEventListener('pointerdown',this.onDown);this.renderer.domElement.addEventListener('pointermove',this.onMove);this.renderer.domElement.addEventListener('pointerup',this.onUp);this.renderer.domElement.addEventListener('webglcontextlost',this.onContextLost);
  this.update(state,null,null);this.animate();setTimeout(()=>{if(!this.disposed)this.makeThumbnails();},100);
 }
 makeTerrain(){
  box(this.decor,28.6,1.2,28.6,0,-.8,0,'#a78958');box(this.decor,29,.38,29,0,-.2,0,'#829b51');box(this.decor,28.7,.13,28.7,0,.005,0,'#96ad5c');
  for(let x=-8;x<=8;x+=4)for(let z=-8;z<=8;z+=4)box(this.decor,3.96,.018,3.96,x,.08,z,((x+z)/4)%2?'#9bb261':'#98ae5d');
  for(const x of [-10.1,10.1])box(this.decor,.28,.027,20.5,x,.095,0,'#bcba7c');
  for(const z of [-10.1,10.1])box(this.decor,20.5,.027,.28,0,.095,z,'#bcba7c');
  box(this.decor,1.6,.027,4.2,0,.1,12,'#cbb881');
  const rand=(i:number)=>{const n=Math.sin(i*127.1+19.7)*43758.5453;return n-Math.floor(n);};
  for(let i=0;i<45;i++){
   const side=i%4;const a=-13.1+rand(i+1)*26.2;const edge=11.1+rand(i+90)*2.2;const x=side<2?a:side===2?-edge:edge;const z=side>=2?a:side===0?-edge:edge;
   if((z>10&&Math.abs(x)<2)||(x>10&&z>2&&z<10))continue;
   tree(this.decor,x,z,.65+rand(i+22)*.65,i%4===0);
  }
  for(let i=0;i<55;i++){
   const x=-13+rand(i+800)*26,z=-13+rand(i+340)*26;if(Math.abs(x)<10.5&&Math.abs(z)<10.5)continue;
   if(x>10&&z>2&&z<10)continue;
   if(i%3===0){const rock=ball(this.decor,.24+rand(i)*.32,x,.15,z,'#b0ac8a');rock.scale.y=.6;}else flowers(this.decor,x,z);
  }
  const pond=new T.Mesh(new T.CircleGeometry(1,36),new T.MeshStandardMaterial({color:'#65b5b1',roughness:.2,metalness:.05}));pond.rotation.x=-Math.PI/2;pond.scale.set(2.15,3.6,1);pond.position.set(11.6,.105,5.8);this.decor.add(pond);
  const rim=new T.Mesh(new T.RingGeometry(1,1.12,36),mat('#c1bb81'));rim.rotation.x=-Math.PI/2;rim.scale.set(2.15,3.6,1);rim.position.set(11.6,.104,5.8);this.decor.add(rim);
  for(let i=0;i<9;i++){const ripple=box(this.decor,.45+rand(i)*.5,.01,.055,10.8+rand(i+5)*1.6,.12,3.5+rand(i+11)*4.5,'#b2dcd0');ripple.rotation.y=.1;}
  for(let i=0;i<9;i++)box(this.decor,3.3,.12,.27,11.45,.25,5+i*.29,'#b69c67');
  for(const xx of [9.85,13.05]){box(this.decor,.11,.9,2.7,xx,.45,6.15,'#ad8f5c');for(let i=0;i<4;i++)box(this.decor,.12,1,.12,xx,.5,5+i*.8,'#dfcca0');}
  fence(this.decor,0,0,21,21,'#c8b581');
  // A gap in the fence marks the entrance; a welcome arch frames the lane.
  for(const x of [-1.1,1.1])box(this.decor,.17,1.9,.17,x,.95,11.2,'#8e774b');
  box(this.decor,2.55,.25,.22,0,1.82,11.2,'#8e774b');flowers(this.decor,-1.6,11.2);flowers(this.decor,1.7,11.2);
  const well=new T.Group();well.position.set(-11.9,.05,4.5);cylinder(well,.54,.58,.58,0,.29,0,'#b8b69a');cylinder(well,.39,.39,.02,0,.59,0,'#436e6e');for(const x of [-.57,.57])box(well,.09,1.3,.1,x,.9,0,'#9a794d');roof(well,1.6,.5,1.2,0,1.6,0,'#986b42');this.decor.add(well);
  for(let i=0;i<6;i++)hay(this.decor,-11+(i%2)*.65,Math.floor(i/4)*.36,-4+Math.floor(i/2)%2*.48);
 }
 update(s:State,selected:string|null,placing:Kind|null){
  this.state=s;this.selected=selected;
  const signature=s.buildings.map(b=>[b.id,b.kind,b.level,b.animals,b.planted].join(':')).join('|');
  if(signature!==this.signature){this.signature=signature;this.clearGroup(this.buildings);this.creatures=[];
   for(const b of s.buildings){const model=buildingModel(b);model.position.set(b.x,.1,b.z);model.userData.id=b.id;
    for(let i=0;i<b.animals;i++){const kind:AnimalKind=b.kind==='coop'?'chicken':b.kind==='barn'?'cow':'sheep';const animal=animalModel(kind);animal.userData={animal:true,seed:i*2.4+b.x*.3,baseX:b.x,baseZ:b.z};animal.scale.setScalar(kind==='chicken'?1:.65);model.add(animal);this.creatures.push(animal);}
    this.buildings.add(model);
   }
  }
  for(const b of s.buildings){const model=this.buildings.children.find(m=>m.userData.id===b.id);const crops=model?.getObjectByName('crops');if(crops){crops.scale.y=.24+progress(s,b)*.76;}}
  const b=s.buildings.find(b=>b.id===selected);this.selector.visible=!!b&&!placing;if(!placing)(this.selector.material as T.MeshBasicMaterial).color.set('#f9d77d');if(b)this.selector.position.set(b.x,.095,b.z);
  if(this.placing!==placing){this.placing=placing;if(this.ghost){this.scene.remove(this.ghost);this.clearGroup(this.ghost);this.ghost=null;}
   if(placing){this.ghost=buildingModel({kind:placing,level:1,planted:true});this.ghost.traverse(o=>{if(o instanceof T.Mesh){o.material=(o.material as T.Material).clone();(o.material as T.Material).transparent=true;(o.material as T.Material).opacity=.52;o.castShadow=false;}});this.ghost.position.set(this.hover.x,.17,this.hover.z);this.scene.add(this.ghost);}
  }this.grid.visible=!!placing;this.controls.enableRotate=!placing;
 }
 clearGroup(g:T.Group){g.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});g.clear();}
 fit(){const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;this.aspect=w/h;const half=this.aspect<1?21/this.aspect:18.5;this.camera.left=-half*this.aspect;this.camera.right=half*this.aspect;this.camera.top=half;this.camera.bottom=-half;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);}
 point(e:PointerEvent){const r=this.renderer.domElement.getBoundingClientRect();this.pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);this.ray.setFromCamera(this.pointer,this.camera);const hit=this.ray.intersectObject(this.ground)[0];return hit?{x:Math.round(hit.point.x/4)*4,z:Math.round(hit.point.z/4)*4}:null;}
 onDown=(e:PointerEvent)=>{this.down={x:e.clientX,y:e.clientY};};
 onMove=(e:PointerEvent)=>{const p=this.point(e);if(!p)return;this.hover=p;if(this.ghost){this.ghost.position.set(p.x,.17,p.z);this.ghost.visible=Math.abs(p.x)<=8&&Math.abs(p.z)<=8;this.selector.visible=true;this.selector.position.set(p.x,.09,p.z);(this.selector.material as T.MeshBasicMaterial).color.set(canPlace(this.state,p.x,p.z)?'#fff2a9':'#df604a');}this.renderer.domElement.style.cursor=this.placing?'crosshair':this.state.buildings.some(b=>b.x===p.x&&b.z===p.z)?'pointer':'grab';};
 onUp=(e:PointerEvent)=>{if(e.button!==0||Math.hypot(e.clientX-this.down.x,e.clientY-this.down.y)>6)return;const p=this.point(e);if(!p)return;let id:string|null=null;if(!this.placing){const hits=this.ray.intersectObjects(this.buildings.children,true);if(hits[0]){let o:T.Object3D|null=hits[0].object;while(o&&!o.userData.id)o=o.parent;id=o?.userData.id??null;}}this.handlers.pick(id??this.state.buildings.find(b=>b.x===p.x&&b.z===p.z)?.id??null,p.x,p.z);};
 onContextLost=(e:Event)=>{e.preventDefault();this.handlers.error('The 3D view was interrupted. Reload to return to your saved farm.');};
 zoom(amount:number){this.camera.zoom=T.MathUtils.clamp(this.camera.zoom+amount,.65,2.4);this.camera.updateProjectionMatrix();}
 rotate(){const v=this.camera.position.clone().sub(this.controls.target);v.applyAxisAngle(new T.Vector3(0,1,0),Math.PI/4);this.camera.position.copy(this.controls.target).add(v);this.controls.update();}
 reset(){this.camera.position.set(28,30,35);this.camera.zoom=1;this.controls.target.set(0,0,0);this.camera.updateProjectionMatrix();this.controls.update();}
 animate=()=>{if(this.disposed)return;this.frame=requestAnimationFrame(this.animate);const t=(performance.now()-this.start)/1000;this.controls.update();
  for(const a of this.creatures){const seed=a.userData.seed;const p=t*.22+seed;a.position.set(Math.sin(p)*.95,.04+Math.abs(Math.sin(t*4+seed))*.012,.75+Math.cos(p*1.2)*.42);a.rotation.y=Math.cos(p)*1.3;}
  for(const group of this.buildings.children){const blades=group.getObjectByName('blades');if(blades)blades.rotation.z=t*.36;}
  this.renderer.render(this.scene,this.camera);
 };
 makeThumbnails(){
  try{const r=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});r.setSize(220,170);r.setPixelRatio(1);r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.22;
   const scene=new T.Scene();scene.add(new T.HemisphereLight('#fff9e1','#83915d',3));const light=new T.DirectionalLight('#fff4d8',4);light.position.set(-3,8,5);scene.add(light);
   const c=new T.OrthographicCamera(-2.8,2.8,2.4,-1.95,.1,30);c.position.set(7,6,9);c.lookAt(0,.7,0);const result:Record<string,string>={};
   for(const kind of ['house','coop','barn','sheepfold','mill','field'] as Kind[])for(let l=1;l<=3;l++){const g=buildingModel({kind,level:l,planted:true});scene.add(g);r.render(scene,c);result[kind+l]=r.domElement.toDataURL();scene.remove(g);this.clearGroup(g);}
   c.left=-1.4;c.right=1.4;c.top=1.7;c.bottom=-.5;c.updateProjectionMatrix();c.lookAt(0,.5,0);
   for(const kind of ['chicken','cow','sheep'] as AnimalKind[]){const a=animalModel(kind);if(kind==='chicken')a.scale.setScalar(1.8);scene.add(a);r.render(scene,c);result[kind]=r.domElement.toDataURL();scene.remove(a);this.clearGroup(a);}r.dispose();this.handlers.ready(result);
  }catch{this.handlers.ready({});}
 }
 dispose(){this.disposed=true;cancelAnimationFrame(this.frame);this.resize.disconnect();this.controls.dispose();this.renderer.domElement.removeEventListener('pointerdown',this.onDown);this.renderer.domElement.removeEventListener('pointermove',this.onMove);this.renderer.domElement.removeEventListener('pointerup',this.onUp);this.renderer.domElement.removeEventListener('webglcontextlost',this.onContextLost);this.clearGroup(this.buildings);this.clearGroup(this.decor);this.renderer.dispose();this.renderer.domElement.remove();}
}
