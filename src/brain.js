// =============================================================
// KOSMOSO — OPEN ACCESS ENGINE (No Passwords)
// =============================================================

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>KOSMOSO</title>
    <style>
        body { background: #fff; color: #000; font-family: "Times New Roman", serif; margin: 0; }
        #topbar { background: #000080; color: #fff; text-align: center; padding: 10px; font-family: Arial; font-size: 11px; letter-spacing: 2px; }
        #outer { width: 700px; margin: 40px auto; border-top: 4px solid #000; padding-top: 20px; }
        .section { margin-bottom: 30px; border: 1px solid #eee; padding: 15px; }
        #nav { margin-bottom: 20px; text-align: center; font-family: Arial; font-size: 12px; }
        #nav a { margin: 0 10px; cursor: pointer; text-decoration: underline; color: #000080; font-weight: bold; }
        .page { display: none; }
        .page.active { display: block; }
        .admin-box { background: #f9f9f9; border: 1px dashed #000080; padding: 20px; margin-top: 20px; }
        textarea, input { width: 100%; padding: 10px; margin-bottom: 10px; box-sizing: border-box; border: 1px solid #ccc; }
        .btn { background: #000080; color: #fff; border: none; padding: 10px 20px; cursor: pointer; font-family: Arial; font-weight: bold; }
    </style>
</head>
<body>
    <div id="topbar">KOSMOSO &nbsp;·&nbsp; MANUAL SYSTEMS ONLINE</div>
    <div id="outer">
        <div id="nav">
            <a onclick="showPage('home')">HOME</a> | <a onclick="showPage('admin')">DEVELOPER</a>
        </div>

        <div id="page-home" class="page active">
            <div class="section">
                <strong>Current System Intro:</strong>
                <p id="intro-display">Syncing with Firebase...</p>
            </div>
            <div class="section">
                <strong>Latest Bellissima Entry:</strong>
                <div id="bella-display">No data recorded.</div>
            </div>
        </div>

        <div id="page-admin" class="page">
            <div class="admin-box">
                <h3 style="margin-top:0;">System Control (Open Access)</h3>
                
                <label>Update Introduction:</label>
                <textarea id="new-intro" rows="3"></textarea>
                <button class="btn" onclick="saveIntro()">Update Intro</button>
                
                <hr style="margin:20px 0;">
                
                <label>Publish New Bellissima:</label>
                <input type="text" id="bell-title" placeholder="Entry Title">
                <textarea id="bell-text" placeholder="Content..."></textarea>
                <button class="btn" onclick="pubBella()">Publish Entry</button>
            </div>
        </div>
    </div>

    <script>
        function showPage(id) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById('page-' + id).classList.add('active');
        }

        async function loadData() {
            try {
                const res = await fetch('/api/data');
                const data = await res.json();
                document.getElementById('intro-display').innerText = data.intro || "System Initialized.";
                document.getElementById('new-intro').value = data.intro || "";
                
                if(data.bellissima) {
                    const latest = Object.values(data.bellissima).pop();
                    document.getElementById('bella-display').innerHTML = "<h3>" + latest.title + "</h3><p>" + latest.text + "</p>";
                }
            } catch(e) { console.error("Sync Error:", e); }
        }

        async function saveIntro() {
            const txt = document.getElementById('new-intro').value;
            await fetch('/api/update', { 
                method: 'POST', 
                body: JSON.stringify({ path: 'intro.json', data: txt, method: 'PUT' }) 
            });
            location.reload();
        }

        async function pubBella() {
            const entry = {
                title: document.getElementById('bell-title').value,
                text: document.getElementById('bell-text').value,
                date: new Date().toLocaleDateString()
            };
            await fetch('/api/update', { 
                method: 'POST', 
                body: JSON.stringify({ path: 'bellissima.json', data: entry, method: 'POST' }) 
            });
            location.reload();
        }

        loadData();
    </script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const FB_BASE = "https://kosmoso-default-rtdb.firebaseio.com/";

    // 1. DATA FETCHING ROUTE
    if (url.pathname === '/api/data') {
      const res = await fetch(FB_BASE + ".json");
      const data = await res.json();
      return new Response(JSON.stringify(data), { headers: {'content-type':'application/json'} });
    }

    // 2. DATA UPDATE ROUTE (OPEN ACCESS)
    if (url.pathname === '/api/update' && request.method === 'POST') {
      const body = await request.json();
      await fetch(FB_BASE + body.path, {
        method: body.method,
        body: JSON.stringify(body.data)
      });
      return new Response('ok');
    }

    // 3. RENDER FRONTEND
    return new Response(HTML, { headers: { 'content-type': 'text/html' } });
  }
};
