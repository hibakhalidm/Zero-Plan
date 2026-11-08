import {body,database,sameOrigin,unavailable} from '@/lib/server';
import {uuidPattern} from '@/lib/safeguarding';
export async function POST(request:Request){
 if(!sameOrigin(request))return new Response(null,{status:403});
 try{const input=await body(request);if(!uuidPattern.test(input.anon_device_id||''))return Response.json({error:'Invalid device identifier'},{status:400});
 const db=database();if(!db)return unavailable();
 const {error}=await db.from('device_installs').upsert({anon_device_id:input.anon_device_id,chapter_slug:'general',platform:'web'},{onConflict:'anon_device_id',ignoreDuplicates:true});
 if(error)return unavailable();return Response.json({ok:true});
 }catch{return Response.json({error:'Invalid request'},{status:400});}
}
