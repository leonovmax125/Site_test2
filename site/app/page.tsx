import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import LeadForm from "@/components/LeadForm";
import ServiceLink from "@/components/ServiceLink";
import { Arrow,Mark,ServiceShape } from "@/components/Icons";
import { brand,faqs,leadReadiness,services,siteUrl } from "@/lib/site";
export const dynamic="force-dynamic";
export default function Home(){
  const url=siteUrl();
  const schema={"@context":"https://schema.org","@graph":[
    {"@type":"FAQPage",mainEntity:faqs.map(f=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))},
    ...(url?[{"@type":"WebSite","@id":`${url}/#website`,name:brand.name,url,inLanguage:"ru"}]:[]),
  ]};
  return <>
    <Header/>
    <main id="main">
      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-top"><span className="eyebrow">Массаж и СПА в Гомеле</span><span className="hero-small">Ваше время для себя</span></div>
        <div className="hero-heading"><h1 id="hero-title"><span className="sr-only">Массаж в Гомеле — </span>Время<br/>выдохнуть<span className="title-dot">.</span></h1><div className="hero-intro"><span className="tiny-flower" aria-hidden="true">✳</span><p>Отложите дела.<br/> Прислушайтесь к себе.<br/> Начните с простого —<br/> выберите время для отдыха.</p><a className="button button-green" href="#request">Оставить заявку <Arrow diagonal/></a></div></div>
        <div className="hero-photo"><Image src="/images/hero-wellness.webp" alt="Атмосферная композиция: светлый лён, гладкий камень и ветви эвкалипта" fill sizes="(max-width:700px) 100vw, 92vw" preload className="hero-image"/><div className="photo-caption"><span className="caption-dot"/>Меньше суеты. Больше себя.</div><a className="photo-scroll" href="#services" aria-label="Перейти к направлениям массажа"><span>Найдите свой<br/>формат отдыха</span><span className="scroll-circle"><Arrow/></span></a></div>
        <div className="hero-bottom"><p>Классический, спортивный, расслабляющий массаж и СПА</p><span>В своём ритме</span></div>
      </section>
      <section id="services" className="services-section section-space" aria-labelledby="services-title"><div className="wrap"><div className="section-heading"><div><p className="eyebrow">Направления</p><h2 id="services-title">Какой отдых<br/>сейчас ваш?</h2></div><p className="section-intro">Иногда хочется мягкости.<br/>Иногда — внимания к уставшим мышцам.<br/>Начните с того, что вам ближе.</p></div>
        <div className="service-list">{services.map(item=><article className={`service-row service-${item.id}`} key={item.id}><div className="service-symbol"><ServiceShape type={item.shape}/></div><div className="service-name"><p>{item.short}</p><h3>{item.name}</h3></div><p className="service-description">{item.description}</p><ServiceLink service={item.id} name={item.name}/></article>)}</div><p className="services-note">Стоимость и продолжительность уточним до подтверждения записи.</p>
      </div></section>
      <section className="pause-section" aria-labelledby="pause-title"><div className="wrap pause-layout"><div className="pause-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit orbit-three"/><Mark className="pause-mark"/><span className="art-caption">Остановиться — тоже план</span></div><div className="pause-copy"><p className="eyebrow">Без лишних сложностей</p><h2 id="pause-title">Можно просто<br/>сказать:<br/>«Хочу отдохнуть»</h2><p>Необязательно разбираться в названиях техник. Расскажите о своих пожеланиях — обсудим направление и договоримся о посещении.</p><a href="#request" className="text-link">Помогите выбрать <Arrow diagonal/></a></div></div></section>
      <section id="how" className="how-section section-space wrap" aria-labelledby="how-title"><div className="section-heading"><div><p className="eyebrow">Как всё происходит</p><h2 id="how-title">До паузы —<br/>три простых шага</h2></div><p className="section-intro">Никаких сложных анкет.<br/>Остальное обсудим при звонке.</p></div><ol className="steps"><li><span className="step-number">01</span><h3>Оставьте контакт</h3><p>Ваше имя и телефон. Направление можно выбрать сразу или обсудить позже.</p></li><li><span className="step-number">02</span><h3>Обсудим пожелания</h3><p>Администратор свяжется с вами, расскажет о процедуре, стоимости и длительности.</p></li><li><span className="step-number">03</span><h3>Согласуем время</h3><p>Подберём доступный день и время. Запись подтверждается после разговора.</p></li></ol></section>
      <section className="faq-section section-space" aria-labelledby="faq-title"><div className="wrap faq-layout"><div><p className="eyebrow">Перед первым визитом</p><h2 id="faq-title">Возможно,<br/>вам интересно</h2><Mark className="faq-mark"/></div><div className="faq-list">{faqs.map(f=><details key={f.q}><summary>{f.q}<span className="faq-plus" aria-hidden="true"/></summary><p>{f.a}</p></details>)}</div></div></section>
      <section id="request" className="request-section section-space" aria-labelledby="request-title"><div className="wrap request-layout"><div className="request-copy"><p className="eyebrow"><span className="status-dot"/>Первый шаг к отдыху</p><h2 id="request-title">Оставьте суету.<br/>И свой номер.</h2><p>Свяжемся с вами, поможем выбрать направление и согласуем удобное время посещения.</p><div className="request-sign"><Mark/><span>тише.<small>Массаж и СПА в Гомеле</small></span></div></div><div className="form-panel"><LeadForm ready={leadReadiness()}/></div></div></section>
    </main>
    <footer className="footer"><div className="wrap"><div className="footer-top"><a className="logo" href="#main" aria-label="Тише — в начало страницы"><Mark/><span>тише.</span></a><p>Быть ближе к себе.</p><a className="back-top" href="#main">Наверх <Arrow diagonal/></a></div><div className="footer-links"><span>Студия массажа в Гомеле</span><nav aria-label="Навигация в подвале"><a href="#services">Направления</a><a href="#how">Как записаться</a><a href="#request">Оставить заявку</a></nav><Link href="/privacy">Конфиденциальность</Link></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Тише</span><span>Классический, спортивный, релакс и СПА</span></div></div></footer>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}}/>
  </>;
}
