/* Sincroniza a navegação Prism mobile com as rotas e a sidebar desktop. */
(function(){
 const root=document.getElementById('mobileNavigation');
 if(!root)return;
 const buttons=[...root.querySelectorAll('.app-nav button[data-view]')];
 function select(index){
  const activeIndex=Number(index);
  if(!Number.isInteger(activeIndex)||activeIndex<0||activeIndex>=buttons.length)return;
  buttons.forEach((button,i)=>{
   const active=i===activeIndex;
   button.classList.toggle('active',active);
   button.setAttribute('aria-current',active?'page':'false');
  });
 }
 const desktopSelect=window.selectMobileNav;
 window.selectMobileNav=function(index){
  if(typeof desktopSelect==='function')desktopSelect(index);
  select(index);
 };
 buttons.forEach(button=>{
  button.addEventListener('click',()=>{
   if(typeof window.switchView==='function')window.switchView(button.dataset.view);
  });
 });
 select(0);
})();