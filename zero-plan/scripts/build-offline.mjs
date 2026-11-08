import {readdir,readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const routes=['/','/resources','/safe-space','/referrals','/impact','/admin'];
await mkdir('public/offline-pages',{recursive:true});
for(const route of routes){const file=route==='/'?'index':route.slice(1);await copyFile(`.next/server/app/${file}.html`,`public/offline-pages/${file}.html`);}
await copyFile('src/data/offline-bundle.json','public/offline-bundle.json');
async function files(dir){const result=[];for(const file of await readdir(dir,{withFileTypes:true})){const target=path.join(dir,file.name);result.push(...(file.isDirectory()?await files(target):[target]));}return result;}
const assets=(await files('.next/static')).map(file=>'/'+file.replaceAll('\\','/').replace('.next/','_next/'));
const revision=createHash('sha256').update(await readFile('.next/BUILD_ID')).digest('hex').slice(0,12);
await writeFile('public/offline-assets.json',JSON.stringify({revision,routes,assets:[...assets,'/offline-bundle.json','/manifest.json','/icon.svg','/icon-192.png','/icon-512.png',...routes.map(route=>`/offline-pages/${route==='/'?'index':route.slice(1)}.html`)]}));
console.log(`Offline bundle: ${routes.length} routes, ${assets.length} static assets; revision ${revision}`);
