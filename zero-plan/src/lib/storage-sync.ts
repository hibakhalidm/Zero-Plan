'use client';
import bundle from '@/data/offline-bundle.json';
import type {Question,Impact} from './types';
export const keys={queue:'zeroplan_queued_questions',cache:'zeroplan_offline_cache_v1',id:'zeroplan_anon_id',read:'zeroplan_read',helped:'zeroplan_helped',impact:'zeroplan_impact',questions:'zeroplan_published',chapter:'zeroplan_chapter'};
const memory=new Map<string,string>();
let paused=false,flushing=false;
const controllers=new Set<AbortController>();
export function read<T>(key:string,fallback:T):T{try{const raw=memory.get(key)??localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch{return fallback;}}
export function write(key:string,value:unknown){const serialized=JSON.stringify(value);try{localStorage.setItem(key,serialized);memory.delete(key);return true;}catch{memory.set(key,serialized);return false;}}
export function storageAvailable(){try{localStorage.setItem('zeroplan_storage_test','1');localStorage.removeItem('zeroplan_storage_test');return true;}catch{return false;}}
export function announce(){window.dispatchEvent(new Event('zeroplan-change'));}
export function queueQuestion(q:Question){const queue=read<Question[]>(keys.queue,[]);const persistent=write(keys.queue,[...queue,q]);announce();void flush();return persistent;}
export async function request(url:string,options:RequestInit={}){const controller=new AbortController();controllers.add(controller);const timer=setTimeout(()=>controller.abort(),12000);try{return await fetch(url,{...options,signal:controller.signal,cache:'no-store'});}finally{clearTimeout(timer);controllers.delete(controller);}}
export function pauseSync(value:boolean){paused=value;}
export async function flush(){
 if(paused||flushing||!navigator.onLine)return;flushing=true;
 try{
  if(read('pending_install_sync',false)){
   const result=await request('/api/installs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({anon_device_id:read(keys.id,'')})});
   if(result.ok&&!paused)write('pending_install_sync',false);
  }
  for(const q of read<Question[]>(keys.queue,[])){
   if(paused)break;
   const result=await request('/api/questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(q)});
   if(!result.ok)break;
   if(!paused)write(keys.queue,read<Question[]>(keys.queue,[]).filter(item=>item.id!==q.id));
  }
 }catch{/* A failed transfer remains queued with the same id for safe retry. */}finally{flushing=false;announce();}
}
export function initialize(){
 paused=false;write(keys.cache,bundle);
 if(!read(keys.id,'')){write(keys.id,crypto.randomUUID());write('pending_install_sync',true);}
 void flush();window.addEventListener('online',flush);
 const retry=setInterval(()=>void flush(),60000);
 return()=>{clearInterval(retry);window.removeEventListener('online',flush);};
}
export function initialImpact():Impact{return read(keys.impact,{chapters:bundle.chapters,installs:0,mode:'demo',updated_at:''});}
export async function wipe(){
 paused=true;for(const c of controllers)c.abort();memory.clear();
 try{for(const key of Object.keys(localStorage)){if(key.startsWith('zeroplan_')||key==='pending_install_sync')localStorage.removeItem(key);}}catch{}
 if('caches'in window)for(const key of await caches.keys()){if(key.startsWith('zeroplan-'))await caches.delete(key);}
 if('serviceWorker'in navigator)for(const reg of await navigator.serviceWorker.getRegistrations())await reg.unregister();
 announce();
}
