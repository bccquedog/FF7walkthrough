const fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({});
vm.runInContext(['data.js','extras-data.js','detailed-route.js'].map(f=>fs.readFileSync('dist/'+f,'utf8')).join('\n')+'\nthis.guide={chapters:C,quests:Q,materia:M,alerts:ALERTS,party:PARTY,breeding:BREED_STEPS,caves:CAVES,sources:SOURCES};',ctx);
fs.mkdirSync('lib',{recursive:true});fs.writeFileSync('lib/knowledge.json',JSON.stringify(ctx.guide));
console.log('Built FFVII knowledge: '+ctx.guide.chapters.length+' chapters, '+ctx.guide.alerts.length+' item/event records.');
