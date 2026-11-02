const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map();const el=()=>({value:'',textContent:'',innerHTML:'',checked:false,dataset:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){},focus(){},showModal(){},close(){}});
const context={document:{querySelector:s=>{if(!elements.has(s))elements.set(s,el());return elements.get(s)},querySelectorAll:()=>[],addEventListener(){},title:'',activeElement:null},localStorage:{getItem:()=>null,setItem(){}},location:{hash:''},history:{replaceState(){}},window:{addEventListener(){},scrollTo(){}},setTimeout,clearTimeout,console,Blob,URL,confirm:()=>true};vm.createContext(context);vm.runInContext(fs.readFileSync('dist/data.js','utf8')+'\n'+fs.readFileSync('dist/extras-data.js','utf8')+'\n'+fs.readFileSync('dist/detailed-route.js','utf8')+'\n'+fs.readFileSync('dist/extras-ui.js','utf8')+'\n'+fs.readFileSync('dist/app.js','utf8'),context);vm.runInContext(`
for(const c of C){state.chapter=c.id;for(const t of ['route','loot','focus','notes']){tab=t;const html=guide();if(!html.includes(c.title.replace(/&/g,'&amp;')))throw Error('Missing chapter title '+c.id);if(html.includes('undefined'))throw Error('Undefined content '+c.id);}}
for(const q of Q){questId=q.id;if(!quests().includes('data-check'))throw Error('Missing quest objectives');}questId=null;quests();journey();materia();
const sample=defaults();sample.checks['c1-s0']=true;sample.owned['m0']=true;sample.notes.c1='<script>test</script>';sample.chapter='c26';const round=normalize(JSON.parse(JSON.stringify(sample)));if(round.chapter!=='c26'||!round.checks['c1-s0']||!round.owned.m0||round.notes.c1!==sample.notes.c1)throw Error('Backup roundtrip failed');
const safe=normalize({version:1,chapter:'bad',checks:{invalid:true},owned:{bad:true},notes:{bad:'bad'}});if(safe.chapter!=='c1'||Object.keys(safe.checks).length)throw Error('Invalid backup data accepted');
console.log(JSON.stringify({chapters:C.length,storyObjectives:C.reduce((s,c)=>s+c.steps.length,0),quests:Q.length,materia:M.length,renderChecks:'passed',backupRoundtrip:'passed',backupValidation:'passed'}));
`,context);
vm.runInContext(`
for(const c of C)for(let i=0;i<c.steps.length;i++)if(!c.details?.[i]?.length)throw Error('Unexpanded objective '+c.id+'-'+i);
if(new Set(ALERTS.map(a=>a.id)).size!==ALERTS.length)throw Error('Duplicate register IDs');
for(const a of ALERTS)if(!C.some(c=>c.id===a.ch))throw Error('Orphan register entry');
for(const p of PARTY)if(p.optional&&!Q.some(q=>q.id===p.quest))throw Error('Missing recruitment instructions');
if(PARTY.length!==9)throw Error('Incomplete party');
const old=normalize({version:1,chapter:'c8',checks:{'c1-s0':true,'c8-s0':true},notes:{c8:'Preserve me'},owned:{m0:true}});
if(!old.checks['c8-s0']||old.notes.c8!=='Preserve me'||old.stables.length!==6)throw Error('Legacy progress migration failed');
state=defaults();state.stables[0]={name:'Black',breed:'Black',sex:'Male',wins:6,ready:true};state.stables[1]={name:'Wonderful',breed:'Wonderful yellow',sex:'Female',wins:6,ready:true};
if(!breedingResult(0,1,'Zeio').ok)throw Error('Gold pairing rejected');
if(breedingResult(1,0,'Zeio').ok)throw Error('Gold selection-order bug not warned');
if(breedingResult(0,1,'Carob').ok)throw Error('Wrong nut accepted');
state.stables[1].sex='Male';if(breedingResult(0,1,'Zeio').ok)throw Error('Same-sex pairing accepted');
state.stables[1].sex='Female';state.stables[1].ready=false;if(breedingResult(0,1,'Zeio').ok)throw Error('Cooldown not warned');
state.stables[1].ready=true;state.details['c8-s0-d1']=true;state.missables.rising='missed';state.roster.vincent=true;state.breedingChecks[0]=true;state.caves[0]=true;
const backup=normalize(JSON.parse(JSON.stringify(state)));if(!backup.details['c8-s0-d1']||backup.missables.rising!=='missed'||!backup.roster.vincent||backup.stables[0].name!=='Black'||!backup.caves[0])throw Error('Extended backup lost data');
state=backup;for(const v of ['missables','characters','chocobos']){view=v;const html=extraView();if(!html||html.includes('undefined'))throw Error('Invalid extra view '+v);}
console.log(JSON.stringify({detailedCheckpoints:C.reduce((n,c)=>n+Object.values(c.details).reduce((s,r)=>s+r.length,0),0),inventory:C.reduce((n,c)=>n+c.loot.length,0),register:ALERTS.length,party:PARTY.length,legacyProgress:'passed',extendedBackup:'passed',pairingRules:'passed',extraViews:'passed'}));
`,context);
