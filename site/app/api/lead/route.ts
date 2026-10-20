import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { deliverLead,SERVICE_LABELS,validateLead,type Lead } from "@/lib/leads";
import { leadReadiness,siteUrl } from "@/lib/site";
export const runtime="nodejs";
const attempts=new Map<string,{count:number;reset:number}>();
function rateLimited(ip:string){
  const now=Date.now();const key=createHash("sha256").update(ip).digest("hex");
  for(const [k,v] of attempts){if(v.reset<now)attempts.delete(k);}
  let entry=attempts.get(key);
  if(!entry){if(attempts.size>=10000)attempts.delete(attempts.keys().next().value!);entry={count:0,reset:now+15*60*1000};attempts.set(key,entry);}
  return ++entry.count>5;
}
function reply(status:number,message?:string){return Response.json({ok:status===200,...(message?{message}:{})},{status,headers:{"Cache-Control":"no-store",...(status===429?{"Retry-After":"900"}:{})}});}
async function readBody(request:Request){
  if(Number(request.headers.get("content-length"))>4096)throw new Error("large");
  const reader=request.body?.getReader();if(!reader)throw new Error("empty");
  let count=0;const chunks:Uint8Array[]=[];
  for(;;){const {done,value}=await reader.read();if(done)break;count+=value.length;if(count>4096){await reader.cancel();throw new Error("large");}chunks.push(value);}
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export async function POST(request:Request){
  const origin=request.headers.get("origin");
  const allowed=[new URL(request.url).origin,siteUrl()].filter(Boolean);
  if(origin&&!allowed.includes(origin))return reply(403,"Отправьте заявку со страницы студии");
  if(!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))return reply(415,"Не удалось прочитать заявку");
  let data:unknown;try{data=await readBody(request);}catch{return reply(400,"Не удалось прочитать заявку. Обновите страницу");}
  if(data&&typeof data==="object"&&"website" in data&&(data as {website:unknown}).website)return reply(200);
  const validated=validateLead(data);if(!validated.ok)return reply(400,validated.message);
  const ip=request.headers.get("x-forwarded-for")?.split(",")[0].trim()||"unknown";
  if(rateLimited(ip))return reply(429,"Слишком много заявок. Попробуйте через 15 минут");
  if(!leadReadiness())return reply(503,"Приём заявок на сайте пока не подключён. Пожалуйста, вернитесь позже");
  const db=createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_SECRET_KEY!,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.timeout(8000)})}});
  try{
    const result=await deliverLead(validated.lead,{
      save:async lead=>{const {error}=await db.from("leads").insert({request_id:lead.requestId,name:lead.name,phone:lead.phone,service:lead.service,consent:lead.consent,page:lead.page,utm:lead.utm,consent_version:"2026-10-20"});if(error?.code==="23505")return "duplicate";if(error)throw new Error("storage_failed");return "created";},
      markNotified:async requestId=>{const {error}=await db.from("leads").update({telegram_notified:true}).eq("request_id",requestId);if(error)throw new Error("status_failed");},
    },async(lead:Lead)=>{
      const time=new Intl.DateTimeFormat("ru-BY",{timeZone:"Europe/Minsk",dateStyle:"short",timeStyle:"short"}).format(new Date());
      const text=["Новая заявка с сайта «Тише»",`Имя: ${lead.name}`,`Телефон: ${lead.phone}`,`Направление: ${SERVICE_LABELS[lead.service]}`,`Время: ${time}`,`Страница: ${lead.page}`,...Object.entries(lead.utm).map(([key,value])=>`${key}: ${value}`),`ID: ${lead.requestId}`].join("\n");
      const response=await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:process.env.TELEGRAM_CHAT_ID,text}),signal:AbortSignal.timeout(8000)});
      if(!response.ok||!(await response.json()).ok)throw new Error("notification_failed");
    });
    if(!result.notified&&!result.duplicate)console.warn("Lead saved; notification pending",{requestId:validated.lead.requestId});
    return reply(200);
  }catch{console.error("Lead persistence failed");return reply(503,"Не удалось сохранить заявку. Попробуйте ещё раз");}
}
