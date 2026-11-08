import {body,database,sameOrigin,unavailable} from '@/lib/server';
import {categories,isUrgent,uuidPattern} from '@/lib/safeguarding';
export async function GET(){const db=database();if(!db)return unavailable();const {data,error}=await db.from('anonymous_questions').select('*').eq('status','published').order('created_at',{ascending:false}).limit(100);return error?unavailable():Response.json({questions:data});}
export async function POST(request:Request){
 if(!sameOrigin(request))return new Response(null,{status:403});
 try{const q=await body(request);if(!uuidPattern.test(q.id||'')||!Object.hasOwn(categories,q.category)||typeof q.question_text!=='string'||q.question_text.trim().length<10||q.question_text.length>2000||!/^[-a-z0-9]{1,80}$/.test(q.chapter_slug||''))return Response.json({error:'Check your question and topic.'},{status:400});
 const db=database();if(!db)return unavailable();
 const {error}=await db.from('anonymous_questions').upsert({id:q.id,category:q.category,chapter_slug:q.chapter_slug,question_text:q.question_text.trim(),is_flagged_urgent:isUrgent(q.question_text),status:'pending'},{onConflict:'id',ignoreDuplicates:true});
 return error?unavailable():Response.json({ok:true});}catch{return Response.json({error:'Invalid request'},{status:400});}
}
