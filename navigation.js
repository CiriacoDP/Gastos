/* Navegação Prism — estrutura e animações do código de referência, integrada às telas do Gastos. */
const TABS = [
  { key: 'home', label: 'Início', view: 'overview' },
  { key: 'income', label: 'Entradas', view: 'income' },
  { key: 'expense', label: 'Despesas', view: 'transactions' },
  { key: 'settings', label: 'Ajustes', view: 'connection' }
];
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H15v-6a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 15.5v6H4.5A1.5 1.5 0 0 1 3 20z"/>',
  income: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8m-3.5-3.5L12 16l3.5-3.5"/>',
  expense: '<circle cx="12" cy="12" r="9"/><path d="M12 16V8m-3.5 3.5L12 8l3.5 3.5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
};
const prismBar = document.getElementById('prismBar');
const prismTabs = [];
const sidebar = document.getElementById('appSidebar');
const desktopSvgNS = 'http://www.w3.org/2000/svg';
const desktopShape = document.createElementNS(desktopSvgNS, 'svg');
const desktopPath = document.createElementNS(desktopSvgNS, 'path');
desktopShape.setAttribute('class', 'desktop-nav-shape');
desktopShape.setAttribute('aria-hidden', 'true');
desktopShape.appendChild(desktopPath);
const desktopPill = document.createElement('div');
desktopPill.className = 'desktop-nav-pill';
desktopPill.setAttribute('aria-hidden', 'true');
sidebar.insertBefore(desktopShape, sidebar.firstChild);
sidebar.appendChild(desktopPill);
const DESKTOP_WIDTH = 232, DESKTOP_DEPTH = 34, DESKTOP_HALF = 48, DESKTOP_RADIUS = 26;
let desktopY = 0, desktopFrame = 0;
function renderIcon(key) {
  return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[key] + '</svg>';
}
function drawDesktopNav(y) {
  const height = sidebar.clientHeight;
  const a = y - DESKTOP_HALF, b = y + DESKTOP_HALF;
  desktopPath.setAttribute('d', 'M' + DESKTOP_RADIUS + ' 0H' + a + 'C' + (y - 27) + ' 0 ' + (y - 27) + ' ' + DESKTOP_DEPTH + ' ' + y + ' ' + DESKTOP_DEPTH +
    'C' + (y + 27) + ' ' + DESKTOP_DEPTH + ' ' + (y + 27) + ' 0 ' + b + ' 0H' + (height - DESKTOP_RADIUS) + 'Q' + height + ' 0 ' + height + ' ' + DESKTOP_RADIUS +
    'V' + (DESKTOP_WIDTH - DESKTOP_RADIUS) + 'Q' + height + ' ' + DESKTOP_WIDTH + ' ' + (height - DESKTOP_RADIUS) + ' ' + DESKTOP_WIDTH +
    'H' + DESKTOP_RADIUS + 'Q0 ' + DESKTOP_WIDTH + ' 0 ' + (DESKTOP_WIDTH - DESKTOP_RADIUS) + 'V' + DESKTOP_RADIUS + 'Q0 0 ' + DESKTOP_RADIUS + ' 0Z');
  desktopPath.setAttribute('transform', 'matrix(0 1 -1 0 ' + DESKTOP_WIDTH + ' 0)');
  desktopShape.setAttribute('viewBox', '0 0 ' + DESKTOP_WIDTH + ' ' + height);
  desktopPill.style.transform = 'translate(' + (DESKTOP_WIDTH - 29) + 'px,' + (y - 27) + 'px)';
}
function moveDesktopPill(index, instant) {
  if (!prismTabs[index]) return;
  const target = prismTabs[index].getBoundingClientRect().top - sidebar.getBoundingClientRect().top + prismTabs[index].offsetHeight / 2;
  cancelAnimationFrame(desktopFrame);
  const from = desktopY, start = performance.now(), duration = instant ? 0 : 420;
  if (!duration) { desktopY = target; drawDesktopNav(desktopY); return; }
  const step = now => {
    const progress = Math.min(1, (now - start) / duration), eased = 1 - Math.pow(1 - progress, 3);
    desktopY = from + (target - from) * eased;
    drawDesktopNav(desktopY);
    if (progress < 1) desktopFrame = requestAnimationFrame(step);
  };
  desktopFrame = requestAnimationFrame(step);
}
function setActiveTab(idx) {
  prismTabs.forEach((btn, i) => {
    const active = i === idx;
    btn.setAttribute('aria-current', active ? 'true' : 'false');
    btn.classList.toggle('active', active);
  });
  moveDesktopPill(idx, false);
}
window.selectMobileNav = function(index) {
  const idx = Number(index);
  if (Number.isInteger(idx) && idx >= 0 && idx < prismTabs.length) setActiveTab(idx);
};
window.APP_NAV_TABS = TABS.map(tab => ({ key: tab.key, view: tab.view }));
TABS.forEach((tab, idx) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'prism-tab';
  btn.dataset.view = tab.view;
  btn.setAttribute('aria-label', tab.label);
  btn.setAttribute('title', tab.label);
  btn.setAttribute('aria-current', 'false');
  btn.innerHTML = renderIcon(tab.key) + '<span class="prism-label">' + tab.label + '</span>';
  btn.addEventListener('click', () => {
    setActiveTab(idx);
    if (typeof window.switchView === 'function') window.switchView(tab.view);
  });
  prismBar.insertBefore(btn, prismBar.querySelector('.quick-add-button'));
  prismTabs.push(btn);
});
setActiveTab(0);
const desktopResizeObserver = new ResizeObserver(() => {
  if (!prismTabs.length) return;
  const active = Math.max(0, prismTabs.findIndex(btn => btn.getAttribute('aria-current') === 'true'));
  moveDesktopPill(active, true);
});
desktopResizeObserver.observe(sidebar);