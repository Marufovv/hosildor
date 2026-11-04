import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { seed, transition } from '../../domain';
export const dynamic='force-dynamic';
async function context(){const user=await getChatGPTUser();if(!user)return null;const db=env.DB;if(!db)throw new Error('Database unavailable');await db.prepare('INSERT OR IGNORE INTO workspaces (owner_id, version, body, updated_at) VALUES (?, 0, ?, ?)').bind(user.userId,JSON.stringify(seed()),new Date().toISOString()).run();const row=await db.prepare('SELECT version, body FROM workspaces WHERE owner_id = ?').bind(user.userId).first<{version:number;body:string}>();if(!row)throw new Error('Workspace unavailable');return {user,db,row};}
export async function GET(){try{const c=await context();if(!c)return Response.json({error:'Kirish talab qilinadi.'},{status:401});return Response.json({state:JSON.parse(c.row.body),version:c.row.version},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Ma’lumotlarni hozir yuklab bo‘lmadi. Qayta urinib ko‘ring.'},{status:503});}}
export async function POST(request:Request){try{
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Origin rejected'},{status:403});
 if(Number(request.headers.get('content-length')??0)>100000)return Response.json({error:'So‘rov juda katta.'},{status:413});
 const c=await context();if(!c)return Response.json({error:'Kirish talab qilinadi.'},{status:401});
 const body=await request.json() as any;const input=JSON.parse(c.row.body);
 if(input.keys.includes(body.key))return Response.json({state:input,version:c.row.version});
 if(body.version!==c.row.version)return Response.json({error:'Ma’lumot yangilandi. Qayta urinib ko‘ring.',state:input,version:c.row.version},{status:409});
 let next;try{next=transition(input,body.action,body.payload??{},body.role,body.key);}catch(e){return Response.json({error:e instanceof Error?e.message:'Amal bajarilmadi.'},{status:400});}
 const result=await c.db.prepare('UPDATE workspaces SET body = ?, version = version + 1, updated_at = ? WHERE owner_id = ? AND version = ?').bind(JSON.stringify(next),new Date().toISOString(),c.user.userId,c.row.version).run();
 if(!result.meta.changes)return Response.json({error:'Bir vaqtda boshqa o‘zgarish bo‘ldi. Yangilang va qayta urinib ko‘ring.'},{status:409});
 return Response.json({state:next,version:c.row.version+1},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'So‘rovni bajarib bo‘lmadi.'},{status:500});}}
