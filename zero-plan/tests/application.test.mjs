import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://127.0.0.1:3000';
const post=(url,data,headers={})=>fetch(base+url,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(data)});
test('all six pages serve meaningful content and privacy headers',async()=>{
 for(const route of ['/','/resources','/referrals','/impact','/safe-space','/admin']){
  const res=await fetch(base+route);assert.equal(res.status,200,route);assert.equal(res.headers.get('x-frame-options'),'DENY');assert.equal(res.headers.get('referrer-policy'),'no-referrer');const html=await res.text();assert.match(html,/Quick Exit/);assert.doesNotMatch(html,/Lorem ipsum|\/\/ TODO/);
 }
});
test('every generated offline dependency is fetchable on first visit',async()=>{
 const manifest=await (await fetch(base+'/offline-assets.json')).json();assert.equal(manifest.routes.length,6);
 for(const asset of manifest.assets){assert.equal((await fetch(base+asset)).status,200,asset);}
});
test('anonymous clients cannot inspect or mutate moderator data',async()=>{
 assert.equal((await fetch(base+'/api/admin')).status,401);
 assert.equal((await fetch(base+'/api/admin',{headers:{Authorization:'Bearer invalid'}})).status,401);
 assert.equal((await post('/api/admin',{action:'stock',slug:'astu',stock:999})).status,403);
 assert.equal((await post('/api/admin',{action:'stock',slug:'astu',stock:999},{Authorization:'Bearer zeroplan2026',Origin:'https://untrusted.example'})).status,403);
});
test('demo login succeeds without persisting an identity cookie',async()=>{
 const res=await fetch(base+'/api/admin',{headers:{Authorization:'Bearer zeroplan2026'}});assert.equal(res.status,200);assert.equal(res.headers.get('set-cookie'),null);assert.equal(res.headers.get('cache-control'),'no-store');assert.equal((await res.json()).mode,'demo');
});
test('invalid questions and install pings are rejected before database access',async()=>{
 assert.equal((await post('/api/questions',{id:'bad'})).status,400);
 assert.equal((await post('/api/questions',{id:crypto.randomUUID(),category:'unknown',chapter_slug:'general',question_text:'An ordinary question'})).status,400);
 assert.equal((await post('/api/installs',{anon_device_id:'person@example.com'})).status,400);
 assert.equal((await post('/api/questions',{question_text:'x'.repeat(13000)})).status,400);
 assert.equal((await post('/api/installs',{anon_device_id:crypto.randomUUID()},{Origin:'https://untrusted.example'})).status,403);
});
test('unconfigured service never falsely acknowledges a sent question',async()=>{
 const res=await post('/api/questions',{id:crypto.randomUUID(),category:'srhr',chapter_slug:'general',question_text:'How can a school supply bank be used?'});assert.equal(res.status,503);
 assert.equal((await fetch(base+'/api/impact')).status,503);
});
test('content inventory and safeguards are complete',async()=>{
 const bundle=JSON.parse(await readFile('src/data/offline-bundle.json','utf8'));assert.equal(bundle.modules.length,12);assert.equal(bundle.referrals.length,6);assert.equal(bundle.questions.length,6);assert.equal(bundle.chapters.reduce((a,c)=>a+c.trained_advocates_count,0),60);
 for(const m of bundle.modules){assert.ok(m.paragraphs.join(' ').length>700,m.title);assert.ok(m.checklist.length>=3);assert.ok(m.sources.length);}
 const sql=await readFile('supabase/schema.sql','utf8');assert.equal((sql.match(/enable row level security/g)||[]).length,3);assert.match(sql,/status='pending' and answer_text is null and upvotes=0/);assert.doesNotMatch(sql,/for update to anon|for delete to anon/i);
});
