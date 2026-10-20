import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:3000';
const output=new URL('../../content/previews/',import.meta.url).pathname;
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
const errors=[];
try{
 const context=await browser.newContext();const page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 const failed=[];page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)failed.push(`${r.status()} ${r.url()}`)});
 for(const [width,height] of [[1440,900],[1920,1080],[390,844],[320,640]]){
  await page.setViewportSize({width,height});await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('html').getAttribute('lang'),'ru');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,`overflow ${width}`);
  assert.equal(await page.locator('.hero-image').evaluate(img=>img.complete&&img.naturalWidth>0),true);
  assert.equal(await page.evaluate(()=>document.fonts.check('16px "'+getComputedStyle(document.body).fontFamily.split(',')[0].replaceAll('"','')+'"')),true);
  const cyr=await page.evaluate(()=>[...document.fonts].filter(f=>f.status==='loaded').length);assert.ok(cyr>0,'font loaded');
  if(width===390){await page.getByRole('button',{name:'Открыть меню'}).click();assert.equal(await page.getByRole('button',{name:'Закрыть меню'}).getAttribute('aria-expanded'),'true');await page.locator('#main-navigation').getByRole('link',{name:'Направления'}).click();assert.equal(await page.getByRole('button',{name:'Открыть меню'}).getAttribute('aria-expanded'),'false');}
  await page.getByRole('link',{name:'Оставить заявку: Спортивный массаж',exact:true}).click();await page.waitForTimeout(150);
  assert.equal(await page.locator('#lead-service').inputValue(),'sport');
  assert.equal(await page.locator('button[type=submit]').isDisabled(),true,'unconfigured form cannot submit');
  await page.locator('#lead-name').fill('Анна');await page.locator('#lead-phone').fill('+375 29 123-45-67');await page.locator('input[name=consent]').check();
  assert.equal(await page.locator('#lead-phone').evaluate(e=>e.checkValidity()),true,'HTML phone validation');
  await page.locator('summary').first().click();assert.equal(await page.locator('details').first().getAttribute('open'),'');
  await page.screenshot({path:`${output}desktop-${width}.png`,fullPage:true});
  await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(200);await page.screenshot({path:`${output}first-screen-${width}.png`});
  console.log(`PASS viewport ${width}x${height}, menu, service selection, form readiness, FAQ, font, image and overflow`);
 }
 assert.deepEqual(errors,[],'browser runtime errors');assert.deepEqual(failed,[],'failed application resources');
 await page.goto(base,{waitUntil:'networkidle'});
 const jsonld=JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());assert.equal(jsonld['@graph'][0].mainEntity.length,await page.locator('details').count());
 for(const [i,q] of jsonld['@graph'][0].mainEntity.entries()){const d=page.locator('details').nth(i);if(!(await d.getAttribute('open'))&&await d.getAttribute('open')!=="")await d.locator('summary').click();assert.equal((await d.locator('p').innerText()).trim(),q.acceptedAnswer.text);}
 for(const path of ['/privacy','/robots.txt','/sitemap.xml','/llms.txt','/opengraph-image.jpg','/icon.svg']){const r=await context.request.get(base+path);assert.equal(r.status(),200,path);}
 assert.equal((await context.request.get(base+'/missing-page')).status(),404);
 const invalid=await context.request.post(base+'/api/lead',{data:{name:'А',phone:'bad',consent:false}});assert.equal(invalid.status(),400);
 const valid={name:'Тестовая проверка',phone:'+375 29 123-45-67',consent:true,service:'classic',requestId:crypto.randomUUID(),page:base,utm:{}};
 assert.equal((await context.request.post(base+'/api/lead',{data:valid})).status(),503,'missing bindings cannot claim success');
 assert.equal((await context.request.post(base+'/api/lead',{data:valid,headers:{Origin:'https://unrelated.example'}})).status(),403);
 assert.equal((await context.request.post(base+'/api/lead',{data:{website:'spam'}})).status(),200);
 assert.equal((await context.request.post(base+'/api/lead',{data:{...valid,name:'x'.repeat(5000)}})).status(),400);
 const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await nojs.newPage();await staticPage.goto(base);assert.ok((await staticPage.locator('body').innerText()).includes('Классический массаж'));assert.equal(await staticPage.locator('h1').count(),1);await nojs.close();
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 await page.goto(base);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'К содержимому');
 console.log('PASS metadata/FAQ consistency, public routes, 404, API rejection paths, no-JS HTML, keyboard and reduced motion');
}finally{await browser.close()}
