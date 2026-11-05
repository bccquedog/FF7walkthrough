import {answerQuestion,requestSchema} from '../lib/expert.mjs';
export const config={maxDuration:90};
const allowed=new Set(['https://www.nowindowshopping.com','https://nowindowshopping.com','https://ff7walkthrough.vercel.app','https://ffvii-field-guide-bp.nowindowshopping.chatgpt.site','http://127.0.0.1:4173','http://localhost:4173']);
const buckets=new Map();
export default async function handler(req,res){
 const origin=req.headers.origin;
 res.setHeader('Cache-Control','no-store');res.setHeader('Vary','Origin');
 if(origin&&!allowed.has(origin))return res.status(403).json({error:'Open the assistant from the FFVII Field Guide.'});
 if(origin)res.setHeader('Access-Control-Allow-Origin',origin);
 res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');
 if(req.method==='OPTIONS')return res.status(204).end();
 if(req.method!=='POST'){res.setHeader('Allow','POST, OPTIONS');return res.status(405).json({error:'Use POST to ask a question.'});}
 if(!req.headers['content-type']?.includes('application/json'))return res.status(415).json({error:'Send a JSON question.'});
 if(Number(req.headers['content-length']||0)>45000)return res.status(413).json({error:'This conversation is too long. Start a fresh conversation.'});
 let input;try{const body=typeof req.body==='string'?JSON.parse(req.body):req.body;input=requestSchema.parse(body);}catch{return res.status(400).json({error:'Please send a question of up to 7,000 characters with a valid guide chapter.'});}
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'MAKO is not connected yet. Please try again later.'});
 const now=Date.now(),ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||'local').split(',')[0].trim();
 for(const [key,b]of buckets)if(b.until<now)buckets.delete(key);
 const bucket=buckets.get(ip)||{count:0,until:now+60000};
 if(bucket.count>=8||buckets.size>2000){res.setHeader('Retry-After','60');return res.status(429).json({error:'A little breather, kupo. Please wait a minute before asking again.'});}
 bucket.count++;buckets.set(ip,bucket);
 const abort=new AbortController(),cancel=()=>{if(!res.writableEnded)abort.abort();};
 res.on?.('close',cancel);
 try{return res.status(200).json(await answerQuestion(input,{signal:AbortSignal.any([abort.signal,AbortSignal.timeout(75000)])}));}
 catch(e){
  const upstream=e.statusCode||e.cause?.statusCode;
  console.error('FFVII expert request failed',{name:e.name,status:upstream||null});
  if(upstream===429)return res.status(503).json({error:'MAKO’s AI service is temporarily unavailable or has reached its usage limit. Please try again later.'});
  return res.status(502).json({error:'MAKO could not finish this answer. Please try again; your question is still here.'});
 }finally{res.off?.('close',cancel);}
}
