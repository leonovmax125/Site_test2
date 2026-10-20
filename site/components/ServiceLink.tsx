"use client";
import { Arrow } from "./Icons";
export default function ServiceLink({service,name}:{service:string;name:string}) { return <a className="service-link" href="#request" aria-label={`Оставить заявку: ${name}`} onClick={()=>window.dispatchEvent(new CustomEvent("select-service",{detail:service}))}><span>Выбрать</span><span className="round-arrow"><Arrow diagonal/></span></a>; }
