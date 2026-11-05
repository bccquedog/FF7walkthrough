/* MAKO chat is separate from the player's journal and never edits it. */
(()=>{
 const dialog=document.querySelector('#expertDialog'),messagesEl=document.querySelector('#expertMessages'),form=document.querySelector('#expertForm'),input=document.querySelector('#expertQuestion'),status=document.querySelector('#expertStatus');
 const chatKey='ff7-mako-chat-v1';let thread=[],pending=null,error='',controller=null;
 try{const saved=JSON.parse(sessionStorage.getItem(chatKey)||'[]');if(Array.isArray(saved))thread=saved.filter(m=>['user','assistant'].includes(m.role)&&typeof m.content==='string'&&m.content.length<=16000).slice(-40);}catch{}
 const saveChat=()=>{try{sessionStorage.setItem(chatKey,JSON.stringify(thread.slice(-40)));}catch{}};
 function safeHref(raw){if(/^#(?:c\d{1,2}|q\d{1,2}|guide|journey|quests|materia|missables|characters|chocobos)$/.test(raw))return raw;try{const u=new URL(raw);if(u.protocol==='https:')return u.href;}catch{}return null;}
 function link(label,url){const a=document.createElement('a');a.textContent=label;a.href=url;if(url.startsWith('#'))a.addEventListener('click',e=>{e.preventDefault();dialog.close();const id=url.slice(1);if(/^c\d+$/.test(id))openChapter(id);else if(/^q\d+$/.test(id))openQuest(id);else nav(id);});else{a.target='_blank';a.rel='noopener noreferrer';}return a;}
 function inline(parent,text){const re=/\[([^\]\n]+)\]\(([^\s)]+)\)|\*\*([^*\n]+)\*\*/g;let last=0;for(const match of text.matchAll(re)){parent.append(document.createTextNode(text.slice(last,match.index)));if(match[3]){const b=document.createElement('strong');b.textContent=match[3];parent.append(b);}else{const href=safeHref(match[2]);parent.append(href?link(match[1],href):document.createTextNode(match[1]));}last=match.index+match[0].length;}parent.append(document.createTextNode(text.slice(last)));}
 function content(parent,text){for(const block of text.replace(/cite[^]+/g,'').split(/\n\s*\n/)){const p=document.createElement('p');inline(p,block.replace(/^#{1,4}\s+/gm,''));parent.append(p);}}
 function bubble(m){const item=document.createElement('article');item.className='expert-message '+m.role;const label=document.createElement('span');label.className='expert-speaker';label.textContent=m.role==='user'?'YOU':'MAKO';item.append(label);content(item,m.content);if(m.role==='assistant'&&Array.isArray(m.sources)&&m.sources.length){const refs=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Guide references & research';refs.append(summary);const list=document.createElement('div');list.className='expert-sources';for(const s of m.sources){const href=safeHref(s.href);if(href&&typeof s.title==='string')list.append(link(s.title,href));}refs.append(list);item.append(refs);}messagesEl.append(item);}
 function render(){messagesEl.replaceChildren();for(const m of thread)bubble(m);if(pending)bubble({role:'user',content:pending});if(!thread.length&&!pending){const welcome=document.createElement('div');welcome.className='expert-welcome';const h=document.createElement('h3');h.textContent='A little guidance from the Lifestream.';const p=document.createElement('p');p.textContent='Tell me what you see on screen, ask about an item, or let’s work through your next step together.';welcome.append(h,p);messagesEl.append(welcome);}
 if(pending){const waiting=document.createElement('p');waiting.className='expert-thinking';waiting.textContent='MAKO is checking the guide…';messagesEl.append(waiting);}
 if(error){const p=document.createElement('p');p.className='expert-error';p.setAttribute('role','alert');p.textContent=error;messagesEl.append(p);}
 messagesEl.setAttribute('aria-busy',String(!!pending));document.querySelector('#expertSend').disabled=!!pending;document.querySelector('#expertStop').hidden=!pending;document.querySelector('#expertClear').disabled=!!pending;input.disabled=!!pending;document.querySelectorAll('[data-expert-prompt]').forEach(b=>b.disabled=!!pending);messagesEl.scrollTop=messagesEl.scrollHeight;
 }
 function open(){const c=current();document.querySelector('#expertContext').textContent='Guide location · Disc '+c.disc+' · '+c.title;dialog.showModal();render();if(window.innerWidth>900)input.focus();}
 document.querySelector('#expertOpen').onclick=open;document.querySelector('#mobileExpert').onclick=open;
 document.querySelectorAll('[data-open-expert]').forEach(b=>b.onclick=()=>{document.querySelector('#sectionsDialog').close();open();});
 document.querySelector('#expertClose').onclick=()=>dialog.close();
 document.querySelector('#expertStop').onclick=()=>controller?.abort();
 document.querySelector('#expertClear').onclick=()=>{if(!confirm('Clear MAKO’s conversation in this tab? Your guide progress and notes will stay as they are.'))return;thread=[];error='';saveChat();render();};
 document.querySelectorAll('[data-expert-prompt]').forEach(b=>b.onclick=()=>{input.value=b.dataset.expertPrompt;form.requestSubmit();});
 function requestMessages(question){const history=[...thread.map(({role,content})=>({role,content})),{role:'user',content:question}].slice(-16);while(history.length>1&&history.reduce((n,m)=>n+m.content.length,0)>26000)history.shift();if(history[0]?.role==='assistant')history.shift();return history;}
 form.onsubmit=async e=>{
  e.preventDefault();const question=input.value.trim();if(!question||pending)return;
  error='';pending=question;controller=new AbortController();status.textContent='Checking the guide and preparing your answer.';render();
  const c=current(),objective=c.steps.findIndex((_,i)=>!state.checks[c.id+'-s'+i]);
  const endpoint=location.hostname.endsWith('.chatgpt.site')?'https://www.nowindowshopping.com/ff7/api/expert':new URL('api/expert',document.baseURI).href;
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:requestMessages(question),chapter:c.id,objective:Math.max(0,objective),allowSpoilers:document.querySelector('#expertSpoilers').checked,game:document.querySelector('#expertGame').value}),signal:controller.signal});
   const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'MAKO could not connect. Please try again.');
   if(typeof data.answer!=='string'||!data.answer.trim())throw new Error('No answer came back. Please try again.');
   thread.push({role:'user',content:question},{role:'assistant',content:data.answer,sources:data.sources||[]});thread=thread.slice(-40);saveChat();input.value='';status.textContent='MAKO’s answer is ready.';
  }catch(e){error=e.name==='AbortError'?'Answer stopped. Your question is ready to try again.':e.message;status.textContent='The answer could not be completed.';}
  finally{pending=null;controller=null;render();}
 };
 input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();form.requestSubmit();}});
})();
