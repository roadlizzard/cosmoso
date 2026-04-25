const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>kosmoso</title>
<style>
  body { background: #ffffff; color: #000000; font-family: "Times New Roman", Times, serif; font-size: 16px; margin: 0; padding: 0; overflow-x: hidden; }
  #topbar { background: #000080; color: #ffffff; text-align: center; padding: 8px 0; font-family: Arial, sans-serif; font-size: 12px; letter-spacing: 1px; position: sticky; top:0; z-index:100; }
  #outer { width: 760px; max-width: 96vw; margin: 0 auto; padding: 25px 0; }
  #sitetitle { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
  #nav { text-align: center; border-bottom: 1px solid #000; padding: 8px 0; margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 1px; }
  #nav a { margin: 0 10px; font-weight: bold; color: #000080; text-decoration: none; text-transform: uppercase; cursor: pointer; }
  .page { display: none; }
  .page.active { display: block; }
  #home-layout { display: flex; gap: 20px; }
  #home-main { flex: 2; border-right: 1px solid #ccc; padding-right: 20px; }
  #home-sidebar { flex: 1; }
  .section-head { font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; margin-bottom: 12px; }
  #intro-box { border: 1px solid #000080; padding: 15px; background: #f0f0ff; margin-bottom: 20px; line-height: 1.6; }
  #bellissima-box { border: 2px solid #000; background: #fffff0; margin-bottom: 20px; padding: 15px; }
  .archive-container { display: grid; grid-template-columns: 1fr; gap: 10px; }
  .archive-card { border: 1px solid #ddd; padding: 10px; background: #fafafa; font-size: 14px; }
  .archive-card b { color: #000080; }
  .blog-post { margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
  .post-date { font-family: Arial; font-size: 11px; color: #888; text-transform: uppercase; }
  .admin-panel { border: 1px solid #ccc; padding: 20px; background: #f9f9f9; margin-bottom: 20px; }
  textarea { width: 100%; font-family: "Times New Roman", serif; font-size: 15px; padding: 10px; box-sizing: border-box; margin-bottom: 10px; }
  input[type="text"], input[type="password"] { width: 100%; padding: 8px; margin-bottom: 10px; box-sizing: border-box; }
  .retro-btn { background: #000080; color: #fff; border: 2px outset #88c; padding: 6px 15px; cursor: pointer; font-size: 12px; font-weight: bold; }
  .retro-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  #login-msg { color: #c00; font-size: 13px; margin-top: 5px; }
  #admin-status { font-family: Arial; font-size: 11px; color: #444; margin-bottom: 10px; }
</style>
</head>
<body>
<div id="topbar">kosmoso &nbsp;·&nbsp; A PERSONAL RECORD OF THE UNIVERSE</div>
<div id="outer">
  <div id="sitetitle">
    <h1 style="font-size: 42px; margin: 10px 0 0; letter-spacing: 5px;">kosmoso</h1>
    <div style="font-style: italic; color: #555;"></div>
  </div>
  <div id="nav">
    <a onclick="showPage('home')">HOME</a>
    <a onclick="showPage('blog')">THE LETTERS</a>
    <a onclick="showPage('archive-bella')">BELLA ARCHIVE</a>
    <a onclick="showPage('archive-nasa')">VIDEO ARCHIVE</a>
    <a onclick="showPage('admin')">DEVELOPER</a>
  </div>
  <div id="page-home" class="page active">
    <div id="home-layout">
      <div id="home-main">
        <div id="intro-box">
          <div class="section-head">INTRODUCTION</div>
          <div id="intro-text">Accessing kosmoso cloud snapshot...</div>
        </div>
        <div id="bellissima-box">
          <div class="section-head" style="border:none;">BELLISSIMA! &mdash; Item of the day</div>
          <div id="bellissima-body">Loading today's system data...</div>
        </div>
        <div class="section-head">NASA DISCOVERY RANDOMIZER</div>
        <div id="nasa-main-display" style="border:1px solid #ddd; padding:10px; background:#fff;">
          <div id="nasa-media-wrap"></div>
          <div id="nasa-media-title" style="font-weight:bold; margin-top:8px;"></div>
        </div>
      </div>
      <div id="home-sidebar">
        <div class="section-head">NASA APOD</div>
        <a id="side-apod-link" href="#" target="_blank" rel="noopener noreferrer">
          <img id="side-apod" alt="" style="width:100%; border:1px solid #ccc;"><!-- FIX 2: Added missing alt attribute — accessibility violation + console warning -->
        </a>
        <div id="side-apod-caption" style="font-family:Arial; font-size:11px; color:#333; margin-top:4px; font-style:italic;"></div>
        <div id="side-apod-source" style="font-family:Arial; font-size:10px; color:#666; margin-top:4px;"></div>
      </div>
    </div>
  </div>
  <div id="page-blog" class="page">
    <div class="section-head">THE LETTERS</div>
    <div id="blog-list">Connecting to archives...</div>
  </div>
  <div id="page-archive-bella" class="page">
    <div class="section-head">BELLISSIMA ARCHIVE</div>
    <div id="bella-archive-list" class="archive-container">Loading discovery history...</div>
  </div>
  <div id="page-archive-nasa" class="page">
    <div class="section-head">NASA DISCOVERY ARCHIVE</div>
    <div id="nasa-archive-list" class="archive-container">Loading media history...</div>
  </div>
  <div id="page-admin" class="page">
    <div class="section-head">DEVELOPER INTERFACE</div>
    <div id="admin-login-panel" class="admin-panel">
      <h3>Authenticate</h3>
      <input type="password" id="admin-password" placeholder="Password" autocomplete="current-password">
      <button class="retro-btn" onclick="adminLogin()">SIGN IN</button>
      <div id="login-msg"></div>
    </div>
    <div id="admin-tools" style="display:none;">
      <div id="admin-status">Authenticated. <a onclick="adminLogout()" style="color:#000080;cursor:pointer">Sign out</a></div>
      <div class="admin-panel">
        <h3>Update Site Introduction</h3>
        <textarea id="edit-intro" rows="4"></textarea>
        <button class="retro-btn" onclick="saveIntro()">UPDATE INTRO</button>
      </div>
      <div class="admin-panel">
        <h3>Publish New Letter</h3>
        <input type="text" id="blog-title" placeholder="Letter Title">
        <textarea id="blog-content" rows="6" placeholder="Contents..."></textarea>
        <button class="retro-btn" onclick="publishLetter()">PUBLISH TO kosmoso</button>
      </div>
      <div class="admin-panel">
        <h3>Force Daily Snapshot Refresh</h3>
        <p style="font-size:13px;color:#555">Re-fetches Bellissima, NASA Discovery, APOD, EPIC and writes today's archive entries. Normally runs automatically at 00:00 JST.</p>
        <button class="retro-btn" onclick="forceRefresh()">REFRESH NOW</button>
      </div>
    </div>
  </div>
</div>
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
  import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAxFfLgoXqHh6vkS788YCK0HmV5JuDlrEo",
    authDomain: "kosmoso.firebaseapp.com",
    // FIX 1: Typo corrected — "kosmosoo" had an extra o, broke all Worker Firebase reads
    databaseURL: "https://kosmoso-default-rtdb.firebaseio.com",
    projectId: "kosmoso",
    storageBucket: "kosmoso.firebasestorage.app",
    messagingSenderId: "907090872412",
    appId: "1:907090872412:web:e8f4d4044c3a2726cafe99",
    measurementId: "G-FW10P68MLT"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  function escapeHtml(str) {
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function escapeAttr(str) {
    return String(str).replace(/&/g,"&amp;").replace(/"/g,"&quot;");
  }

  window.showPage = function(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + id);
    if (target) target.classList.add('active');
  };

  onValue(ref(db, 'siteData/intro'), (s) => {
    const d = s.val() || '';
    document.getElementById('intro-text').innerText = d;
    const ei = document.getElementById('edit-intro');
    if (ei) ei.value = d;
  });

  onValue(ref(db, 'siteData/letters'), (s) => {
    const d = s.val();
    const list = document.getElementById('blog-list');
    list.innerHTML = '';
    if (!d) { list.innerHTML = '<i>No letters yet.</i>'; return; }
    Object.keys(d).reverse().forEach(key => {
      const p = d[key];
      const div = document.createElement('div');
      div.className = 'blog-post';
      div.innerHTML = \`<div class="post-date">\${escapeHtml(p.date||'')}</div><h2>\${escapeHtml(p.title||'')}</h2><p></p>\`;
      div.querySelector('p').innerText = p.content || '';
      list.appendChild(div);
    });
  });

  onValue(ref(db, 'archives/bellissima'), (s) => {
    const d = s.val();
    const list = document.getElementById('bella-archive-list');
    if (!d) { list.innerHTML = '<i>Archive empty.</i>'; return; }
    list.innerHTML = Object.values(d).reverse().map(f =>
      \`<div class="archive-card"><b>\${escapeHtml(f.date||'')}</b> &mdash; <a href="\${escapeAttr(f.link||'#')}" target="_blank" style="color:#000080;">\${escapeHtml(f.title||'')}</a><br><small>\${escapeHtml((f.text||'').substring(0,180))}...</small></div>\`
    ).join('');
  });

  onValue(ref(db, 'archives/nasa'), (s) => {
    const d = s.val();
    const list = document.getElementById('nasa-archive-list');
    if (!d) { list.innerHTML = '<i>Archive empty.</i>'; return; }
    list.innerHTML = Object.values(d).reverse().map(f => \`
      <div class="archive-card">
        <b>\${escapeHtml(f.date||'')}</b>: <a href="\${escapeAttr(f.link||f.url||'#')}" target="_blank" style="color:#000080;">\${escapeHtml(f.title||'')}</a> (\${escapeHtml((f.source_type||f.type||'').toUpperCase())})<br>
        \${f.description ? \`<small>\${escapeHtml(f.description)}</small><br>\` : ''}
        <a href="\${escapeAttr(f.link||f.url||'#')}" target="_blank" style="color:#0000cc; font-size:12px;">Open source page &rarr;</a>
      </div>\`).join('');
  });

  async function loadDailySnapshot() {
    try {
      const res = await fetch('/snapshot');
      const snap = await res.json();
      if (snap.bellissima && !snap.bellissima.error) {
        const f = snap.bellissima;
        const sourceLink = f.link || '';
        const source = sourceLink
          ? \`<p style="margin-top:8px;"><a href="\${escapeAttr(sourceLink)}" target="_blank" rel="noopener noreferrer">Read source article →</a></p>\`
          : '';
        document.getElementById('bellissima-body').innerHTML =
          \`<b>\${escapeHtml(f.title || '')}</b><p>\${escapeHtml(f.text || '')}</p>\${source}\`;
      }
      if (snap.discovery && !snap.discovery.error) {
        const e = snap.discovery;
        const sourceLink = e.link || '';
        const caption = e.caption || e.title || '';
        const desc = e.description ? \`<p style="font-size:13px;color:#555;margin-top:6px;">\${escapeHtml(e.description)}</p>\` : '';
        document.getElementById('nasa-media-title').innerHTML =
          \`\${escapeHtml(caption)}\${sourceLink ? \`<div style="margin-top:8px;font-weight:normal;"><a href="\${escapeAttr(sourceLink)}" target="_blank" rel="noopener noreferrer">Open source page →</a></div>\` : ''}\${desc}\`;
        const box = document.getElementById('nasa-media-wrap');
        box.innerHTML = e.type === 'video'
          ? \`<video controls src="\${escapeAttr(e.url)}" style="width:100%"></video>\`
          : \`<img src="\${escapeAttr(e.url)}" style="width:100%" alt="\${escapeAttr(caption)}">\`;
      }
      if (snap.apod && snap.apod.url) {
        document.getElementById('side-apod').src = snap.apod.url;
        document.getElementById('side-apod').alt = snap.apod.caption || snap.apod.title || 'NASA APOD';
        const caption = snap.apod.caption || snap.apod.title || '';
        if (caption) document.getElementById('side-apod-caption').innerText = caption;
        const sourceLink = snap.apod.link || '';
        if (sourceLink) {
          document.getElementById('side-apod-link').href = sourceLink;
          document.getElementById('side-apod-source').innerHTML =
            \`<a href="\${escapeAttr(sourceLink)}" target="_blank" rel="noopener noreferrer">Open source page →</a>\`;
        }
      }
    } catch (e) {
      console.error("Worker fetch failed.", e);
    }
  }

  async function checkAdmin() {
    const res = await fetch('/api/admin/check');
    const j = await res.json();
    document.getElementById('admin-login-panel').style.display = j.authed ? 'none' : 'block';
    document.getElementById('admin-tools').style.display = j.authed ? 'block' : 'none';
  }

  window.adminLogin = async () => {
    const password = document.getElementById('admin-password').value;
    const msg = document.getElementById('login-msg');
    msg.innerText = '';
    const res = await fetch('/api/admin/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { document.getElementById('admin-password').value = ''; checkAdmin(); }
    else { msg.innerText = 'Invalid password.'; }
  };
  window.adminLogout = async () => { await fetch('/api/admin/logout', { method: 'POST' }); checkAdmin(); };

  window.saveIntro = async () => {
    const intro = document.getElementById('edit-intro').value;
    const res = await fetch('/api/admin/intro', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ intro }),
    });
    alert(res.ok ? 'Intro updated.' : 'Failed: ' + (await res.text()));
  };

  window.publishLetter = async () => {
    const title = document.getElementById('blog-title').value;
    const content = document.getElementById('blog-content').value;
    if (!title || !content) return;
    const res = await fetch('/api/admin/letter', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });
    if (res.ok) {
      document.getElementById('blog-title').value = '';
      document.getElementById('blog-content').value = '';
      alert('Signal Synced.');
    } else alert('Failed: ' + (await res.text()));
  };

  window.forceRefresh = async () => {
    const res = await fetch('/api/admin/refresh', { method: 'POST' });
    if (res.ok) { alert('Snapshot refreshed.'); loadDailySnapshot(); }
    else alert('Failed: ' + (await res.text()));
  };

  loadDailySnapshot();
  checkAdmin();
</script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/' || path === '/index.html') {
      return new Response(HTML, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' }
      });
    }

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
          'set-cookie': 'kosmoso_admin=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure' // FIX 3: Cookie name was "kosmosoo_admin" — synced with isAuthed() and buildSessionCookie()
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
  const latestApod = latestByType(nasaItems, null, item => item.source_type === 'apod');
  const latestDiscovery = latestByType(nasaItems, null, item => item.source_type === 'discovery');

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
  // FIX 4: Was Date.now() and Date.now()+1 — both calls could land in the same millisecond, silently overwriting one entry
  if (discovery && !discovery.error) {
    discovery.date = today;
    discovery.source_type = 'discovery';
    nasaEntries[`n_${Date.now()}_discovery`] = discovery;
  }
  if (apod && !apod.error) {
    apod.date = today;
    apod.source_type = 'apod';
    nasaEntries[`n_${Date.now()}_apod`] = apod;
  }
  if (Object.keys(nasaEntries).length) {
    await firebasePatch(env, 'archives/nasa.json', nasaEntries);
  }

  return { bellissima, discovery, apod };
}

async function fetchBellissima(env) {
  try {
    const res = await fetch('https://www.bellissimafacts.com/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; kosmoso-bot/1.0)' }
    });
    const html = await res.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = clean(titleMatch?.[1]?.replace(/\s*[|\-–]\s*.*$/, '')) || 'Bellissima';

    let factText = '';
    const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']{30,})/i)
      || html.match(/<meta[^>]*content=["']([^"']{30,})["'][^>]*property=["']og:description["']/i);
    if (ogDesc) factText = clean(ogDesc[1]);

    if (!factText) {
      const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']{30,})/i);
      if (metaDesc) factText = clean(metaDesc[1]);
    }

    if (!factText) {
      const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]{60,400}?)<\/p>/gi)];
      for (const m of pMatches) {
        const stripped = clean(m[1].replace(/<[^>]+>/g, ''));
        if (stripped.length > 60) { factText = stripped; break; }
      }
    }

    return {
      title,
      text: factText || 'Visit the source article for today\'s fact.',
      link: 'https://www.bellissimafacts.com/',
      caption: title
    };
  } catch (e) {
    return { error: 'Bellissima fetch failed' };
  }
}

async function fetchDiscovery(env) {
  try {
    // FIX 5: Was always fetching page 1 — UI labels this a "Randomizer" so now picks a random page
    const page = Math.ceil(Math.random() * 10);
    const r = await fetch(`https://images-api.nasa.gov/search?q=space&media_type=video&page=${page}`);
    const j = await r.json();
    const items = j?.collection?.items || [];
    const first = items.find(item => item?.links?.[0]?.href || item?.href);
    if (!first) return { error: 'No NASA discovery item found' };
    const data = first.data?.[0] || {};
    const mediaUrl = first.links?.[0]?.href || '';
    const nasaId = data.nasa_id || '';
    const link = nasaId ? `https://images.nasa.gov/details/${nasaId}` : 'https://images.nasa.gov/';
    return {
      title: data.title || 'NASA Discovery',
      type: mediaUrl.match(/\.(mp4|mov|webm)$/i) ? 'video' : 'image',
      url: mediaUrl,
      link,
      caption: data.title || 'NASA Discovery',
      description: (data.description || '').slice(0, 200),
      source_type: 'discovery'
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
    const isVideo = j.media_type === 'video';
    const imageUrl = isVideo ? (j.thumbnail_url || '') : (j.url || j.hdurl || '');
    return {
      title: j.title || 'NASA APOD',
      type: j.media_type || 'image',
      url: imageUrl,
      link: j.hdurl || j.url || 'https://apod.nasa.gov/apod/astropix.html',
      caption: j.title || 'NASA Astronomy Picture of the Day',
      explanation: (j.explanation || '').slice(0, 300),
      source_type: 'apod'
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

function clean(s) {
  return (s || '').replace(/\s+/g, ' ').trim();
}

function isAuthed(request, env) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)kosmoso_admin=([^;]+)/); // FIX 3: Was "kosmosoo_admin" — now consistent across all three cookie references
  return !!env.SESSION_SECRET && !!match && match[1] === env.SESSION_SECRET;
}

function buildSessionCookie(env) {
  if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET missing');
  return `kosmoso_admin=${env.SESSION_SECRET}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`; // FIX 3: Was "kosmosoo_admin"
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
