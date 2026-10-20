import type { Metadata } from "next";
import localFont from "next/font/local";
import { brand,siteUrl } from "@/lib/site";
import "./globals.css";
const manrope=localFont({src:"./fonts/Manrope-Variable.ttf",variable:"--font-manrope",display:"swap",weight:"200 800"});
const url=siteUrl();
export const metadata:Metadata={
  ...(url?{metadataBase:new URL(url),alternates:{canonical:url}}:{}),
  title:brand.title,description:brand.description,
  openGraph:{title:brand.title,description:brand.description,locale:"ru_BY",type:"website",siteName:brand.name,...(url?{url}:{})},
  twitter:{card:"summary_large_image",title:brand.title,description:brand.description},
  robots:url?{index:true,follow:true}:{index:false,follow:true},
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ru" className={manrope.variable}><body><a href="#main" className="skip-link">К содержимому</a>{children}</body></html>;}
