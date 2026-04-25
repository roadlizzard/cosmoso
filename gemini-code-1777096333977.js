import HTML_TEMPLATE from './template.html';

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
      return new Response(password === env.ADMIN_PASSWORD ? 'ok' : 'fail', { 
        status: password === env.ADMIN_PASSWORD ? 200 : 401 
      });
    }

    // API: POST UPDATES
    if (request.method === 'POST') {
      const body = await request.json();
      let path = '';
      if(url.pathname === '/api/admin/update-intro') path = 'intro.json';
      if(url.pathname === '/api/admin/pub-bella') path = 'bellissima.json';
      if(url.pathname === '/api/admin/pub-media') path = 'media.json';
      
      await fetch(env.FIREBASE_DB_URL + '/' + path + '?auth=' + env.FIREBASE_DB_SECRET, {
        method: path.includes('intro') ? 'PUT' : 'POST',
        body: JSON.stringify(path.includes('intro') ? body.text : body)
      });
      return new Response('ok');
    }

    // Serve the template
    return new Response(HTML_TEMPLATE, { 
      headers: { 'content-type': 'text/html; charset=utf-8' } 
    });
  }
};