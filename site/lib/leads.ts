export const SERVICE_LABELS:Record<string,string>={classic:"Классический массаж",sport:"Спортивный массаж",relax:"Расслабляющий массаж",spa:"СПА-процедуры","":"Помогите выбрать"};
export type Lead={name:string;phone:string;service:string;requestId:string;consent:true;page:string;utm:Record<string,string>};
export type Validation={ok:true;lead:Lead}|{ok:false;message:string};
export function validateLead(input:unknown):Validation {
  if(!input||typeof input!=="object"||Array.isArray(input))return {ok:false,message:"Проверьте данные заявки"};
  const data=input as Record<string,unknown>;
  const name=typeof data.name==="string"?data.name.trim():"";
  const phone=typeof data.phone==="string"?data.phone.trim():"";
  if(name.length<2||name.length>80||/[\x00-\x1f<>]/.test(name))return {ok:false,message:"Укажите имя длиной от 2 до 80 символов"};
  const digits=phone.replace(/\D/g,"");
  if(phone.length>24||digits.length<7||digits.length>15||!/^\+?[\d\s().-]+$/.test(phone))return {ok:false,message:"Проверьте номер телефона"};
  if(data.consent!==true)return {ok:false,message:"Для связи по заявке нужно согласие на обработку данных"};
  const service=data.service===undefined?"":data.service;
  if(typeof service!=="string"||!Object.hasOwn(SERVICE_LABELS,service))return {ok:false,message:"Выберите направление из списка"};
  if(typeof data.requestId!=="string"||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.requestId))return {ok:false,message:"Обновите страницу и попробуйте ещё раз"};
  let page="";
  if(typeof data.page==="string"&&data.page){try{const u=new URL(data.page);if(!["http:","https:"].includes(u.protocol))throw new Error();page=(u.origin+u.pathname).slice(0,2048);}catch{return {ok:false,message:"Не удалось проверить страницу заявки"};}}
  const utm:Record<string,string>={};
  if(data.utm&&typeof data.utm==="object"&&!Array.isArray(data.utm)){for(const key of ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"]){const value=(data.utm as Record<string,unknown>)[key];if(typeof value==="string")utm[key]=value.slice(0,200);}}
  return {ok:true,lead:{name,phone,service,requestId:data.requestId,consent:true,page,utm}};
}
export type LeadStore={save:(lead:Lead)=>Promise<"created"|"duplicate">;markNotified:(requestId:string)=>Promise<void>};
// Persistence is authoritative. A notification failure must never erase a saved lead
// or prompt a visitor to create another copy. request_id is unique in PostgreSQL.
export async function deliverLead(lead:Lead,store:LeadStore,notify:(lead:Lead)=>Promise<void>):Promise<{duplicate:boolean;notified:boolean}> {
  const saved=await store.save(lead);
  if(saved==="duplicate")return {duplicate:true,notified:false};
  try {await notify(lead);}catch{return {duplicate:false,notified:false};}
  try {await store.markNotified(lead.requestId);}catch{/* Lead and notification already succeeded. */}
  return {duplicate:false,notified:true};
}
