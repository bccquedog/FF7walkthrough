import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import handler from '../api/expert.mjs';
const root=path.resolve('dist'),types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg','.json':'application/json'};
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:4173'),pathname=url.pathname.replace(/^\/ff7(?=\/|$)/,'')||'/';
 if(pathname==='/api/expert'){
  let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>45000){res.writeHead(413);res.end();return;}}
  req.body=raw;res.status=code=>{res.statusCode=code;return res};res.json=value=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));return res};
  try{await handler(req,res)}catch{res.status(500).json({error:'The local assistant could not complete the request.'})}return;
 }
 const file=path.resolve(root,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 try{const data=await fs.readFile(file);res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data)}catch{res.writeHead(404);res.end('Not found')}
});server.listen(4173,'127.0.0.1',()=>console.log('FFVII guide + MAKO: http://127.0.0.1:4173'));
