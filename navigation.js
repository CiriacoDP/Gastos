/* Navegação Prism: mantém as rotas reais do aplicativo. */
window.APP_NAV_TABS=[
 {key:'home',view:'overview'},
 {key:'income',view:'income'},
 {key:'expense',view:'transactions'},
 {key:'settings',view:'connection'}
];
const prismButtons=[...document.querySelectorAll('.app-nav .prism-tab[data-view]')];
window.selectMobileNav=function(index){
 prismButtons.forEach((button,n)=>{
  const active=n===index;
  button.classList.toggle('active',active);
  button.setAttribute('aria-current',active?'true':'false');
 });
};
prismButtons.forEach((button,index)=>{
 button.addEventListener('click',()=>{
  const tab=window.APP_NAV_TABS[index];
  if(tab&&typeof window.switchView==='function')window.switchView(tab.view);
 });
});
window.selectMobileNav(0);