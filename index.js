// =============================================================
// kosmoso — Cloudflare Worker
// Single file. Serves all HTML, handles all API routes.
//
// Environment variables (set in Cloudflare dashboard → Settings → Variables):
//   FIREBASE_DB_URL      e.g. https://kosmoso-default-rtdb.firebaseio.com
//   FIREBASE_DB_SECRET   Firebase DB legacy secret
//   ADMIN_PASSWORD       Password for the developer panel
//   SESSION_SECRET       Any long random string for signing the session cookie
//   NASA_API_KEY         From api.nasa.gov (free)
// =============================================================

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>kosmoso</title>
<style>
*, *::before, *::after { box-sizing: border-box; }
body {
  background: #f5f5f0;
  color: #000;
  font-family: "Times New Roman", Times, serif;
  font-size: 16px;
  margin: 0; padding: 0;
  overflow-x: hidden;
}
#topbar {
  background: #000080;
  color: #fff;
  text-align: center;
  padding: 8px 0;
  font-family: Arial, sans-serif;
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  position: sticky;
  top: 0;
  z-index: 100;
}
#outer {
  width: 800px;
  max-width: 96vw;
  margin: 0 auto;
  padding: 30px 0 60px;
}
#sitetitle {
  text-align: center;
  border-bottom: 3px double #000;
  padding-bottom: 16px;
  margin-bottom: 12px;
}
#sitetitle h1 {
  font-size: 52px;
  margin: 12px 0 6px;
  letter-spacing: 10px;
  font-weight: normal;
}
.tagline { font-style: italic; color: #666; font-size: 13px; letter-spacing: 2px; }
#nav {
  text-align: center;
  border-bottom: 1px solid #000;
  padding: 10px 0;
  margin-bottom: 28px;
  font-family: Arial, sans-serif;
  font-size: 10px;
  letter-spacing: 2px;
}
#nav a {
  margin: 0 14px;
  font-weight: bold;
  color: #000080;
  text-decoration: none;
  text-transform: uppercase;
  cursor: pointer;
}
#nav a:hover { text-decoration: underline; }
.page { display: none; }
.page.active { display: block; }

/* HOME */
#home-layout { display: flex; gap: 28px; }
#home-main { flex: 2; border-right: 1px solid #ccc; padding-right: 28px; }
#home-sidebar { flex: 1; }
.section-head {
  font-family: Arial, sans-serif;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 3px;
  text-transform: uppercase;
  border-bottom: 1px solid #000;
  padding-bottom: 5px;
  margin-bottom: 16px;
}
#intro-box {
  border: 1px solid #000080;
  padding: 16px 18px;
  background: #f0f0ff;
  margin-bottom: 24px;
  line-height: 1.75;
  font-size: 15px;
}
#bellissima-box {
  border: 2px solid #000;
  background: #fffff0;
  margin-bottom: 24px;
  padding: 18px;
}
.bella-clearfix::after { content: ""; display: table; clear: both; }
.bella-thumb {
  float: right;
  max-width: 110px;
  margin: 0 0 10px 14px;
  border: 1px solid #ccc;
}
.bella-concept { font-size: 19px; font-weight: bold; color: #000080; margin-bottom: 10px; }
.bella-text { font-size: 15px; line-height: 1.85; margin-bottom: 12px; color: #111; }
.bella-link { font-family: Arial; font-size: 11px; }
.bella-link a { color: #000080; }
#nasa-main-display { border: 1px solid #ddd; padding: 12px; background: #fff; }
#nasa-media-wrap img, #nasa-media-wrap video { width: 100%; display: block; }
.nasa-title { font-weight: bold; font-size: 15px; margin-top: 10px; }
.nasa-caption { font-size: 13px; color: #444; margin-top: 6px; line-height: 1.65; font-style: italic; }
.nasa-link { font-family: Arial; font-size: 11px; margin-top: 8px; }
.nasa-link a { color: #000080; }
#side-apod-wrap img { width: 100%; border: 1px solid #ccc; display: block; }
.apod-title { font-size: 13px; font-weight: bold; margin-top: 8px; }
.apod-caption { font-size: 12px; color: #555; margin-top: 5px; font-style: italic; line-height: 1.55; }
.apod-link { font-family: Arial; font-size: 11px; margin-top: 6px; }
.apod-link a { color: #000080; }

/* ARCHIVES */
.archive-container { display: grid; grid-template-columns: 1fr; gap: 12px; }
.archive-card { border: 1px solid #ddd; padding: 12px 14px; background: #fafafa; font-size: 14px; line-height: 1.65; }
.arc-title { font-weight: bold; color: #000080; margin-bottom: 5px; }
.arc-text { color: #444; font-size: 13px; font-style: italic; }
.arc-link { font-family: Arial; font-size: 11px; margin-top: 7px; }
.arc-link a { color: #000080; }

/* THE LETTERS — Red Hand Files style */
#page-blog { max-width: 640px; margin: 0 auto; padding: 0 0 60px; }
.blog-masthead {
  text-align: center;
  margin-bottom: 50px;
  padding-bottom: 20px;
  border-bottom: 1px solid #bbb;
}
.blog-masthead h2 {
  font-family: Arial, sans-serif;
  font-size: 10px;
  letter-spacing: 5px;
  text-transform: uppercase;
  font-weight: normal;
  color: #888;
  margin: 0;
}
.blog-post { margin-bottom: 70px; padding-bottom: 60px; border-bottom: 1px solid #ddd; }
.post-date {
  font-family: Arial, sans-serif;
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #aaa;
  margin-bottom: 18px;
}
.post-title {
  font-size: 30px;
  font-weight: normal;
  line-height: 1.25;
  margin: 0 0 28px;
  letter-spacing: 0.5px;
}
.post-body { font-size: 17px; line-height: 2; color: #111; }
.post-body p { margin: 0 0 1.5em; }
.post-body p:first-of-type::first-letter {
  font-size: 3.4em;
  float: left;
  line-height: 0.72;
  margin: 0.06em 0.08em 0 0;
  color: #000080;
  font-family: "Times New Roman", serif;
}
.post-sign { margin-top: 36px; font-style: italic; font-size: 15px; color: #777; letter-spacing: 1px; }
.blog-empty { text-align: center; color: #aaa; font-style: italic; padding: 80px 0; font-size: 15px; }

/* ADMIN */
.admin-panel { border: 1px solid #ccc; padding: 20px; background: #f9f9f9; margin-bottom: 20px; }
.admin-panel h3 { margin: 0 0 14px; font-size: 14px; font-family: Arial, sans-serif; }
textarea {
  width: 100%; font-family: "Times New Roman", serif; font-size: 15px;
  padding: 10px; box-sizing: border-box; margin-bottom: 10px;
  border: 1px solid #ccc; line-height: 1.6;
}
input[type="text"], input[type="password"] {
  width: 100%; padding: 8px 10px; margin-bottom: 10px;
  box-sizing: border-box; border: 1px solid #ccc;
  font-size: 14px; font-family: Arial, sans-serif;
}
.retro-btn {
  background: #000080; color: #fff; border: 2px outset #8888cc;
  padding: 6px 18px; cursor: pointer; font-size: 11px; font-weight: bold;
  font-family: Arial, sans-serif; letter-spacing: 1px; text-transform: uppercase;
}
.retro-btn:hover { background: #0000a0; }
.retro-btn:disabled { opacity: 0.5; cursor: not-allowed; }
#login-msg { color: #c00; font-size: 13px; margin-top: 8px; }
#admin-status { font-family: Arial; font-size: 11px; color: #555; margin-bottom: 14px; }
.hint { color: #aaa; font-style: italic; font-size: 14px; }

@media (max-width: 620px) {
  #home-layout { flex-direction: column; }
  #home-main { border-right: none; padding-right: 0; border-bottom: 1px solid #ccc; padding-bottom: 24px; margin-bottom: 24px; }
  #sitetitle h1 { font-size: 36px; letter-spacing: 6px; }
  .post-title { font-size: 24px; }
}
</style>
</head>
<body>

<div id="topbar">kosmoso &nbsp;&middot;&nbsp; A Personal Record of the Universe</div>

<div id="outer">
  <div id="sitetitle">
    <h1>kosmoso</h1>
    <div class="tagline">a personal record of the universe</div>
  </div>

  <div id="nav">
    <a onclick="showPage('home')">Home</a>
    <a onclick="showPage('blog')">The Letters</a>
    <a onclick="showPage('archive-bella')">Bella Archive</a>
    <a onclick="showPage('archive-nasa')">NASA Archive</a>
    <a onclick="showPage('admin')">Developer</a>
  </div>

  <!-- HOME -->
  <div id="page-home" class="page active">
    <div id="home-layout">
      <div id="home-main">

        <div id="intro-box">
          <div class="section-head">Introduction</div>
          <div id="intro-text" class="hint">Accessing kosmoso cloud snapshot...</div>
        </div>

        <div id="bellissima-box">
          <div class="section-head">Bellissima &mdash; Concept of the Day</div>
          <div id="bellissima-body" class="hint">Loading today's concept from Wikipedia...</div>
        </div>

        <div class="section-head">NASA Discovery</div>
        <div id="nasa-main-display">
          <div id="nasa-media-wrap"><div class="hint" style="padding:20px 0;">Loading NASA media...</div></div>
          <div id="nasa-meta" style="display:none;">
            <div id="nasa-media-title" class="nasa-title"></div>
            <div id="nasa-media-caption" class="nasa-caption"></div>
            <div id="nasa-media-link" class="nasa-link"></div>
          </div>
        </div>

      </div>
      <div id="home-sidebar">
        <div class="section-head">NASA APOD</div>
        <div id="side-apod-wrap">
          <a id="side-apod-link" href="#" target="_blank" rel="noopener noreferrer">
            <img id="side-apod" alt="NASA Astronomy Picture of the Day" style="display:none;">
          </a>
          <div id="side-apod-title" class="apod-title"></div>
          <div id="side-apod-caption" class="apod-caption"></div>
          <div id="side-apod-link-wrap" class="apod-link"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- THE LETTERS -->
  <div id="page-blog" class="page">
    <div class="blog-masthead"><h2>The Letters</h2></div>
    <div id="blog-list"><div class="blog-empty">Connecting to archives...</div></div>
  </div>

  <!-- BELLA ARCHIVE -->
  <div id="page-archive-bella" class="page">
    <div class="section-head">Bellissima Archive</div>
    <div id="bella-archive-list" class="archive-container">
      <div class="hint">Loading discovery history...</div>
    </div>
  </div>

  <!-- NASA ARCHIVE -->
  <div id="page-archive-nasa" class="page">
    <div class="section-head">NASA Archive</div>
    <div id="nasa-archive-list" class="archive-container">
      <div class="hint">Loading media history...</div>
    </div>
  </div>

  <!-- DEVELOPER / ADMIN -->
  <div id="page-admin" class="page">
    <div class="section-head">Developer Interface</div>

    <div id="admin-login-panel" class="admin-panel">
      <h3>Authenticate</h3>
      <input type="password" id="admin-password" placeholder="Password" autocomplete="current-password">
      <button class="retro-btn" onclick="adminLogin()">Sign In</button>
      <div id="login-msg"></div>
    </div>

    <div id="admin-tools" style="display:none;">
      <div id="admin-status">
        Authenticated. <a onclick="adminLogout()" style="color:#000080;cursor:pointer;">Sign out</a>
      </div>
      <div class="admin-panel">
        <h3>Update Site Introduction</h3>
        <textarea id="edit-intro" rows="4" placeholder="Introduction text..."></textarea>
        <button class="retro-btn" onclick="saveIntro()">Update Intro</button>
      </div>
      <div class="admin-panel">
        <h3>Publish New Letter</h3>
        <input type="text" id="blog-title" placeholder="Letter title">
        <textarea id="blog-content" rows="10" placeholder="Dear reader...&#10;&#10;Separate paragraphs with a blank line."></textarea>
        <button class="retro-btn" onclick="publishLetter()">Publish to kosmoso</button>
      </div>
      <div class="admin-panel">
        <h3>Force Daily Snapshot Refresh</h3>
        <p style="font-size:13px;color:#666;margin:0 0 14px;line-height:1.6;">
          Re-fetches a random Wikipedia concept (Bellissima), NASA Discovery media,
          and the Astronomy Picture of the Day. Normally runs automatically at 00:00 JST.
        </p>
        <button class="retro-btn" id="refresh-btn" onclick="forceRefresh(this)">Refresh Now</button>
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
  databaseURL: "https://kosmoso-default-rtdb.firebaseio.com",
  projectId: "kosmoso",
  storageBucket: "kosmoso.firebasestorage.app",
  messagingSenderId: "907090872412",
  appId: "1:907090872412:web:e8f4d4044c3a2726cafe99"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function ea(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

window.showPage = function(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const t = document.getElementById('page-' + id);
  if (t) t.classList.add('active');
};

// ── Firebase real-time listeners ──

onValue(ref(db, 'siteData/intro'), s => {
  const d = s.val() || '';
  const el = document.getElementById('intro-text');
  el.textContent = d;
  el.classList.remove('hint');
  const ei = document.getElementById('edit-intro');
  if (ei) ei.value = d;
});

onValue(ref(db, 'siteData/letters'), s => {
  const d = s.val();
  const list = document.getElementById('blog-list');
  list.innerHTML = '';
  if (!d) { list.innerHTML = '<div class="blog-empty">No letters yet.</div>'; return; }
  Object.keys(d).reverse().forEach(key => {
    const p = d[key];
    const article = document.createElement('article');
    article.className = 'blog-post';

    const dateEl = document.createElement('div');
    dateEl.className = 'post-date';
    dateEl.textContent = p.date || '';

    const titleEl = document.createElement('h2');
    titleEl.className = 'post-title';
    titleEl.textContent = p.title || '';

    const bodyEl = document.createElement('div');
    bodyEl.className = 'post-body';
    (p.content || '').split(/\\n\\n+/).forEach(para => {
      if (!para.trim()) return;
      const pp = document.createElement('p');
      pp.textContent = para.trim();
      bodyEl.appendChild(pp);
    });

    const signEl = document.createElement('div');
    signEl.className = 'post-sign';
    signEl.textContent = '— kosmoso';

    article.append(dateEl, titleEl, bodyEl, signEl);
    list.appendChild(article);
  });
});

onValue(ref(db, 'archives/bellissima'), s => {
  const d = s.val();
  const list = document.getElementById('bella-archive-list');
  if (!d) { list.innerHTML = '<span class="hint">Archive empty.</span>'; return; }
  list.innerHTML = Object.values(d).reverse().map(f => \`
    <div class="archive-card">
      <div class="arc-title">\${esc(f.date || '')} &mdash; \${esc(f.title || '')}</div>
      <div class="arc-text">\${esc((f.text || '').substring(0, 240))}\${(f.text || '').length > 240 ? '&hellip;' : ''}</div>
      \${f.link ? \`<div class="arc-link"><a href="\${ea(f.link)}" target="_blank" rel="noopener noreferrer">Read on Wikipedia &rarr;</a></div>\` : ''}
    </div>
  \`).join('');
});

onValue(ref(db, 'archives/nasa'), s => {
  const d = s.val();
  const list = document.getElementById('nasa-archive-list');
  if (!d) { list.innerHTML = '<span class="hint">Archive empty.</span>'; return; }
  list.innerHTML = Object.values(d).reverse().map(f => \`
    <div class="archive-card">
      <div class="arc-title">
        \${esc(f.date || '')} &mdash; \${esc(f.title || '')}
        <span style="font-family:Arial;font-size:10px;color:#999;margin-left:6px;">\${esc((f.source_type || '').toUpperCase())}</span>
      </div>
      \${f.caption ? \`<div class="arc-text">\${esc(f.caption)}</div>\` : ''}
      \${f.link ? \`<div class="arc-link"><a href="\${ea(f.link)}" target="_blank" rel="noopener noreferrer">View full article &rarr;</a></div>\` : ''}
    </div>
  \`).join('');
});

// ── Snapshot (served by Worker from cached Firebase data) ──

async function loadDailySnapshot() {
  try {
    const res = await fetch('/snapshot');
    if (!res.ok) throw new Error('Snapshot returned ' + res.status);
    const snap = await res.json();

    if (snap.bellissima && !snap.bellissima.error) {
      const f = snap.bellissima;
      const thumb = f.thumbnail
        ? \`<img class="bella-thumb" src="\${ea(f.thumbnail)}" alt="\${ea(f.title)}">\`
        : '';
      document.getElementById('bellissima-body').innerHTML = \`
        <div class="bella-clearfix">
          \${thumb}
          <div class="bella-concept">\${esc(f.title || '')}</div>
          <div class="bella-text">\${esc(f.text || '')}</div>
          \${f.link ? \`<div class="bella-link"><a href="\${ea(f.link)}" target="_blank" rel="noopener noreferrer">Read full article on Wikipedia &rarr;</a></div>\` : ''}
        </div>
      \`;
    }

    if (snap.discovery && !snap.discovery.error) {
      const e = snap.discovery;
      const wrap = document.getElementById('nasa-media-wrap');
      wrap.innerHTML = e.url
        ? (e.type === 'video'
            ? \`<video controls src="\${ea(e.url)}" style="width:100%;"></video>\`
            : \`<img src="\${ea(e.url)}" alt="\${ea(e.title)}" style="width:100%;">\`)
        : '';
      document.getElementById('nasa-media-title').textContent = e.title || '';
      document.getElementById('nasa-media-caption').textContent = e.description || '';
      document.getElementById('nasa-media-link').innerHTML = e.link
        ? \`<a href="\${ea(e.link)}" target="_blank" rel="noopener noreferrer">View full NASA article &rarr;</a>\`
        : '';
      document.getElementById('nasa-meta').style.display = 'block';
    }

    if (snap.apod && snap.apod.url && !snap.apod.error) {
      const a = snap.apod;
      const img = document.getElementById('side-apod');
      img.src = a.url;
      img.alt = a.title || 'NASA APOD';
      img.style.display = 'block';
      document.getElementById('side-apod-title').textContent = a.title || '';
      document.getElementById('side-apod-caption').textContent =
        a.explanation ? a.explanation.substring(0, 180) + (a.explanation.length > 180 ? '...' : '') : '';
      if (a.link) {
        document.getElementById('side-apod-link').href = a.link;
        document.getElementById('side-apod-link-wrap').innerHTML =
          \`<a href="\${ea(a.link)}" target="_blank" rel="noopener noreferrer">View full APOD article &rarr;</a>\`;
      }
    }
  } catch(e) {
    console.error('Snapshot fetch failed:', e);
  }
}

// ── Admin ──

async function checkAdmin() {
  try {
    const res = await fetch('/api/admin/check');
    if (!res.ok) throw new Error('check failed');
    const j = await res.json();
    document.getElementById('admin-login-panel').style.display = j.authed ? 'none' : 'block';
    document.getElementById('admin-tools').style.display = j.authed ? 'block' : 'none';
  } catch(e) { console.error('Admin check failed:', e); }
}

window.adminLogin = async () => {
  const pw = document.getElementById('admin-password').value;
  const msg = document.getElementById('login-msg');
  msg.textContent = '';
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: pw })
    });
    if (res.ok) { document.getElementById('admin-password').value = ''; checkAdmin(); }
    else msg.textContent = 'Invalid password.';
  } catch { msg.textContent = 'Login request failed.'; }
};

window.adminLogout = async () => {
  await fetch('/api/admin/logout', { method: 'POST' });
  checkAdmin();
};

window.saveIntro = async () => {
  const intro = document.getElementById('edit-intro').value;
  const res = await fetch('/api/admin/intro', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ intro })
  });
  alert(res.ok ? 'Introduction updated.' : 'Failed: ' + await res.text());
};

window.publishLetter = async () => {
  const title = document.getElementById('blog-title').value.trim();
  const content = document.getElementById('blog-content').value.trim();
  if (!title || !content) { alert('Both a title and content are required.'); return; }
  const res = await fetch('/api/admin/letter', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title, content })
  });
  if (res.ok) {
    document.getElementById('blog-title').value = '';
    document.getElementById('blog-content').value = '';
    alert('Letter published.');
  } else alert('Failed: ' + await res.text());
};

window.forceRefresh = async (btn) => {
  btn.disabled = true;
  btn.textContent = 'Refreshing...';
  try {
    const res = await fetch('/api/admin/refresh', { method: 'POST' });
    if (res.ok) { alert('Snapshot refreshed.'); loadDailySnapshot(); }
    else alert('Refresh failed: ' + await res.text());
  } catch { alert('Request failed.'); }
  btn.disabled = false;
  btn.textContent = 'Refresh Now';
};

loadDailySnapshot();
checkAdmin();
</script>
</body>
</html>`;

// =============================================================
// WORKER ENTRY POINT
// =============================================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight — must be first
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Serve the site
    if (path === '/' || path === '/index.html') {
      return new Response(HTML, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }
      });
    }

    // Today's snapshot — reads latest cached data from Firebase
    if (path === '/snapshot') {
      try {
        return json(await buildSnapshot(env), 200, corsHeaders());
      } catch(e) {
        return json({ error: e.message }, 500, corsHeaders());
      }
    }

    if (path === '/api/admin/check') {
      return json({ authed: isAuthed(request, env) }, 200, corsHeaders());
    }

    if (path === '/api/admin/login' && request.method === 'POST') {
      const body = await safeJson(request);
      if (!env.ADMIN_PASSWORD) return text('ADMIN_PASSWORD secret not configured', 500, corsHeaders());
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
      if (!body.title || !body.content) return text('Missing title or content', 400, corsHeaders());
      const key = `l_${Date.now()}`;
      await firebasePatch(env, 'siteData/letters.json', {
        [key]: { title: body.title, content: body.content, date: today() }
      });
      return json({ ok: true, key }, 200, corsHeaders());
    }

    if (path === '/api/admin/refresh' && request.method === 'POST') {
      if (!isAuthed(request, env)) return text('Unauthorized', 401, corsHeaders());
      try {
        const snapshot = await refreshAndPersist(env);
        return json({ ok: true, snapshot }, 200, corsHeaders());
      } catch(e) {
        return text('Refresh failed: ' + e.message, 500, corsHeaders());
      }
    }

    return text('Not found', 404, corsHeaders());
  },

  // Runs on the cron schedule set in Cloudflare dashboard
  // Recommended: "0 15 * * *" which is 00:00 JST (UTC+9)
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(refreshAndPersist(env));
  }
};

// =============================================================
// SNAPSHOT — reads latest cached entries from Firebase
// =============================================================

async function buildSnapshot(env) {
  const [bellissimaArchive, nasaArchive] = await Promise.all([
    firebaseGet(env, 'archives/bellissima.json'),
    firebaseGet(env, 'archives/nasa.json')
  ]);

  const latestBellissima = latestValue(bellissimaArchive);
  const nasaItems = nasaArchive ? Object.values(nasaArchive) : [];
  const latestApod = [...nasaItems].filter(i => i.source_type === 'apod').pop() || null;
  const latestDiscovery = [...nasaItems].filter(i => i.source_type === 'discovery').pop() || null;

  return {
    bellissima: latestBellissima || { error: 'No bellissima data yet — run a refresh.' },
    discovery:  latestDiscovery  || { error: 'No discovery data yet — run a refresh.' },
    apod:       latestApod       || { error: 'No APOD data yet — run a refresh.' }
  };
}

// =============================================================
// REFRESH — fetches fresh data and writes to Firebase
// =============================================================

async function refreshAndPersist(env) {
  const [bellissima, discovery, apod] = await Promise.all([
    fetchWikipediaConcept(),
    fetchNasaDiscovery(),
    fetchApod(env)
  ]);
  const date = today();

  if (bellissima && !bellissima.error) {
    bellissima.date = date;
    await firebasePatch(env, 'archives/bellissima.json', {
      [`b_${Date.now()}`]: bellissima
    });
  }

  const nasaEntries = {};
  if (discovery && !discovery.error) {
    discovery.date = date;
    nasaEntries[`n_${Date.now()}_discovery`] = discovery;
  }
  if (apod && !apod.error) {
    apod.date = date;
    nasaEntries[`n_${Date.now()}_apod`] = apod;
  }
  if (Object.keys(nasaEntries).length) {
    await firebasePatch(env, 'archives/nasa.json', nasaEntries);
  }

  return { bellissima, discovery, apod };
}

// =============================================================
// DATA FETCHERS
// =============================================================

// Wikipedia random concept — proper full summary with thumbnail and link
async function fetchWikipediaConcept() {
  try {
    const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary', {
      headers: { 'accept': 'application/json' }
    });
    if (!res.ok) throw new Error('Wikipedia API ' + res.status);
    const j = await res.json();

    // Skip disambiguation pages or stubs — retry once if too short
    if (j.type === 'disambiguation' || (j.extract || '').length < 80) {
      const res2 = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary', {
        headers: { 'accept': 'application/json' }
      });
      const j2 = await res2.json();
      return buildWikiEntry(j2);
    }

    return buildWikiEntry(j);
  } catch(e) {
    return { error: 'Wikipedia fetch failed: ' + e.message };
  }
}

function buildWikiEntry(j) {
  return {
    title:       j.title || '',
    text:        j.extract || '',
    thumbnail:   j.thumbnail ? j.thumbnail.source : null,
    link:        j.content_urls?.desktop?.page || null,
    source_type: 'bellissima'
  };
}

// NASA Images — random item from random page, image or video, with article link
async function fetchNasaDiscovery() {
  try {
    const page = Math.ceil(Math.random() * 20);
    const r = await fetch(
      `https://images-api.nasa.gov/search?q=nebula+galaxy+cosmos&media_type=image,video&page=${page}&page_size=10`
    );
    if (!r.ok) throw new Error('NASA Images API ' + r.status);
    const j = await r.json();
    const items = (j?.collection?.items || []).filter(i => i?.links?.[0]?.href);
    if (!items.length) return { error: 'No usable NASA items on page ' + page };

    const item = items[Math.floor(Math.random() * items.length)];
    const data  = item.data?.[0] || {};
    const mediaUrl = item.links[0].href;
    const nasaId   = data.nasa_id || '';
    const link     = nasaId
      ? `https://images.nasa.gov/details/${encodeURIComponent(nasaId)}`
      : 'https://images.nasa.gov/';
    const isVideo  = mediaUrl.match(/\.(mp4|mov|webm)$/i) || data.media_type === 'video';
    const rawDesc  = (data.description || '').replace(/<[^>]+>/g, '').trim();

    return {
      title:       data.title || 'NASA Discovery',
      type:        isVideo ? 'video' : 'image',
      url:         mediaUrl,
      link,
      caption:     rawDesc.substring(0, 200) || '',
      description: rawDesc.substring(0, 200) || '',
      source_type: 'discovery'
    };
  } catch(e) {
    return { error: 'NASA discovery fetch failed: ' + e.message };
  }
}

// NASA APOD — Astronomy Picture of the Day with full explanation and article link
async function fetchApod(env) {
  try {
    const key = env.NASA_API_KEY || 'DEMO_KEY';
    const r = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${encodeURIComponent(key)}&thumbs=true`
    );
    if (!r.ok) throw new Error('APOD API ' + r.status);
    const j = await r.json();
    const isVideo  = j.media_type === 'video';
    const imageUrl = isVideo ? (j.thumbnail_url || '') : (j.url || j.hdurl || '');

    return {
      title:       j.title || 'NASA APOD',
      type:        j.media_type || 'image',
      url:         imageUrl,
      link:        j.hdurl || j.url || 'https://apod.nasa.gov/apod/astropix.html',
      caption:     j.title || '',
      explanation: j.explanation || '',
      source_type: 'apod'
    };
  } catch(e) {
    return { error: 'APOD fetch failed: ' + e.message };
  }
}

// =============================================================
// FIREBASE HELPERS
// =============================================================

function firebaseUrl(env, path) {
  const base   = (env.FIREBASE_DB_URL || '').replace(/\/$/, '');
  const secret = env.FIREBASE_DB_SECRET
    ? `?auth=${encodeURIComponent(env.FIREBASE_DB_SECRET)}`
    : '';
  return `${base}/${path.replace(/^\//, '')}${secret}`;
}

async function firebaseGet(env, path) {
  try {
    const res = await fetch(firebaseUrl(env, path));
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
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

// =============================================================
// AUTH HELPERS
// =============================================================

function isAuthed(request, env) {
  const cookie = request.headers.get('cookie') || '';
  const match  = cookie.match(/(?:^|;\s*)kosmoso_admin=([^;]+)/);
  return !!env.SESSION_SECRET && !!match && match[1] === env.SESSION_SECRET;
}

function buildSessionCookie(env) {
  if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET is not configured');
  return `kosmoso_admin=${env.SESSION_SECRET}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`;
}

// =============================================================
// UTILITY HELPERS
// =============================================================

function today() {
  return new Date().toISOString().slice(0, 10);
}

function latestValue(obj) {
  if (!obj || typeof obj !== 'object') return null;
  const vals = Object.values(obj);
  return vals.length ? vals[vals.length - 1] : null;
}

async function safeJson(request) {
  try { return await request.json(); }
  catch { return {}; }
}

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...extra, 'content-type': 'application/json; charset=utf-8' }
  });
}

function text(data, status = 200, extra = {}) {
  return new Response(String(data), {
    status,
    headers: { ...extra, 'content-type': 'text/plain; charset=utf-8' }
  });
}

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type'
  };
}
