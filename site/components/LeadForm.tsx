"use client";
import { FormEvent,useEffect,useRef,useState } from "react";
import { services } from "@/lib/site";
import { Arrow } from "./Icons";
export default function LeadForm({ready}:{ready:boolean}) {
  const [service,setService]=useState("");
  const [state,setState]=useState<"idle"|"sending"|"success"|"error">("idle");
  const [error,setError]=useState("");
  const form=useRef<HTMLFormElement>(null);const requestId=useRef("");
  useEffect(()=>{const select=(event:Event)=>{const id=(event as CustomEvent<string>).detail;if(services.some(item=>item.id===id))setService(id);};window.addEventListener("select-service",select);return()=>window.removeEventListener("select-service",select);},[]);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(state==="sending")return;
    if(!ready){setState("error");setError("Приём заявок на сайте пока не подключён. Пожалуйста, вернитесь позже.");return;}
    const values=new FormData(event.currentTarget);if(!requestId.current)requestId.current=crypto.randomUUID();setState("sending");setError("");
    const query=new URLSearchParams(window.location.search);
    const utm=Object.fromEntries(["utm_source","utm_medium","utm_campaign","utm_content","utm_term"].flatMap(key=>query.has(key)?[[key,(query.get(key)||"").slice(0,200)]]:[]));
    try {const response=await fetch("/api/lead",{method:"POST",headers:{"Content-Type":"application/json"},signal:AbortSignal.timeout(25000),body:JSON.stringify({name:values.get("name"),phone:values.get("phone"),service,consent:values.get("consent")==="on",website:values.get("website"),requestId:requestId.current,page:window.location.origin+window.location.pathname,utm})});const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.message||"Не удалось отправить заявку. Попробуйте ещё раз.");setState("success");form.current?.reset();setService("");requestId.current="";}catch(error){setState("error");setError(error instanceof Error&&error.name!=="TimeoutError"?error.message:"Не удалось подтвердить отправку. Попробуйте ещё раз — повторная заявка не создастся.");}
  }
  if(state==="success")return <div className="form-success" role="status"><span className="success-icon" aria-hidden="true">✓</span><h3>Первый шаг сделан</h3><p>Заявка получена. Мы свяжемся с вами, чтобы обсудить процедуру и согласовать время.</p><button className="button button-green" onClick={()=>setState("idle")}>Вернуться к форме</button></div>;
  return <form ref={form} className="lead-form" onSubmit={submit}>
    <div className="field"><label htmlFor="lead-name">Как к вам обращаться?</label><input id="lead-name" name="name" type="text" autoComplete="name" placeholder="Ваше имя" minLength={2} maxLength={80} required disabled={state==="sending"}/></div>
    <div className="field"><label htmlFor="lead-phone">Номер телефона</label><input id="lead-phone" name="phone" type="tel" autoComplete="tel" placeholder="+375 (__) ___-__-__" inputMode="tel" pattern={String.raw`[+0-9\s\(\)\.\-]{7,24}`} minLength={7} maxLength={24} title="Введите номер телефона, например +375 29 123-45-67" required disabled={state==="sending"}/></div>
    <div className="field"><label htmlFor="lead-service">Что вас интересует? <span>необязательно</span></label><div className="select-wrap"><select id="lead-service" name="service" value={service} onChange={e=>setService(e.target.value)} disabled={state==="sending"}><option value="">Помогите выбрать</option>{services.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></div></div>
    <div className="honeypot" aria-hidden="true"><label htmlFor="lead-website">Ваш сайт</label><input id="lead-website" name="website" type="text" autoComplete="off" tabIndex={-1}/></div>
    <label className="consent"><input name="consent" type="checkbox" required disabled={state==="sending"}/><span>Согласен(на) на обработку данных для связи по заявке. <a href="/privacy" target="_blank" rel="noopener noreferrer">Политика конфиденциальности</a></span></label>
    {!ready&&<p className="form-notice">Онлайн-заявки пока не принимаются. Форма доступна для знакомства с сайтом.</p>}
    <button type="submit" className="button button-green form-submit" disabled={!ready||state==="sending"}>{state==="sending"?"Отправляем…":"Оставить заявку"}<Arrow/></button>
    <div aria-live="polite" aria-atomic="true">{state==="error"&&<p className="form-error" role="alert">{error}</p>}</div><p className="form-footnote">Это заявка на обратный звонок. Время посещения согласуем лично.</p>
  </form>;
}
