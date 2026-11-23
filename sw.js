'use strict';

const APP_VERSION = '1.4.3';
const CACHE_PREFIX = 'meu-dinheiro-pwa-';
const CACHE_NAME = CACHE_PREFIX + APP_VERSION;

const APP_ROOT_URL = new URL('./', self.registration.scope);
const ROOT_KEY = APP_ROOT_URL.href;
const INDEX_URL = new URL('index.html', APP_ROOT_URL).href;
const VERSION_URL = new URL('version.json', APP_ROOT_URL).href;
const MANIFEST_URL = new URL('manifest.webmanifest', APP_ROOT_URL).href;
const ICON_URL = new URL('assets/app-icon.png', APP_ROOT_URL).href;

async function fetchNoStore(url) {
  return fetch(url + (url.includes('?') ? '&' : '?') + '_sw=' + Date.now(), {
    cache: 'no-store',
    redirect: 'follow'
  });
}

async function installCurrentShell() {
  const htmlResponse = await fetchNoStore(INDEX_URL);
  if (!htmlResponse.ok) {
    throw new Error('O HTML da versão ' + APP_VERSION + ' ainda não está disponível');
  }

  const html = await htmlResponse.clone().text();
  const expectedMeta = '<meta name="app-version" content="' + APP_VERSION + '">';
  if (!html.includes(expectedMeta)) {
    throw new Error('O HTML publicado ainda não corresponde à versão ' + APP_VERSION);
  }

  const cache = await caches.open(CACHE_NAME);

  // O HTML só entra no cache novo depois de confirmar sua versão.
  await cache.put(ROOT_KEY, htmlResponse.clone());
  await cache.put(INDEX_URL, htmlResponse.clone());

  // O manifesto pode estar terminando de propagar; só o guarda quando corresponder.
  try {
    const versionResponse = await fetchNoStore(VERSION_URL);
    if (versionResponse.ok) {
      const release = await versionResponse.clone().json();
      if (release.version === APP_VERSION && release.ready === true) {
        await cache.put(VERSION_URL, versionResponse.clone());
      }
    }
  } catch (error) {
    // A checagem de versão sempre tenta a rede antes de usar esta cópia local.
  }

  // Arquivos auxiliares são opcionais; a versão principal não depende deles.
  for (const url of [MANIFEST_URL, ICON_URL]) {
    try {
      const response = await fetchNoStore(url);
      if (response.ok) await cache.put(url, response.clone());
    } catch (error) {
      // A cópia local desses itens pode ser preenchida na próxima visita.
    }
  }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    try {
      await installCurrentShell();
      await self.skipWaiting();
    } catch (error) {
      // Se o Pages ainda estiver publicando, a instalação falha com segurança.
      // O registro tentará novamente quando o app voltar a ficar ativo.
      const existing = await caches.keys();
      if (!existing.includes(CACHE_NAME)) await caches.delete(CACHE_NAME);
      throw error;
    }
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'GET_APP_VERSION' && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ version: APP_VERSION });
  }
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

function extractVersionFromHtml(html) {
  const tag = html.match(/<meta[^>]*name=["']app-version["'][^>]*>/i)?.[0] || '';
  return tag.match(/content=["']([^"']+)["']/i)?.[1] || '';
}

function compareVersions(a, b) {
  const left = String(a || '').split('.').map(Number);
  const right = String(b || '').split('.').map(Number);
  if (left.length !== 3 || right.length !== 3 || [...left, ...right].some(n => !Number.isInteger(n))) return 0;
  for (let i = 0; i < 3; i++) {
    if (left[i] > right[i]) return 1;
    if (left[i] < right[i]) return -1;
  }
  return 0;
}

async function networkFirstDocument(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok) {
      const html = await response.clone().text();
      const deployedVersion = extractVersionFromHtml(html);

      // Nunca substitui uma cópia mais nova por HTML antigo servido temporariamente pela CDN.
      if (deployedVersion && compareVersions(deployedVersion, APP_VERSION) >= 0) {
        await cache.put(ROOT_KEY, response.clone());
        await cache.put(INDEX_URL, response.clone());
        return response;
      }

      const current = await cache.match(ROOT_KEY) || await cache.match(INDEX_URL);
      return current || response;
    }
    return response;
  } catch (error) {
    const cached = await cache.match(ROOT_KEY) || await cache.match(INDEX_URL);
    if (cached) return cached;
    return new Response(
      'O aplicativo está sem conexão e ainda não há uma cópia local disponível. Conecte-se à internet e abra novamente.',
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }
}

async function networkFirstResource(request, canonicalUrl) {
  try {
    const response = await fetch(request, { cache: 'no-store' });
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(canonicalUrl, response.clone());
    }
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(canonicalUrl);
    if (cached) return cached;
    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Nunca intercepta Apps Script, APIs externas ou outros domínios.
  const isAppDocument = request.mode === 'navigate' ||
    url.pathname === new URL(ROOT_KEY).pathname ||
    url.pathname === new URL(INDEX_URL).pathname;

  if (isAppDocument) {
    event.respondWith(networkFirstDocument(request));
    return;
  }

  if (url.pathname === new URL(VERSION_URL).pathname) {
    event.respondWith(networkFirstResource(request, VERSION_URL));
    return;
  }

  if (
    request.destination === 'image' ||
    request.destination === 'manifest' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    const canonicalUrl = url.origin + url.pathname;
    event.respondWith(networkFirstResource(request, canonicalUrl));
  }
});
