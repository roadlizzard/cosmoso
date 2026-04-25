// =============================================================
// KOSMOSO — Static Cloudflare Worker
// Manually updated via Developer Panel. Archives intact.
// =============================================================

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>KOSMOSO</title>
<style>
  body { background: #ffffff; color: #000000; font-family: "Times New Roman", Times, serif; font-size: 16px; margin: 0; padding: 0; }
  #topbar { background: #000080; color: #ffffff; text-align: center; padding: 8px 0; font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; }
  #outer { width: 800px; margin: 0 auto; padding: 40px 0; }
  #sitetitle { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
  #nav { text-align: center; border-bottom: 1px solid #000; padding: 10px 0; margin-bottom: 30px; font-family: Arial; font-size: 12px; }
  #nav a { margin: 0 15px; font-weight: bold; color: #000080; text-decoration: none; text-transform: uppercase; cursor: pointer; }
  .page { display: none; }
  .page.active { display: block; }
  .section-head { font-family: Arial; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 15px; }
  #intro-box { border: 1px solid #000080; padding: 20px; background: #f0f0ff; margin-bottom: 30px; line-height: 1.6; }
  .archive-card { border-bottom: 1px solid #eee; padding: 15px 0; }
  .admin-panel { border: 1px solid #ccc; padding: 20px; background: #f9f9f9; margin-top: 20px; }
  textarea, input { width: 100%; margin-bottom: 10px; padding: 8px; border: 1px solid #ccc; font-family: inherit; }
  .retro-btn { background: #000080; color: #fff; border: none; padding: 10px 20px; cursor: pointer; font-size: 12px; font-weight: bold; }
</style>
</head>
<body>

<div id="topbar">KOSMOSO &nbsp;·&nbsp; MANUAL SYSTEMS ONLINE</div>

<div id="outer">
  <div id="sitetitle">
    <h1 style="font-size: 48px; margin: 0; letter-spacing: 4px;">KOSMOSO</h1>
    <div style="font-style: italic; color: #666; margin-top:5px;">A curated record of systems and mastery</div>
  </div>

  <div id="nav">
    <a onclick="showPage('home')">Home</a>
    <a onclick="showPage('blog')">The Letters</a>
    <a onclick="showPage('archive-bella')">Bella Archive</a>
    <a onclick="showPage('archive-nasa')">Media Archive</a>
    <a onclick="showPage('admin')">Developer</a>
  </div>

  <div id="page-home" class="page active">
    <div id="intro-box">
      <div class="section-head">Introduction</div>
      <div id="intro-display">Syncing...</div>
    </div>
    <div class="section-head">Current Feature: Bellissima</div>
    <div id="bella-display">No entry published yet.</div>
    <div class="section-head" style="margin-top:40px;">Current Feature: Media</div>
    <div id="media-display">No entry published yet.</div>
  </div>

  <div id="page-blog" class="page">
    <div class="section-head">The Letters</div>
    <div id="letters-list"></div>
  </div>

  <div id="page-archive-bella" class="page">
    <div class="section-head">Bellissima Archive</div>
    <div id="bella-archive"></div>
  </div>

  <div id="page-archive-nasa" class="page">
    <div class="section-head">Media Archive</div>
    <div id="media-archive"></div>
  </div>

  <div id="page-admin" class="page">
    <div id="admin-auth" style="display:none;">
      <div class="admin-panel">
        <h3>Update Introduction</h3>
        <textarea id="inp-intro" rows="3"></textarea>
        <button class="retro-btn" onclick="saveIntro()">Update</button>
      </div>

      <div class="admin-panel">
        <h3>Publish Bellissima (Physics)</h3>
        <input type="text" id="bell-title" placeholder="Topic Title">
        <textarea id="bell-text" placeholder="Content..."></textarea>
        <input type="text" id="bell-img" placeholder="Image URL (optional)">
        <button class="retro-btn" onclick="pubBella()">Publish</button>
      </div>

      <div class="admin-panel">
        <h3>Publish Media Entry</h3>
        <input type="text" id="med-title" placeholder="Media Title">
        <input type="text" id="med-url" placeholder="Direct Image/Video URL">
        <select id="med-type"><option value="image">Image</option><option value="video">Video</option></select>
        <button class="retro-btn" onclick="pubMedia()">Publish</button>
      </div>
    </div>
    <div id="admin-login">
      <input type="password" id="pass" placeholder="Enter System Password">
      <button class="retro-btn" onclick="login()">Access</button>
    </div>
  </div>
</div>

<script>
  function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-'+id).classList.add('active');
  }

  async function loadData() {
    const res = await fetch('/api/data');
    const data = await res.json();
    
    // Intro
    document.getElementById('intro-display').innerText = data.intro || "Welcome.";
    document.getElementById('inp-intro').value = data.intro || "";

    // Home - Latest
    renderLatest(data.bellissima, 'bella-display', 'bella');
    renderLatest(data.media, 'media-display', 'media');

    // Archives
    renderArchive(data.bellissima, 'bella-archive');
    renderArchive(data.media, 'media-archive');
    renderLetters(data.letters);
  }

  function renderLatest(obj, id, type) {
    if(!obj) return;
    const entries = Object.values(obj);
    const item = entries[entries.length - 1];
    let html = \`<b>\${item.date}</b><br><h3>\${item.title}</h3>\`;
    if(type === 'bella') {
      if(item.img) html += \`<img src="\${item.img}" style="max-width:200px; float:right;">\`;
      html += \`<p>\${item.text}</p>\`;
    } else {
      html += item.type === 'video' ? \`<video src="\${item.url}" controls style="width:100%"></video>\` : \`<img src="\${item.url}" style="width:100%">\`;
    }
    document.getElementById(id).innerHTML = html;
  }

  function renderArchive(obj, id) {
    if(!obj) return;
    document.getElementById(id).innerHTML = Object.values(obj).reverse().map(i => \`
      <div class="archive-card"><b>\${i.date}</b> - \${i.title}</div>
    \`).join('');
  }

  function renderLetters(obj) {
    if(!obj) return;
    document.getElementById('letters-list').innerHTML = Object.values(obj).reverse().map(i => \`
      <div style="margin-bottom:40px;"><h3>\${i.title}</h3><small>\${i.date}</small><p>\${i.content}</p></div>
    \`).join('');
  }

  async function login() {
    const pass = document.getElementById('pass').value;
    const res = await fetch('/api/admin/login', { method:'POST', body: JSON.stringify({password:pass}) });
    if(res.ok) {
       document.getElementById('admin-login').style.display='none';
       document.getElementById('admin-auth').style.display='block';
    } else { alert('Access Denied.'); }
  }

  async function saveIntro() {
    await fetch('/api/admin/update-intro', { method:'POST', body: JSON.stringify({text: document.getElementById('inp-intro').value}) });
    location.reload();
  }

  async function pubBella() {
    await fetch('/api/admin/pub-bella', { method:'POST', body: JSON.stringify({
      title: document.getElementById('bell-title').value,
      text: document.getElementById('bell-text').value,
      img: document.getElementById('bell-img').value,
      date: new Date().toLocaleDateString()
    })});
    location.reload();
  }

  async function pubMedia() {
    await fetch('/api/admin/pub-media', { method:'POST', body: JSON.stringify({
      title: document.getElementById('med-title').value,
      url: document.getElementById('med-url').value,
      type: document.getElementById('med-type').value,
      date: new Date().toLocaleDateString()
    })});
    location.reload();
  }

  loadData();
</script>
</body>
</html>\`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // API: GET DATA
    if (url.pathname === '/api/data') {
      const data = await fetch(env.FIREBASE_DB_URL + '/.json?auth=' + env.FIREBASE_DB_SECRET).then(r => r.json());
      return new Response(JSON.stringify(data), { headers: {'content-type':'application/json'} });
    }

    // API: LOGIN
    if (url.pathname === '/api/admin/login') {
      const { password } = await request.json();
      if (password === env.ADMIN_PASSWORD) return new Response('ok', { status: 200 });
      return new Response('fail', { status: 401 });
    }

    // API: UPDATES (POST)
    if (request.method === 'POST') {
      const body = await request.json();
      let path = '';
      if(url.pathname === '/api/admin/update-intro') path = 'intro.json';
      if(url.pathname === '/api/admin/pub-bella') path = 'bellissima.json';
      if(url.pathname === '/api/admin/pub-media') path = 'media.json';
      
      await fetch(\`\${env.FIREBASE_DB_URL}/\${path}?auth=\${env.FIREBASE_DB_SECRET}\`, {
        method: path.includes('intro') ? 'PUT' : 'POST',
        body: JSON.stringify(path.includes('intro') ? body.text : body)
      });
      return new Response('ok');
    }

    // Serve Frontend
    return new Response(HTML, { headers: { 'content-type': 'text/html' } });
  }
};
