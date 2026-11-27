/* Navegação mobile: movimento copiado do HTML de referência */
const ICONS={home:'<path class="m" d="M12 3.2 19.6 8.6c.9.6 1.4 1.6 1.4 2.7V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-6.7c0-1.1.5-2.1 1.4-2.7z"/><path class="d" d="M9 15.2c1.8 1.6 4.2 1.6 6 0"/>',income:'<circle class="m" cx="12" cy="12" r="9.2"/><path class="d" d="M12 7.5v8.5M8.5 12.8l3.5 3.5 3.5-3.5"/>',expense:'<circle class="m" cx="12" cy="12" r="9.2"/><path class="d" d="M12 16.5V8M8.5 11.2 12 7.7l3.5 3.5"/>',settings:'<rect class="m" x="3" y="3" width="18" height="18" rx="5.5"/><path class="d" d="M7.5 9h9M7.5 15h9"/><circle class="d" cx="14.5" cy="9" r="1.7"/><circle class="d" cx="9.5" cy="15" r="1.7"/>'};
window.APP_NAV_TABS=[{key:'home',view:'overview'},{key:'income',view:'income'},{key:'expense',view:'transactions'},{key:'settings',view:'connection'}];
const TABS=window.APP_NAV_TABS;
const nav=document.getElementById('appSidebar'),tabsEl=document.querySelector('.app-nav');
const buttons=[...tabsEl.querySelectorAll('[data-view]')];
const mobileNavShape=document.getElementById('mobileNavShape');
const mobileNavPath=document.getElementById('mobileNavPath');
const mobileNavPill=document.getElementById('mobileNavPill');
const mobileNavReduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileNavHeight=72,mobileNavDepth=34,mobileNavHalf=48,mobileNavRadius=26,mobileNavPad=20;
let mobileNavWidth=0,mobileNavCurrent=0,mobileNavCenter=0,mobileNavFrame=0;
const mobileNavSvg=key=>'<svg class="ico" viewBox="0 0 24 24">'+ICONS[key]+'</svg>';
function mobileNavTarget(index){return mobileNavPad+(mobileNavWidth-2*mobileNavPad)/TABS.length*(index+.5);}
function drawMobileNav(x){
 const left=Math.min(mobileNavHalf,x-4),right=Math.min(mobileNavHalf,mobileNavWidth-x-4);
 const leftRadius=Math.min(mobileNavRadius,x-left),rightRadius=Math.min(mobileNavRadius,mobileNavWidth-x-right);
 const d='M'+leftRadius+' 0H'+(x-left)+'C'+(x-left*.57)+' 0 '+(x-left*.57)+' '+mobileNavDepth+' '+x+' '+mobileNavDepth+'C'+(x+right*.57)+' '+mobileNavDepth+' '+(x+right*.57)+' 0 '+(x+right)+' 0H'+(mobileNavWidth-rightRadius)+'Q'+mobileNavWidth+' 0 '+mobileNavWidth+' '+rightRadius+'V'+(mobileNavHeight-mobileNavRadius)+'Q'+mobileNavWidth+' '+mobileNavHeight+' '+(mobileNavWidth-mobileNavRadius)+' '+mobileNavHeight+'H'+mobileNavRadius+'Q0 '+mobileNavHeight+' 0 '+(mobileNavHeight-mobileNavRadius)+'V'+leftRadius+'Q0 0 '+leftRadius+' 0Z';
 mobileNavPath.setAttribute('d',d);
 mobileNavPill.style.transform='translateX('+(x-27)+'px)';
}
window.selectMobileNav=function(index,instant){
 mobileNavCurrent=index;
 buttons.forEach((button,n)=>{
  button.classList.toggle('active',n===index);
  button.setAttribute('aria-current',n===index?'page':'false');
 });
 mobileNavPill.innerHTML=mobileNavSvg(TABS[index].key);
 cancelAnimationFrame(mobileNavFrame);
 const from=mobileNavCenter,to=mobileNavTarget(index),started=performance.now(),duration=(mobileNavReduce||instant)?0:420;
 if(!duration){mobileNavCenter=to;drawMobileNav(to);return;}
 const animate=now=>{
  const progress=Math.min(1,(now-started)/duration),eased=1-Math.pow(1-progress,3);
  mobileNavCenter=from+(to-from)*eased;drawMobileNav(mobileNavCenter);
  if(progress<1)mobileNavFrame=requestAnimationFrame(animate);
 };
 mobileNavFrame=requestAnimationFrame(animate);
}
buttons.forEach((button,index)=>button.addEventListener('click',()=>window.switchView(TABS[index].view)));
new ResizeObserver(()=>{
 mobileNavWidth=tabsEl.clientWidth;
 mobileNavShape.setAttribute('viewBox','0 0 '+mobileNavWidth+' '+mobileNavHeight);
 mobileNavCenter=mobileNavTarget(mobileNavCurrent);
 drawMobileNav(mobileNavCenter);
}).observe(tabsEl);
mobileNavWidth=tabsEl.clientWidth;
mobileNavCenter=mobileNavTarget(0);
selectMobileNav(0,true);
function switchView(name){
 const applyView=()=>{
  document.body.classList.toggle('settings-detail-open',name.startsWith('settings'));
  if(name==='connection')showSettingsHome();
  if(name!=='transactions'){
   const search=$('listSearch');
   if(search){
    search.value='';
    $('clearSearch').hidden=true;
    if(!$('transactionSearch').classList.contains('search-collapsed'))setTransactionSearchOpen(false);
   }
  }
  document.querySelectorAll('.view').forEach(v=>{
   v.classList.toggle('active',v.id===name);
  });
  const selected=name.startsWith('settings')?'connection':name;
  const selectedIndex=TABS.findIndex(tab=>tab.view===selected);
  if(selectedIndex>=0)selectMobileNav(selectedIndex,false);
  syncQuickAdd();
  window.scrollTo({top:0,behavior:'smooth'});
 };
 const current=document.querySelector('.view.active')?.id;
 if(current===name)return;
 const selected=name.startsWith('settings')?'connection':name;
 const nextIndex=TABS.findIndex(tab=>tab.view===selected);
 const currentIndex=TABS.findIndex(tab=>tab.view===current);
 applyView();
}
