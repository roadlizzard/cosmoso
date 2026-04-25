export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/snapshot') {
      return json(await buildSnapshot(env), 200, corsHeaders());
    }

    if (path === '/api/admin/check') {
      return json({ authed: isAuthed(request, env) }, 200, corsHeaders());
    }

    if (path === '/api/admin/login' && request.method === 'POST') {
      const body = await safeJson(request);
      if (!env.ADMIN_PASSWORD) return text('ADMIN_PASSWORD secret missing', 500, corsHeaders());
      if (body.password !== env.ADMIN_PASSWORD) return text('Invalid password', 401, corsHeaders());
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          ...corsHeaders(),
          'content-type': 'application/json; charset=utf-8',
          'set-cookie': buildSessionCookie(env)
        }
      });
    }

    if (path === '/api/admin/logout' && request.method === 'POST') {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          ...corsHeaders(),
          'content-type': 'application/json; charset=utf-8',
          'set-cookie': 'kosmoso_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure'
        }
      });
    }

    if (path === '/api/admin/intro' && request.method === 'POST') {
      if (!isAuthed(request, env)) return text('Unauthorized', 401, corsHeaders());
      const body = await safeJson(request);
      await firebasePut(env, 'siteData/intro.json', body.intro || '');
      return json({ ok: true }, 200, corsHeaders());
    }

    if (path === '/api/admin/letter' && request.method === 'POST') {
      if (!isAuthed(request, env)) return text('Unauthorized', 401, corsHeaders());
      const body = await safeJson(request);
      if (!body.title || !body.content) return text('Missing title/content', 400, corsHeaders());
      const key = `l_${Date.now()}`;
      const payload = {
        title: body.title,
        content: body.content,
        date: new Date().toISOString().slice(0, 10)
      };
      await firebasePatch(env, `siteData/letters.json`, { [key]: payload });
      return json({ ok: true, key }, 200, corsHeaders());
    }

    if (path === '/api/admin/refresh' && request.method === 'POST') {
      if (!isAuthed(request, env)) return text('Unauthorized', 401, corsHeaders());
      const snapshot = await refreshAndPersist(env);
      return json({ ok: true, snapshot }, 200, corsHeaders());
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    return text('Not found', 404, corsHeaders());
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(refreshAndPersist(env));
  }
};

async function buildSnapshot(env) {
  const [bellissimaArchive, nasaArchive] = await Promise.all([
    firebaseGet(env, 'archives/bellissima.json'),
    firebaseGet(env, 'archives/nasa.json')
  ]);

  const latestBellissima = latestObjectValue(bellissimaArchive);
  const nasaItems = nasaArchive ? Object.values(nasaArchive) : [];
  const latestApod = latestByType(nasaItems, 'image', item => isLikelyApod(item));
  const latestDiscovery = latestByType(nasaItems, null, item => !isLikelyApod(item));

  return {
    bellissima: latestBellissima || { error: 'No bellissima data' },
    discovery: latestDiscovery || { error: 'No discovery data' },
    apod: latestApod || { error: 'No apod data' }
  };
}

async function refreshAndPersist(env) {
  const bellissima = await fetchBellissima(env);
  const discovery = await fetchDiscovery(env);
  const apod = await fetchApod(env);
  const today = new Date().toISOString().slice(0, 10);

  if (bellissima && !bellissima.error) {
    bellissima.date = today;
    await firebasePatch(env, 'archives/bellissima.json', { [`b_${Date.now()}`]: bellissima });
  }

  const nasaEntries = {};
  if (discovery && !discovery.error) {
    discovery.date = today;
    nasaEntries[`n_${Date.now()}`] = discovery;
  }
  if (apod && !apod.error) {
    apod.date = today;
    nasaEntries[`n_${Date.now() + 1}`] = apod;
  }
  if (Object.keys(nasaEntries).length) {
    await firebasePatch(env, 'archives/nasa.json', nasaEntries);
  }

  return { bellissima, discovery, apod };
}

async function fetchBellissima(env) {
  try {
    const res = await fetch('https://www.bellissimafacts.com/');
    const html = await res.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const textMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)/i);
    return {
      title: clean(titleMatch?.[1]) || 'Bellissima fact',
      text: clean(textMatch?.[1]) || 'Visit the source article for today\'s fact.',
      link: 'https://www.bellissimafacts.com/'
    };
  } catch (e) {
    return { error: 'Bellissima fetch failed' };
  }
}

async function fetchDiscovery(env) {
  try {
    const r = await fetch('https://images-api.nasa.gov/search?q=space&media_type=video');
    const j = await r.json();
    const items = j?.collection?.items || [];
    const first = items.find(item => item?.links?.[0]?.href || item?.href);
    if (!first) return { error: 'No NASA discovery item found' };
    const data = first.data?.[0] || {};
    const mediaUrl = first.links?.[0]?.href || '';
    return {
      title: data.title || 'NASA Discovery',
      type: mediaUrl.match(/\.(mp4|mov|webm)$/i) ? 'video' : 'image',
      url: mediaUrl,
      link: data.nasa_id ? `https://images.nasa.gov/details-${data.nasa_id}` : 'https://images.nasa.gov/',
      description: data.description || ''
    };
  } catch (e) {
    return { error: 'NASA discovery fetch failed' };
  }
}

async function fetchApod(env) {
  try {
    const key = env.NASA_API_KEY || 'DEMO_KEY';
    const r = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(key)}`);
    const j = await r.json();
    return {
      title: j.title || 'NASA APOD',
      type: j.media_type || 'image',
      url: j.url || j.hdurl || '',
      link: j.hdurl || j.url || 'https://apod.nasa.gov/apod/astropix.html',
      explanation: j.explanation || ''
    };
  } catch (e) {
    return { error: 'APOD fetch failed' };
  }
}

function latestObjectValue(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const entries = Object.values(obj);
  return entries.length ? entries[entries.length - 1] : null;
}

function latestByType(items, type, predicate) {
  const filtered = [...items].filter(item => (!type || item.type === type) && (!predicate || predicate(item)));
  return filtered.length ? filtered[filtered.length - 1] : null;
}

function isLikelyApod(item) {
  return /apod/i.test(item.title || '') || /astronomy picture/i.test(item.title || '');
}

function clean(s) {
  return (s || '').replace(/\s+/g, ' ').trim();
}

function isAuthed(request, env) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)kosmoso_admin=([^;]+)/);
  return !!env.SESSION_SECRET && !!match && match[1] === env.SESSION_SECRET;
}

function buildSessionCookie(env) {
  if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET missing');
  return `kosmoso_admin=${env.SESSION_SECRET}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`;
}

async function safeJson(request) {
  try { return await request.json(); } catch { return {}; }
}

async function firebaseGet(env, path) {
  const url = firebaseUrl(env, path);
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}

async function firebasePut(env, path, value) {
  const res = await fetch(firebaseUrl(env, path), {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value)
  });
  if (!res.ok) throw new Error(`Firebase PUT failed: ${res.status}`);
}

async function firebasePatch(env, path, value) {
  const res = await fetch(firebaseUrl(env, path), {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(value)
  });
  if (!res.ok) throw new Error(`Firebase PATCH failed: ${res.status}`);
}

function firebaseUrl(env, path) {
  const base = (env.FIREBASE_DB_URL || '').replace(/\/$/, '');
  const secret = env.FIREBASE_DB_SECRET ? `?auth=${encodeURIComponent(env.FIREBASE_DB_SECRET)}` : '';
  return `${base}/${path.replace(/^\//, '')}${secret}`;
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...extraHeaders, 'content-type': 'application/json; charset=utf-8' }
  });
}

function text(data, status = 200, extraHeaders = {}) {
  return new Response(data, {
    status,
    headers: { ...extraHeaders, 'content-type': 'text/plain; charset=utf-8' }
  });
}

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type'
  };
}
