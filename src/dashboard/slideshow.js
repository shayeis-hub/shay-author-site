import {getStorage, ref, uploadBytes, getDownloadURL, getMetadata, list} from 'firebase/storage';
import {doc, onSnapshot, runTransaction} from 'firebase/firestore';

const MAX_PHOTOS=60;
const PREFIX='dashboard-photos/';
const TYPES=['image/jpeg','image/png','image/webp'];
const defaults=()=>({version:1,revision:0,interval:30,fit:'contain',shuffle:false,photos:[]});
export function validateSlides(data){
  if(!data||data.version!==1||!Number.isInteger(data.revision)||data.revision<0||![15,30,60,120].includes(data.interval)||!['contain','cover'].includes(data.fit)||typeof data.shuffle!=='boolean'||!Array.isArray(data.photos)||data.photos.length>MAX_PHOTOS)throw Error('נתוני התמונות אינם תקינים');
  const paths=new Set();
  for(const p of data.photos){
    const url=new URL(p.url);
    if(typeof p.path!=='string'||!p.path.startsWith(PREFIX)||p.path.length>500||typeof p.title!=='string'||p.title.length>120||paths.has(p.path)||url.protocol!=='https:'||url.hostname!=='firebasestorage.googleapis.com'||!url.pathname.startsWith('/v0/b/shay-dashboard-67ba6.firebasestorage.app/o/dashboard-photos%2F'))throw Error('תמונה אינה תקינה');
    paths.add(p.path);
  }
  return data;
}

export function setupSlideshow({app,db,isAdmin,toast}){
  const $=id=>document.getElementById(id);
  const storage=getStorage(app),slidesRef=doc(db,'slides','home');
  let state=defaults(),ready=false,busy=false,timer=null,activeSlot=0,currentPath='',generation=0;
  let order=[],cursor=0,paused=document.hidden,failed=new Set(),settingsDirty=false;
  const settingIds=['photo-interval','photo-fit','photo-shuffle'];
  const readSettings=()=>({interval:Number($('photo-interval').value),fit:$('photo-fit').value,shuffle:$('photo-shuffle').checked});
  for(const id of settingIds)$(id).addEventListener('change',()=>{settingsDirty=true;});
  const status=message=>{$('photo-operation').textContent=message;};
  function updateControls(){
    for(const id of ['upload-photos','scan-photos','save-photos'])$(id).disabled=!isAdmin()||!ready||busy;
    $('photo-count').textContent=state.photos.length+' תמונות';
    if(!settingsDirty){$('photo-interval').value=String(state.interval);$('photo-fit').value=state.fit;$('photo-shuffle').checked=state.shuffle;}
    for(const id of settingIds)$(id).disabled=!isAdmin()||!ready||busy;
    const container=$('photo-admin');container.replaceChildren();
    state.photos.forEach((photo,index)=>{
      const item=document.createElement('div');item.className='photo-admin-item';
      const img=document.createElement('img');img.src=photo.url;img.alt='';img.loading='lazy';item.append(img);
      const label=document.createElement('p');label.textContent=photo.title;item.append(label);
      const actions=document.createElement('div');actions.className='settings-actions';
      for(const [text,delta] of [['↑',-1],['↓',1]]){
        const b=document.createElement('button');b.textContent=text;b.setAttribute('aria-label',(delta<0?'הקדמת ':'דחיית ')+photo.title);b.disabled=busy||index+delta<0||index+delta>=state.photos.length;
        b.onclick=async()=>{const next=structuredClone(state);[next.photos[index],next.photos[index+delta]]=[next.photos[index+delta],next.photos[index]];await save(next);};actions.append(b);
      }
      item.append(actions);
      const remove=document.createElement('button');remove.className='danger';remove.textContent='הסרה מהמצגת';remove.disabled=busy;
      remove.onclick=async()=>{const next=structuredClone(state);next.photos=next.photos.filter(p=>p.path!==photo.path);await save(next);};item.append(remove);container.append(item);
    });
  }
  async function save(next){
    if(!isAdmin()||!ready||busy)return false;
    const expected=state.revision;next={...next,...readSettings()};busy=true;updateControls();
    try{
      validateSlides(next);
      await runTransaction(db,async tx=>{
        const snap=await tx.get(slidesRef),revision=snap.exists()?snap.data().revision:0;
        if(revision!==expected)throw Error('conflict');
        tx.set(slidesRef,{...next,revision:revision+1});
      });
      state={...next,revision:expected+1};settingsDirty=false;status('התמונות וההגדרות נשמרו');return true;
    }catch(error){status(error.message==='conflict'?'המצגת עודכנה במכשיר אחר. נסה שוב.':'שמירת התמונות נכשלה. בדוק את כללי Firestore והחיבור.');return false;}
    finally{busy=false;updateControls();}
  }
  function resetOrder(){
    order=state.photos.map((_,i)=>i);
    if(state.shuffle)for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    cursor=0;failed.clear();
  }
  function schedule(){clearTimeout(timer);if(state.photos.length>1&&!paused)timer=setTimeout(showNext,state.interval*1000);}
  async function showNext(){
    if(!state.photos.length)return;
    if(failed.size===state.photos.length)failed.clear();
    let photo=null;
    for(let attempt=0;attempt<order.length;attempt++){
      const candidate=state.photos[order[cursor++%order.length]];
      if(!failed.has(candidate.path)&&(candidate.path!==currentPath||state.photos.length===1)){photo=candidate;break;}
    }
    if(!photo){schedule();return;}
    const thisGeneration=generation;
    try{
      const preload=new Image();preload.src=photo.url;await preload.decode();
      if(thisGeneration!==generation)return;
      const slot=1-activeSlot,img=$(slot?'photo-b':'photo-a'),old=$(activeSlot?'photo-b':'photo-a');
      // Paint the decoded incoming image at zero opacity before starting the fade.
      img.classList.remove('active');img.style.zIndex='2';old.style.zIndex='1';
      img.style.objectFit=state.fit;img.src=photo.url;img.hidden=false;
      await img.decode();
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      if(thisGeneration!==generation)return;
      img.classList.add('active');
      // Keep the old image opaque underneath until the incoming image fully covers it.
      setTimeout(()=>{if(thisGeneration===generation&&currentPath===photo.path)old.classList.remove('active');},2500);
      $('photo-stage').style.setProperty('--slide-background',`url(${JSON.stringify(new URL(photo.url).href)})`);
      $('photo-empty').hidden=true;$('photo-caption').hidden=false;$('photo-caption').textContent=(state.photos.findIndex(p=>p.path===photo.path)+1)+' / '+state.photos.length;
      activeSlot=slot;currentPath=photo.path;
    }catch{failed.add(photo.path);if(failed.size===state.photos.length){$('photo-empty').hidden=false;$('photo-empty').querySelector('p').textContent='לא ניתן לטעון את התמונות כרגע';}}
    schedule();
  }
  function render(){
    generation++;clearTimeout(timer);currentPath='';resetOrder();updateControls();
    if(!state.photos.length){for(const id of ['photo-a','photo-b']){$(id).classList.remove('active');$(id).hidden=true;}$('photo-empty').hidden=false;$('photo-empty').querySelector('p').textContent='התמונות שלך, ברגעים שבין לבין';$('photo-caption').hidden=true;$('photo-stage').style.removeProperty('--slide-background');}
    else void showNext();
  }
  async function prepareImage(file){
    if(!TYPES.includes(file.type))throw Error('יש לבחור JPG, PNG או WebP');
    const bitmap=await createImageBitmap(file);
    try{
      const scale=Math.min(1,2560/Math.max(bitmap.width,bitmap.height));
      const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
      const context=canvas.getContext('2d');context.fillStyle='white';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.88));
      if(!blob)throw Error('לא ניתן לעבד את התמונה');return blob;
    }finally{bitmap.close();}
  }
  async function addPhotos(photos){
    const next=structuredClone(state),known=new Set(next.photos.map(p=>p.path));
    for(const photo of photos)if(!known.has(photo.path)&&next.photos.length<MAX_PHOTOS){known.add(photo.path);next.photos.push(photo);}
    return save(next);
  }
  $('upload-photos').onclick=()=>{if(isAdmin()&&ready&&!busy)$('photo-files').click();};
  $('photo-files').onchange=async event=>{
    if(!isAdmin()||!ready||busy)return;
    const files=[...event.target.files];event.target.value='';if(!files.length)return;
    if(files.length+state.photos.length>MAX_PHOTOS){toast('אפשר להציג עד 60 תמונות');return;}
    busy=true;updateControls();const uploaded=[];let failedUploads=0;
    for(let i=0;i<files.length;i++){
      status('מעלה תמונה '+(i+1)+' מתוך '+files.length+'…');
      try{
        if(!isAdmin())throw Error('נדרשת כניסת מנהל');
        const blob=await prepareImage(files[i]),path=PREFIX+crypto.randomUUID()+'.jpg',target=ref(storage,path);
        await uploadBytes(target,blob,{contentType:'image/jpeg',customMetadata:{title:files[i].name.slice(0,120)}});
        uploaded.push({path,url:await getDownloadURL(target),title:files[i].name.slice(0,120)});
      }catch(error){failedUploads++;status('העלאת תמונה נכשלה. בדוק הרשאות Storage ופורמט הקובץ.');}
    }
    busy=false;
    const saved=uploaded.length?await addPhotos(uploaded):false;
    if(!saved&&uploaded.length)status('הקבצים הועלו, אך השמירה למצגת נכשלה. ניתן לטעון אותם שוב מ־Storage.');
    else if(failedUploads)status('נשמרו '+uploaded.length+' תמונות; '+failedUploads+' העלאות נכשלו.');
    updateControls();
  };
  $('scan-photos').onclick=async()=>{
    if(!isAdmin()||!ready||busy)return;
    busy=true;updateControls();status('טוען תמונות מ־Storage…');const photos=[];
    try{
      let pageToken,processed=0;
      do{
        const page=await list(ref(storage,PREFIX),{maxResults:100,...(pageToken?{pageToken}:{})});
        for(const item of page.items){
          if(photos.length>=MAX_PHOTOS)break;
          const metadata=await getMetadata(item);
          if(TYPES.includes(metadata.contentType))photos.push({path:item.fullPath,url:await getDownloadURL(item),title:(metadata.customMetadata?.title||item.name).slice(0,120)});
        }
        processed+=page.items.length;pageToken=page.nextPageToken;
      }while(pageToken&&photos.length<MAX_PHOTOS&&processed<500);
      busy=false;
      if(photos.length)await addPhotos(photos);else status('לא נמצאו תמונות בתיקייה dashboard-photos. העלה אליה JPG, PNG או WebP.');
    }catch{busy=false;status('טעינת התמונות נכשלה. בדוק ש־Storage פעיל ושכללי האחסון פורסמו.');}
    finally{busy=false;updateControls();}
  };
  $('save-photos').onclick=()=>void save(structuredClone(state));
  document.addEventListener('visibilitychange',()=>{paused=document.hidden;if(paused)clearTimeout(timer);else{failed.clear();schedule();}});
  onSnapshot(slidesRef,{includeMetadataChanges:true},snapshot=>{
    try{state=snapshot.exists()?validateSlides(snapshot.data()):defaults();ready=!snapshot.metadata.fromCache;render();}
    catch{ready=false;status('לא ניתן לקרוא את נתוני המצגת');updateControls();}
  },()=>{ready=false;status('יש לפרסם את כללי התמונות ב־Firestore לפני העלאה.');updateControls();});
  render();
  return {updateControls};
}
