import {readdir,readFile,writeFile,mkdir,copyFile,access} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const routes=['/','/resources','/safe-space','/referrals','/impact','/admin'];
async function exists(p){try{await access(p);return true;}catch{return false;}}
async function files(dir){if(!await exists(dir))return [];const result=[];for(const file of await readdir(dir,{withFileTypes:true})){const target=path.join(dir,file.name);result.push(...(file.isDirectory()?await files(target):[target]));}return result;}
const output=await exists('.vercel/output/static')?'.vercel/output/static':null;
const inventory=[...await files('.next'),...await files('.vercel/output')];
await mkdir('public/offline-pages',{recursive:true});
for(const route of routes){const name=route==='/'?'index':route.slice(1);const candidates=[`.next/server/app/${name}.html`,`.vercel/output/static/${name}.html`,...inventory.filter(p=>p.replaceAll('\\','/').endsWith(`/${name}.html`))];const source=await candidates.reduce(async(prev,p)=>(await prev)||((await exists(p))?p:null),Promise.resolve(null));if(!source)throw Error(`Missing ${name}.html; available HTML: ${inventory.filter(p=>p.endsWith('.html')).join(', ')}`);await copyFile(source,`public/offline-pages/${name}.html`);}
await copyFile('src/data/offline-bundle.json','public/offline-bundle.json');
const staticRoot=await exists('.next/static')?'.next/static':'.vercel/output/static/_next/static';
const assets=(await files(staticRoot)).map(file=>'/_next/static/'+path.relative(staticRoot,file).replaceAll('\\','/'));
const revision=createHash('sha256').update(await readFile('public/offline-pages/index.html')).digest('hex').slice(0,12);
await writeFile('public/offline-assets.json',JSON.stringify({revision,routes,assets:[...assets,'/offline-bundle.json','/manifest.json','/icon.svg','/icon-192.png','/icon-512.png',...routes.map(route=>`/offline-pages/${route==='/'?'index':route.slice(1)}.html`)]}));
if(output){await mkdir(`${output}/offline-pages`,{recursive:true});for(const p of ['offline-assets.json','offline-bundle.json',...routes.map(r=>`offline-pages/${r==='/'?'index':r.slice(1)}.html`)])await copyFile(`public/${p}`,`${output}/${p}`);}
console.log(`Offline bundle: ${routes.length} routes, ${assets.length} static assets; revision ${revision}`);
