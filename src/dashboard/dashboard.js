import {setupSlideshow} from './slideshow.js';
import {initializeApp} from 'firebase/app';
import {getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut} from 'firebase/auth';
import {getFirestore, doc, onSnapshot, runTransaction} from 'firebase/firestore';
const app=initializeApp({apiKey:'AIzaSyC6IbLdovnxd_bi-FusIkCvsq11OqtJBuk',authDomain:'shay-dashboard-67ba6.firebaseapp.com',projectId:'shay-dashboard-67ba6',storageBucket:'shay-dashboard-67ba6.firebasestorage.app',messagingSenderId:'721543754542',appId:'1:721543754542:web:31881ed78b337b318100bf'});
const auth=getAuth(app), db=getFirestore(app), boardRef=doc(db,'boards','home');
const ADMIN_EMAIL='shayeis@gmail.com';
let canEdit=false, cloudReady=false, revision=0, saving=false;

'use strict';
const KEY='shay-dashboard-cloud-cache-v1';
const ZONE='Asia/Jerusalem';
const MONTHS=['תשרי','חשוון','כסלו','טבת','שבט','אדר','אדר א׳','אדר ב׳','ניסן','אייר','סיוון','תמוז','אב','אלול'];
const defaults=()=>({version:1,name:'שי',mode:'days',previewAnnual:false,countdowns:[{id:'paris',title:'חצי מרתון פריז',date:'2027-03-07'}],annual:[]});
const $=id=>document.getElementById(id);
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hf=new Intl.DateTimeFormat('he-IL-u-ca-hebrew',{day:'numeric',month:'long',year:'numeric',timeZone:ZONE});
const civilFormatter=new Intl.DateTimeFormat('en-CA',{timeZone:ZONE,year:'numeric',month:'2-digit',day:'2-digit'});
function civil(d=new Date()){const p=Object.fromEntries(civilFormatter.formatToParts(d).map(p=>[p.type,p.value]));return `${p.year}-${p.month}-${p.day}`;}
function stamp(s){return Date.parse(s+'T12:00:00Z');}
function daysBetween(a,b){return Math.round((stamp(b)-stamp(a))/86400000);}
function hebrew(d){const p=Object.fromEntries(hf.formatToParts(d).map(p=>[p.type,p.value]));return {day:Number(p.day),month:p.month,year:Number(p.year)};}
function hebrewText(d){const h=hebrew(d);return `${numeral(h.day)} ב${h.month} ${numeral(h.year%1000)}`;}
function numeral(n){let t='';while(n>=400){t+='ת';n-=400;}for(const [v,c] of [[300,'ש'],[200,'ר'],[100,'ק'],[90,'צ'],[80,'פ'],[70,'ע'],[60,'ס'],[50,'נ'],[40,'מ'],[30,'ל'],[20,'כ']]){while(n>=v){t+=c;n-=v;}}if(n===15){t+='טו';n=0;}if(n===16){t+='טז';n=0;}for(const [v,c] of [[10,'י'],[9,'ט'],[8,'ח'],[7,'ז'],[6,'ו'],[5,'ה'],[4,'ד'],[3,'ג'],[2,'ב'],[1,'א']]){while(n>=v){t+=c;n-=v;}}return t.length>1?t.slice(0,-1)+'״'+t.slice(-1):t+'׳';}
function eventKindLabel(kind){return {birthday:'יום הולדת',anniversary:'יום נישואין',memorial:'יום זיכרון'}[kind];}
function parseHebrewYear(value){const s=value.trim();if(/^\d{4}$/.test(s))return Number(s);let letters=s.replace(/[\s"'׳״]/g,'');if(letters.startsWith('ה')&&letters.length>1)letters=letters.slice(1);if(!/^[א-ת]+$/.test(letters))return NaN;const values={'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,'י':10,'כ':20,'ל':30,'מ':40,'נ':50,'ס':60,'ע':70,'פ':80,'צ':90,'ק':100,'ר':200,'ש':300,'ת':400};let n=0;for(const c of letters){if(!values[c])return NaN;n+=values[c];}if(n<1||n>999||numeral(n).replace(/[׳״]/g,'')!==letters)return NaN;return 5000+n;}
function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(stamp(s))&&new Date(stamp(s)).toISOString().slice(0,10)===s&&s>='1900-01-01'&&s<='2200-12-31';}
function validateData(s){if(!s||s.version!==1||typeof s.name!=='string'||s.name.length>40||!['days','weeks'].includes(s.mode)||typeof s.previewAnnual!=='boolean'||!Array.isArray(s.countdowns)||s.countdowns.length>3||!Array.isArray(s.annual)||s.annual.length>500)throw Error('קובץ הגיבוי אינו תקין.');for(const e of [...s.countdowns,...s.annual]){if(!e||typeof e.id!=='string'||e.id.length>100||typeof e.title!=='string'||!e.title.trim()||e.title.length>80)throw Error('פרטי האירועים אינם תקינים.');}if(new Set([...s.countdowns,...s.annual].map(e=>e.id)).size!==s.countdowns.length+s.annual.length)throw Error('מזהי האירועים כפולים.');for(const e of s.countdowns)if(!validDate(e.date))throw Error('תאריך יעד אינו תקין.');for(const e of s.annual)if(!MONTHS.includes(e.month)||!Number.isInteger(e.day)||e.day<1||e.day>30||!['birthday','memorial','anniversary'].includes(e.kind)||!['first','second','both'].includes(e.adar)||!['previous','next'].includes(e.missing)||(e.year!==null&&(!Number.isInteger(e.year)||e.year<5000||e.year>6000)))throw Error('תאריך עברי אינו תקין.');return s;}
let state=defaults();let loadError='';try{const saved=localStorage.getItem(KEY);if(saved)state=validateData(JSON.parse(saved));}catch(e){loadError='לא ניתן לקרוא את הנתונים השמורים. מוצגת גרסת ברירת המחדל.';}
async function save(next){
 if(!canEdit||!cloudReady||saving){toast(saving?'השמירה הקודמת עדיין מתבצעת':'נדרשים חיבור ללוח וכניסת מנהל כדי לשמור');return false;}
 const expectedRevision=revision;
 saving=true;
 try{
  validateData(next);
  await runTransaction(db,async transaction=>{
   const current=await transaction.get(boardRef);
   const remoteRevision=current.exists()?(current.data().revision||0):0;
   if(remoteRevision!==expectedRevision)throw Error('conflict');
   transaction.set(boardRef,{...next,revision:remoteRevision+1});
  });
  state=next;revision=expectedRevision+1;cacheState();render();return true;
 }catch(error){toast(error.message==='conflict'?'הלוח עודכן במכשיר אחר. נסה שוב לאחר רענון הנתונים.':'השמירה בענן נכשלה. בדוק חיבור ורשאות Firebase.');return false;}
 finally{saving=false;}
}
function cacheState(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}}

let toastTimer;function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500);}
function fmtDate(s){return new Intl.DateTimeFormat('he-IL',{day:'numeric',month:'numeric',year:'numeric',timeZone:ZONE}).format(new Date(stamp(s)));}
function weeksText(days){const w=Math.floor(days/7),d=days%7;const a=w===1?'שבוע':w===2?'שבועיים':w?`${w} שבועות`:'';const b=d===1?'יום':d===2?'יומיים':d?`${d} ימים`:'';return [a,b].filter(Boolean).join(' ו־');}
function renderClock(){const now=new Date();$('clock').textContent=new Intl.DateTimeFormat('he-IL',{timeZone:ZONE,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);$('date').textContent=new Intl.DateTimeFormat('he-IL',{weekday:'long',day:'numeric',month:'long',timeZone:ZONE}).format(now);$('hebrew').textContent=hebrewText(now);$('last-update').textContent=$('clock').textContent;const key=civil(now);if(key!==lastDay){lastDay=key;renderContent();}}
let lastDay='';

function weeksMarkup(days){const w=Math.floor(days/7),d=days%7;const parts=[];if(w)parts.push(w===1?'שבוע':w===2?'שבועיים':`<bdi>${w}</bdi> שבועות`);if(d)parts.push(d===1?'יום':d===2?'יומיים':`<bdi>${d}</bdi> ימים`);return parts.join(' ו־');}
function renderCountdowns(){
 let out=state.countdowns.map((e,i)=>{
  const n=daysBetween(civil(),e.date);
  const value=n===0?'<strong class="due-today">היום!</strong>':n<0?'<span class="unit">האירוע הסתיים</span>':state.mode==='weeks'?`<strong class="weeks-primary" dir="rtl">${weeksMarkup(n)}</strong>`:`<div class="days-primary" dir="rtl"><strong><bdi>${n}</bdi></strong><span class="unit">ימים</span></div><div class="secondary" dir="rtl">${weeksMarkup(n)}</div>`;
  return `<article class="countdown ${i===0?'featured':''}"><div class="countdown-details"><h3>${escapeHTML(e.title)}</h3><time datetime="${e.date}">${fmtDate(e.date)}</time></div><div class="remaining">${value}</div></article>`;
 }).join('');
 for(let i=state.countdowns.length;i<3;i++)out+='<button class="countdown add-card" data-action="new-count"><span class="plus" aria-hidden="true">＋</span><span>משהו לחכות לו</span></button>';
 $('countdowns').innerHTML=out;
}
function leap(year){return (7*year+1)%19<7;}
function targetMonths(e,year){if(!e.month.startsWith('אדר'))return [e.month];if(!leap(year))return ['אדר'];if(e.month==='אדר א׳'||e.month==='אדר ב׳')return [e.month];return e.adar==='both'?['אדר א׳','אדר ב׳']:[e.adar==='first'?'אדר א׳':'אדר ב׳'];}
function annualMatches(e,date){const h=hebrew(date);if(e.year!==null&&h.year<e.year)return false;const months=targetMonths(e,h.year);if(months.includes(h.month)&&e.day===h.day)return true;if(e.day!==30)return false;const prev=hebrew(new Date(date.getTime()-86400000)),next=hebrew(new Date(date.getTime()+86400000));if(e.missing==='previous')return h.day===29&&months.includes(h.month)&&next.month!==h.month;return h.day===1&&prev.day===29&&targetMonths(e,prev.year).includes(prev.month);}
function eventIllustration(kind){
 const art={
 birthday:'<ellipse cx="32" cy="56" rx="26" ry="4" fill="#dbe5ef"/><rect x="10" y="32" width="44" height="22" rx="4" fill="#e8bd84" stroke="#b78048"/><path d="M11 44h42" stroke="#fff1d9" stroke-width="5"/><path d="M10 33c0-5 5-8 22-8s22 3 22 8v5c-4 5-7-4-11 0s-7 4-11 0-7 4-11 0-7 4-11 0z" fill="#f9e4eb" stroke="#c88da2"/><rect x="29" y="14" width="6" height="17" rx="2" fill="#7199c9"/><path d="M30 19l4 3m-4 3l4 3" stroke="#edf5ff"/><path d="M32 13c-8-4-2-9 0-12 5 6 7 9 0 12" fill="#e5a34b" stroke="#bd8135"/>',
 anniversary:'<circle cx="27" cy="40" r="16" fill="none" stroke="#cda762" stroke-width="5"/><circle cx="39" cy="42" r="15" fill="none" stroke="#e1bd76" stroke-width="5"/><path d="M19 16l8-8 8 8-8 12z" fill="#e0edf6" stroke="#7698b2"/><path d="M19 16h16M27 8l-3 8 3 12 3-12z" fill="none" stroke="#7698b2"/>',
 memorial:'<ellipse cx="32" cy="56" rx="18" ry="4" fill="#d6d9df"/><rect x="20" y="27" width="24" height="28" rx="4" fill="#f6f3ea" stroke="#9b9da3"/><ellipse cx="32" cy="27" rx="12" ry="4" fill="#e4dfd1" stroke="#9b9da3"/><path d="M32 27v-7" stroke="#666974"/><path d="M32 21c-12-5-2-14 1-19 7 10 10 16-1 19" fill="#d8b16a"/><path d="M32 19c-4-3-1-6 0-9 4 5 4 7 0 9" fill="#fff0c5"/>'
 };
 return `<svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${art[kind]}</svg>`;
}
function monthlyEvents(annual,today=new Date(stamp(civil()))){
 const current=hebrew(today),events=[];
 // Upcoming dates through the end of the current Hebrew month, including today.
 for(let offset=0;offset<31;offset++){
  const date=new Date(today.getTime()+offset*86400000),h=hebrew(date);
  if(h.month!==current.month||h.year!==current.year)break;
  for(const e of annual)if(annualMatches(e,date))events.push({e,offset,date});
 }
 return events;
}
let familyPage=0;
function renderFamily(){
 let events=monthlyEvents(state.annual);
 if(new URLSearchParams(location.search).get('tv')==='1'&&window.innerWidth>760){
  const today=events.filter(x=>x.offset===0),upcoming=events.filter(x=>x.offset>0);
  const slots=Math.max(1,Math.floor(($('family').clientHeight||220)/88));
  if(today.length<slots){
   const remaining=slots-today.length,pages=Math.max(1,Math.ceil(upcoming.length/remaining));
   familyPage%=pages;events=[...today,...upcoming.slice(familyPage*remaining,(familyPage+1)*remaining)];
  }else{
   const pages=Math.max(1,Math.ceil(events.length/slots));familyPage%=pages;events=events.slice(familyPage*slots,(familyPage+1)*slots);
  }
 }
 if(!events.length){$('family').innerHTML='<div class="empty"><p>אין אירועים נוספים החודש</p></div>';return;}
 $('family').innerHTML=events.map(({e,offset,date})=>{
  const years=e.year!==null?hebrew(date).year-e.year:null;
  const suffix=years!==null&&years>0?` · ${e.kind==='birthday'?'גיל '+years:e.kind==='anniversary'?years+' שנות נישואין':years+' שנים לזכרו/ה'}`:'';
  const actual=hebrew(date);
  return `<article class="event-row ${offset===0?'event-today':''} ${e.kind}"><div class="event-mark" aria-hidden="true">${eventIllustration(e.kind)}</div><div class="event-details"><div class="event-name">${escapeHTML(e.title)}</div><div class="event-meta">${eventKindLabel(e.kind)} · ${numeral(actual.day)} ב${escapeHTML(actual.month)}${suffix}</div></div><span class="today-tag">${offset===0?'היום':offset===1?'מחר':'בעוד '+offset+' ימים'}</span></article>`;
 }).join('');
}
function renderContent(){renderCountdowns();renderFamily();}
function renderAdmin(){const rows=(array,type)=>array.map(e=>`<div class="admin-row"><div class="details"><div class="event-name">${escapeHTML(e.title)}</div><div class="event-meta">${type==='count'?fmtDate(e.date):(eventKindLabel(e.kind))+' · '+numeral(e.day)+' ב'+escapeHTML(e.month)+(e.year?' · '+numeral(e.year%1000):'')}</div></div><div class="actions"><button data-action="edit-${type}" data-id="${escapeHTML(e.id)}">עריכה</button><button class="danger" data-action="delete-${type}" data-id="${escapeHTML(e.id)}" aria-label="מחיקת ${escapeHTML(e.title)}">מחיקה</button></div></div>`).join('');$('count-admin').innerHTML=rows(state.countdowns,'count');$('annual-admin').innerHTML=rows(state.annual,'annual')||'<div class="empty"><p>עדיין לא נוספו תאריכים.</p></div>';$('count-limit').textContent=state.countdowns.length+' מתוך 3';$('add-count').disabled=state.countdowns.length>=3;$('display-mode').value=state.mode;}
function render(){renderContent();renderAdmin();renderClock();}
function route(){const admin=location.hash==='#/admin';document.body.classList.toggle('display-mode',!admin);document.body.classList.toggle('tv-mode',!admin&&new URLSearchParams(location.search).get('tv')==='1');$('admin-content').hidden=!canEdit;$('admin').hidden=!admin;$('board').hidden=admin;$('nav-link').href=admin?'#/':'#/admin';$('nav-link').textContent=admin?'חזרה ללוח':'ניהול הלוח ⚙';$('fullscreen').hidden=admin;document.title=admin?'ניהול הלוח | היום שלנו':'היום שלנו | לוח אישי';if(admin)renderAdmin();window.scrollTo(0,0);}
let editing=null,returnFocus=null;
function openEditor(type,id){if(!canEdit){location.hash='#/admin';return;}const array=type==='count'?state.countdowns:state.annual;if(!id&&type==='count'&&array.length>=3){toast('אפשר להציג עד שלושה אירועים.');return;}const event=id?array.find(e=>e.id===id):null;if(id&&!event)return;editing={type,id};returnFocus=document.activeElement;$('dialog-title').textContent=(id?'עריכת ':'הוספת ')+(type==='count'?'אירוע':'תאריך עברי');let out=`<label class="wide">${type==='count'?'שם האירוע':'שם האדם או בני הזוג'}<input name="title" required maxlength="80" value="${escapeHTML(event?.title||'')}" autocomplete="off"></label>`;if(type==='count')out+='<label class="wide">תאריך האירוע<input name="date" type="date" min="1900-01-01" max="2200-12-31" required value="'+(event?.date||'')+'"></label>';else out+=`<label>סוג האירוע<select name="kind"><option value="birthday">יום הולדת</option><option value="anniversary">יום נישואין</option><option value="memorial">יום זיכרון</option></select></label><label>יום בחודש<select name="day">${Array.from({length:30},(_,i)=>`<option value="${i+1}">${numeral(i+1)} (${i+1})</option>`).join('')}</select></label><label>חודש עברי<select name="month">${MONTHS.map(m=>`<option>${m}</option>`).join('')}</select></label><label>שנה עברית (לא חובה)<input name="year" type="text" maxlength="12" placeholder="לדוגמה תשל״ד או 5734"><span class="hint">אפשר להזין באותיות או בספרות. השנה תוצג באותיות, ולפיה יחושב גיל או מספר שנים.</span></label><label class="wide">אירוע באדר רגיל בשנה מעוברת<select name="adar"><option value="second">להציג באדר ב׳</option><option value="first">להציג באדר א׳</option><option value="both">להציג בשני חודשי אדר</option></select><span class="hint">אירוע באדר א׳ או ב׳ יוצג באדר בשנה רגילה.</span></label><label class="wide">אם יום ל׳ אינו קיים באותה שנה<select name="missing"><option value="previous">להציג בכ״ט באותו חודש</option><option value="next">להציג בא׳ בחודש הבא</option></select><span class="hint">בחר לפי המנהג המשפחתי שלך.</span></label>`;$('form-fields').innerHTML=out;if(type==='annual'){const f=$('event-form').elements;f.kind.value=event?.kind||'birthday';f.day.value=event?.day||1;f.month.value=event?.month||'תשרי';f.year.value=event?.year?numeral(event.year%1000):'';f.adar.value=event?.adar||'second';f.missing.value=event?.missing||'previous';}$('form-error').hidden=true;$('modal').hidden=false;document.querySelector('.wrap').inert=true;document.body.style.overflow='hidden';$('event-form').elements.title.focus();}
function closeEditor(){$('modal').hidden=true;document.querySelector('.wrap').inert=false;document.body.style.overflow='';returnFocus?.focus();editing=null;}
$('event-form').addEventListener('submit',async event=>{event.preventDefault();const f=new FormData(event.target);const title=f.get('title').trim();if(!title)return formError('יש להזין שם.');const e={id:editing.id||('e'+Date.now().toString(36)+Math.random().toString(36).slice(2)),title};if(editing.type==='count'){e.date=f.get('date');if(!validDate(e.date))return formError('יש לבחור תאריך תקין.');}else{Object.assign(e,{kind:f.get('kind'),day:Number(f.get('day')),month:f.get('month'),year:f.get('year').trim()?parseHebrewYear(f.get('year')):null,adar:f.get('adar'),missing:f.get('missing')});if(e.year!==null&&(!Number.isInteger(e.year)||e.year<5001||e.year>5999))return formError('יש להזין שנה עברית תקינה, למשל תשל״ד או 5734.');if(e.day===30&&['טבת','אדר','אדר ב׳','אייר','תמוז','אלול'].includes(e.month))return formError('בחודש הזה אין יום ל׳. יש לבחור תאריך אחר.');}const key=editing.type==='count'?'countdowns':'annual';const next=structuredClone(state);if(editing.id)next[key]=next[key].map(x=>x.id===editing.id?e:x);else next[key].push(e);if(await save(next)){closeEditor();toast('האירוע נשמר');}});
function formError(s){$('form-error').textContent=s;$('form-error').hidden=false;}
$('close-modal').onclick=closeEditor;$('cancel').onclick=closeEditor;$('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeEditor();});document.addEventListener('keydown',e=>{if($('modal').hidden)return;if(e.key==='Escape'){e.preventDefault();closeEditor();}if(e.key==='Tab'){const nodes=[...$('modal').querySelectorAll('button,input,select')].filter(x=>!x.disabled);const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-action]');if(!b)return;if(!canEdit){location.hash='#/admin';return;}const [action,type]=b.dataset.action.split('-');if(action==='new'||action==='edit')openEditor(type,b.dataset.id);else if(action==='delete'){const key=type==='count'?'countdowns':'annual';const entry=state[key].find(e=>e.id===b.dataset.id);if(entry&&confirm(`למחוק את ״${entry.title}״?`)){const next=structuredClone(state);next[key]=next[key].filter(e=>e.id!==entry.id);if(await save(next))toast('האירוע נמחק');}}});
$('save-settings').onclick=async()=>{const next=structuredClone(state);next.mode=$('display-mode').value;if(await save(next))toast('ההגדרות נשמרו');};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('באייפד אפשר להוסיף את הדף למסך הבית מתוך תפריט השיתוף.');}catch(e){toast('הדפדפן אינו מאפשר מסך מלא.');}};
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='dashboard-backup-'+civil()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};$('import').onclick=()=>$('import-file').click();$('import-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1000000)throw Error('קובץ הגיבוי גדול מדי.');const next=validateData(JSON.parse(await file.text()));if(confirm('להחליף את כל נתוני הלוח בנתונים מהגיבוי?')&&await save(next))toast('הגיבוי נטען בהצלחה');}catch(error){toast('הייבוא נכשל: '+error.message);}finally{e.target.value='';}};
if(location.pathname.endsWith('/admin')&&!location.hash)location.hash='#/admin';window.addEventListener('hashchange',route);document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderClock();});render();route();if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>renderFamily()).observe($('family'));setInterval(renderClock,1000);setInterval(()=>{if(document.body.classList.contains('tv-mode')&&!document.hidden){familyPage++;renderFamily();}},15000);window.addEventListener('resize',()=>{familyPage=0;renderFamily();});if(loadError)toast(loadError);

const authMessages={
 'auth/unauthorized-domain':'יש לאשר את shayeisenberg.com בדומיינים המורשים ב־Firebase.',
 'auth/operation-not-allowed':'יש להפעיל כניסה עם Google ב־Firebase Authentication.',
 'auth/popup-blocked':'חלון הכניסה נחסם. אפשר חלונות קופצים ונסה שוב.',
 'auth/invalid-api-key':'יש לבדוק את הגדרת Firebase של האתר.',
 'auth/network-request-failed':'לא ניתן להתחבר ל־Google כרגע. בדוק את החיבור ונסה שוב.'
};
$('sign-in').onclick=async()=>{
 $('sign-in').disabled=true;
 try{const provider=new GoogleAuthProvider();provider.setCustomParameters({login_hint:ADMIN_EMAIL,prompt:'select_account'});await signInWithPopup(auth,provider);}
 catch(error){if(error.code!=='auth/popup-closed-by-user')$('auth-status').textContent=authMessages[error.code]||'הכניסה לא הצליחה. נסה שוב.';}
 finally{$('sign-in').disabled=false;}
};
$('sign-out').onclick=()=>signOut(auth);
const slides=setupSlideshow({app,db,isAdmin:()=>canEdit,toast});
onAuthStateChanged(auth,user=>{
 canEdit=!!user&&user.emailVerified&&user.email?.toLowerCase()===ADMIN_EMAIL;
 $('sign-in').hidden=canEdit;$('sign-out').hidden=!user;
 $('auth-status').textContent=canEdit?'מחובר כמנהל הלוח':user?'לחשבון הזה אין הרשאת ניהול. יש להיכנס עם חשבון המנהל.':'כדי לערוך את הלוח יש להיכנס עם חשבון המנהל.';
 if(!canEdit&&!$('modal').hidden)closeEditor();
 route();slides.updateControls();
});
onSnapshot(boardRef,{includeMetadataChanges:true},snapshot=>{
 try{
  if(snapshot.exists()){state=validateData(snapshot.data());revision=snapshot.data().revision||0;}
  else{state=defaults();revision=0;}
  cloudReady=!snapshot.metadata.fromCache;
  cacheState();render();
  $('sync-status').textContent=cloudReady?'הלוח מסונכרן': 'מוצגים נתונים שמורים · ממתין לחיבור';
 }catch{$('sync-status').textContent='לא ניתן לקרוא את נתוני הלוח';cloudReady=false;}
},()=>{cloudReady=false;$('sync-status').textContent='החיבור ללוח טרם הושלם · מוצגת תצוגה שמורה';});
