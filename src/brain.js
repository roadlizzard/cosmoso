// =============================================================
// KOSMOSO — FULL DYNAMIC ENGINE (Firebase Integrated)
// =============================================================

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>KOSMOSO</title>
    <style>
        body { background: #fff; color: #000; font-family: "Times New Roman", serif; margin: 0; }
        #outer { width: 700px; margin: 40px auto; border-top: 4px solid #000; padding-top: 20px; }
        .section { margin-bottom: 30px; border: 1px solid #eee; padding: 15px; }
        #nav { margin-bottom: 20px; text-align: center; font-family: Arial; font-size: 12px; }
        #nav a { margin: 0 10px; cursor: pointer; text-decoration: underline; color: #000080; }
        .page { display: none; }
        .page.active { display: block; }
        .admin-box { background: #f0f0f0; padding: 20px; margin-top: 20px; }
    </style>
</head>
<body>
    <div id="outer">
        <div id="nav">
            <a onclick="showPage('home')">HOME</a> | <a onclick="showPage('admin')">DEVELOPER</a>
        </div>

        <div id="page-home" class="page active">
            <div class="section">
                <strong>Current Intro:</strong>
                <p id="intro-display">Syncing...</p>
            </div>
            <div class="section">
                <strong>Latest Bellissima:</strong>
                <div id="bella-display">No data.</div>
            </div>
        </div>

        <div id="page-admin" class="page">
            <div id="login-form">
                <input type="password" id="pass" placeholder="Password">
                <button onclick="login()">Access System</button>
            </div>
            <div id="admin-controls" style="display:none;">
                <div class="admin-box">
                    <h3>Update Introduction</h3>
                    <textarea id="new-intro" style="width:100%"></textarea>
                    <button onclick="saveIntro()">Save to Firebase</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        function showPage(id) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById('page-' + id).classList.add('active');
        }

        async function loadData() {
            const res = await fetch('/api/data');
            const data = await res.json();
            document.getElementById('intro-display').innerText = data.intro || "Welcome.";
            if(data.bellissima) {
                const latest = Object.values(data.bellissima).pop();
                document.getElementById('bella-display').innerHTML = "<h3>" + latest.title + "</h3><p>" + latest.text + "</p>";
            }
        }

        async function login() {
            const p = document.getElementById('pass').value;
            const res = await fetch('/api/admin/login', { method: 'POST', body: JSON.stringify({password:p}) });
            if(res.ok) {
                document.getElementById('login-form').style.display = 'none';
                document.getElementById('admin-controls').style.display = 'block';
            } else { alert('Wrong password'); }
        }

        async function saveIntro() {
            const txt = document.getElementById('new-intro').value;
            await fetch('/api/admin/update', { method: 'POST', body: JSON.stringify({intro: txt}) });
            location.reload();
        }

        loadData();
    </script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const FIREBASE = "https://kosmoso-default-rtdb.firebaseio.com/.json";

    // API: Pull data from Firebase
    if (url.pathname === '/api/data') {
      const res = await fetch(FIREBASE);
      const data = await res.json();
      return new Response(JSON.stringify(data), { headers: {'content-type':'application/json'} });
    }

    // API: Login logic
    if (url.pathname === '/api/admin/login') {
      const { password } = await request.json();
      const valid = env.ADMIN_PASSWORD || 'cindy2026';
      return new Response(password === valid ? 'ok' : 'fail', { status: password === valid ? 200 : 401 });
    }

    // API: Update logic
    if (url.pathname === '/api/admin/update' && request.method === 'POST') {
      const body = await request.json();
      await fetch("https://kosmoso-default-rtdb.firebaseio.com/intro.json", {
        method: 'PUT',
        body: JSON.stringify(body.intro)
      });
      return new Response('ok');
    }

    return new Response(HTML, { headers: { 'content-type': 'text/html' } });
  }
};
