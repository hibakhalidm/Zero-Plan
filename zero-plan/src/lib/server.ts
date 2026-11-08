import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {timingSafeEqual} from 'node:crypto';
export function database(){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 return url&&key ? createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}) : null;
}
export function demoMode(){return !database() && (process.env.NODE_ENV !== 'production'||process.env.DEMO_MODE==='true');}
export function adminAllowed(request:Request){
 const expected=process.env.ADMIN_PASSCODE || (demoMode()?'zeroplan2026':'');
 const supplied=request.headers.get('authorization')?.replace(/^Bearer /,'') || '';
 if(!expected || supplied.length>512)return false;
 const a=Buffer.from(expected),b=Buffer.from(supplied);
 return a.length===b.length && timingSafeEqual(a,b);
}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');return !origin||origin===new URL(request.url).origin;}
export async function body(request:Request){
 if(Number(request.headers.get('content-length')||0)>12000)throw new Error('Request too large');
 const text=await request.text();if(text.length>12000)throw new Error('Request too large');
 return JSON.parse(text);
}
export const unavailable=()=>Response.json({error:'Service unavailable. Your question can stay on this device until a connection is available.'},{status:503});
