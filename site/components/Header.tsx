"use client";
import Link from "next/link";
import { useState } from "react";
import { Arrow, Mark } from "./Icons";
export default function Header() {
  const [open,setOpen]=useState(false);
  return <header className="header wrap"><Link href="/" className="logo" aria-label="Тише — на главную"><Mark /><span>тише<span className="logo-dot">.</span></span></Link><span className="header-place"><span className="status-dot" />Массаж и СПА в Гомеле</span><button className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-navigation" onClick={()=>setOpen(!open)} aria-label={open?"Закрыть меню":"Открыть меню"}><span className={open?"menu-lines active":"menu-lines"}><i/><i/></span></button><nav id="main-navigation" className={`nav ${open?"is-open":""}`} aria-label="Основная навигация"><a href="#services" onClick={()=>setOpen(false)}>Направления</a><a href="#how" onClick={()=>setOpen(false)}>Как записаться</a><a className="nav-book" href="#request" onClick={()=>setOpen(false)}>Оставить заявку <Arrow diagonal/></a></nav></header>;
}
