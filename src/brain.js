const HTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>KOSMOSO</title>
    <style>
        body { background: #fff; color: #000; font-family: "Times New Roman", serif; padding: 40px; }
        #outer { max-width: 600px; margin: auto; border: 1px solid #000; padding: 20px; }
        .page { display: none; }
        .active { display: block; }
        input { width: 100%; padding: 10px; margin: 10px 0; }
        button { background: #000080; color: #fff; padding: 10px 20px; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <div id="outer">
        <div id="nav" style="margin-bottom:20px;">
            <a href="#" onclick="showPage('home')">HOME</a> | <a href="#" onclick="showPage('admin')">DEVELOPER</a>
        </div>

        <div id="page-home" class="page active">
            <h1>KOSMOSO</h1>
            <div id="content">Loading from Firebase...</div>
        </div>

        <div id="page-admin" class="page">
            <div id="login-section">
                <h3>System Access</h3>
                <input type="password" id="pass" placeholder="Enter Password">
                <button onclick="checkLogin()">Login</button>
            </div>
            <div id="admin-controls" style="display:none;">
                <h3>Authenticated</h3>
                <textarea id="edit-intro" style="width:100%; height:100px;"></textarea><br>
                <button onclick="updateFirebase()">Push to Firebase</button>
            </div>
        </div>
    </div>

    <script>
        function showPage(id) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById('page-' + id).classList.add('active');
        }

        async function checkLogin() {
            const p = document.getElementById('pass').value;
            // HARDCODED CHECK - BYPASSES ALL CLOUDFLARE SETTINGS
            if (p === "cindy2026") {
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('admin-controls').style.display = 'block';
            } else {
                alert("Incorrect Credentials");
            }
        }

        async function updateFirebase() {
            const val = document.getElementById('edit-intro').value;
            const res = await fetch('/api/update', { 
                method: 'POST', 
                body: JSON.stringify({text: val}) 
            });
            if(res.ok) alert("Updated!");
        }
    </script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/update" && request.method === "POST") {
      const body = await request.json();
      await fetch("https://kosmoso-default-rtdb.firebaseio.com/intro.json", {
        method: "PUT",
        body: JSON.stringify(body.text)
      });
      return new Response("ok");
    }

    return new Response(HTML, { headers: { "content-type": "text/html" } });
  }
};
