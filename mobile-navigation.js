/* Navegação mobile original, separada da sidebar desktop. */
(function(){
 const ICONS={home:'<path class="m" d="M12 3.2 19.6 8.6c.9.6 1.4 1.6 1.4 2.7V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-6.7c0-1.1.5-2.1 1.4-2.7z"/><path class="d" d="M9 15.2c1.8 1.6 4.2 1.6 6 0"/>',income:'<circle class="m" cx="12" cy="12" r="9.2"/><path class="d" d="M12 7.5v8.5M8.5 12.8l3.5 3.5 3.5-3.5"/>',expense:'<circle class="m" cx="12" cy="12" r="9.2"/><path class="d" d="M12 16.5V8M8.5 11.2 12 7.7l3.5-3.5"/>',settings:'<rect class="m" x="3" y="3" width="18" height="18" rx="5.5"/><path class="d" d="M7.5 9h9M7.5 15h9"/><circle class="d" cx="14.5" cy="9" r="1.7"/><circle class="d" cx="9.5" cy="15" r="1.7"/>'};
 const tabs=[{key:'home',view:'overview'},{key:'income',view:'income'},{key:'expense',view:'transactions'},{key:'settings',view:'connection'}];
 const root=document.getElementById('mobileNavigation');if(!root)return;
 const bar=root.querySelector('.app-nav'),buttons=[...bar.querySelectorAll('button[data-view]')],shape=root.querySelector('#mobileNavShape'),path=root.querySelector('#mobileNavPath'),pill=root.querySelector('#mobileNavPill');
 if(buttons.length!==tabs.length||!shape||!path||!pill)return;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches,height=72,depth=34,half=48,radius=26,pad=20;
 let width=0,current=0,center=0,frame=0;
 const icon=key=>'<svg class="ico" viewBox="0 0 24 24">'+ICONS[key]+'</svg>';
 function target(i){return pad+(width-2*pad)/tabs.length*(i+.5)}
 function draw(x){const left=Math.min(half,x-4),right=Math.min(half,width-x-4),lr=Math.min(radius,x-left),rr=Math.min(radius,width-x-right);const d='M'+lr+' 0H'+(x-left)+'C'+(x-left*.57)+' 0 '+(x-left*.57)+' '+depth+' '+x+' '+depth+'C'+(x+right*.57)+' '+depth+' '+(x+right*.57)+' 0 '+(x+right)+' 0H'+(width-rr)+'Q'+width+' 0 '+width+' '+rr+'V'+(height-radius)+'Q'+width+' '+height+' '+(width-radius)+' '+height+'H'+radius+'Q0 '+height+' 0 '+(height-radius)+'V'+lr+'Q0 0 '+lr+' 0Z';path.setAttribute('d',d);pill.style.transform='translateX('+(x-27)+'px)'}
 function select(i,instant){if(!Number.isInteger(i)||i<0||i>=tabs.length)return;current=i;buttons.forEach((b,n)=>{b.classList.toggle('active',n===i);b.setAttribute('aria-current',n===i?'page':'false')});pill.innerHTML=icon(tabs[i].key);cancelAnimationFrame(frame);const from=center,to=target(i),started=performance.now(),duration=(reduce||instant)?0:420;if(!duration){center=to;draw(to);return}const animate=now=>{const p=Math.min(1,(now-started)/duration),e=1-Math.pow(1-p,3);center=from+(to-from)*e;draw(center);if(p<1)frame=requestAnimationFrame(animate)};frame=requestAnimationFrame(animate)}
 buttons.forEach((b,i)=>b.addEventListener('click',()=>{if(typeof window.switchView==='function')window.switchView(tabs[i].view)}));
 const desktopSelect=window.selectMobileNav;window.selectMobileNav=function(index){if(typeof desktopSelect==='function')desktopSelect(index);select(Number(index),false)};
 const resize=()=>{width=bar.clientWidth;shape.setAttribute('viewBox','0 0 '+width+' '+height);center=target(current);draw(center)};
 if('ResizeObserver'in window)new ResizeObserver(resize).observe(bar);else window.addEventListener('resize',resize);
 resize();select(0,true);
})();