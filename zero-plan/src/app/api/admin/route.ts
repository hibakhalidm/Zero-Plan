import {adminAllowed,body,database,demoMode,sameOrigin,unavailable} from '@/lib/server';
import {uuidPattern} from '@/lib/safeguarding';
export async function GET(request:Request){
 if(!adminAllowed(request))return Response.json({error:'Passcode not accepted or admin access is not configured.'},{status:401});
 const db=database();if(!db)return demoMode()?Response.json({mode:'demo',questions:[]}):unavailable();
 const {data,error}=await db.from('anonymous_questions').select('*').eq('status','pending').order('is_flagged_urgent',{ascending:false}).order('created_at',{ascending:true}).limit(200);
 return error?unavailable():Response.json({mode:'live',questions:data});
}
export async function POST(request:Request){
 if(!sameOrigin(request)||!adminAllowed(request))return new Response(null,{status:403});
 try{const q=await body(request);const db=database();if(!db)return unavailable();
 if(q.action==='publish'&&uuidPattern.test(q.id||'')&&typeof q.answer==='string'&&q.answer.trim().length>=10&&q.answer.length<=5000){
 const {data,error}=await db.from('anonymous_questions').update({answer_text:q.answer.trim(),status:'published'}).eq('id',q.id).eq('status','pending').select('id');return error?unavailable():data.length?Response.json({ok:true}):Response.json({error:'Question no longer pending'},{status:409});}
 if(q.action==='stock'&&typeof q.slug==='string'&&Number.isInteger(q.stock)&&q.stock>=0&&q.stock<=100000){const {data,error}=await db.from('club_chapters').update({pad_kits_available:q.stock,updated_at:new Date().toISOString()}).eq('slug',q.slug).select('slug');return error?unavailable():data.length?Response.json({ok:true}):Response.json({error:'Chapter not found'},{status:404});}
 return Response.json({error:'Invalid update'},{status:400});}catch{return Response.json({error:'Invalid request'},{status:400});}
}
