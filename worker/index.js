// Cloudflare Worker API for Kiddotubes (D1-backed)

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$|^\/+/g, '/');
    const segments = url.pathname.split('/').filter(Boolean);

    try {
      // GET /api/videos?q=
      if (url.pathname === '/api/videos' && request.method === 'GET') {
        const q = url.searchParams.get('q');
        if (q) {
          const res = await env.DB.prepare("SELECT * FROM videos WHERE title LIKE ? ORDER BY created_at DESC LIMIT 100").bind(`%${q}%`).all();
          return jsonResponse({ success: true, videos: res.results });
        }
        const res = await env.DB.prepare("SELECT * FROM videos ORDER BY created_at DESC LIMIT 200").all();
        return jsonResponse({ success: true, videos: res.results });
      }

      // POST /api/videos
      if (url.pathname === '/api/videos' && request.method === 'POST') {
        const body = await request.json();
        const id = body.id || crypto.randomUUID();
        await env.DB.prepare(
          "INSERT INTO videos (id, youtube_id, title, thumbnail, duration) VALUES (?, ?, ?, ?, ?)")
          .bind(id, body.youtube_id || null, body.title || null, body.thumbnail || null, body.duration || null)
          .run();
        return jsonResponse({ success: true, id });
      }

      // GET /api/favorites?user_id=
      if (url.pathname === '/api/favorites' && request.method === 'GET') {
        const user_id = url.searchParams.get('user_id');
        if (!user_id) return jsonResponse({ success: true, favorites: [] });
        const res = await env.DB.prepare(
          `SELECT f.id, f.user_id, f.video_id, v.title, v.thumbnail, v.duration, f.created_at
           FROM favorites f LEFT JOIN videos v ON f.video_id = v.id
           WHERE f.user_id = ? ORDER BY f.created_at DESC`)
          .bind(user_id)
          .all();
        return jsonResponse({ success: true, favorites: res.results });
      }

      // POST /api/favorites
      if (url.pathname === '/api/favorites' && request.method === 'POST') {
        const body = await request.json();
        const id = await env.DB.prepare(
          `INSERT INTO favorites (user_id, video_id) VALUES (?, ?)`)
          .bind(body.user_id, body.video_id)
          .run();
        return jsonResponse({ success: true, meta: id });
      }

      // DELETE /api/favorites/:id
      if (segments[0] === 'api' && segments[1] === 'favorites' && request.method === 'DELETE') {
        const favId = segments[2];
        if (!favId) return jsonResponse({ error: 'Missing id' }, 400);
        await env.DB.prepare('DELETE FROM favorites WHERE id = ?').bind(favId).run();
        return jsonResponse({ success: true });
      }

      // GET /api/history?user_id=
      if (url.pathname === '/api/history' && request.method === 'GET') {
        const user_id = url.searchParams.get('user_id');
        if (!user_id) return jsonResponse({ success: true, history: [] });
        const res = await env.DB.prepare('SELECT * FROM watch_history WHERE user_id = ? ORDER BY watched_at DESC').bind(user_id).all();
        return jsonResponse({ success: true, history: res.results });
      }

      // POST /api/history
      if (url.pathname === '/api/history' && request.method === 'POST') {
        const body = await request.json();
        await env.DB.prepare('INSERT INTO watch_history (user_id, video_id) VALUES (?, ?)').bind(body.user_id, body.video_id).run();
        return jsonResponse({ success: true });
      }

      // GET /api/users/:id or /api/users?email=
      if (segments[0] === 'api' && segments[1] === 'users' && request.method === 'GET') {
        if (segments[2]) {
          const id = segments[2];
          const res = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).all();
          return jsonResponse({ success: true, user: res.results[0] || null });
        }
        const email = url.searchParams.get('email');
        if (email) {
          const res = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).all();
          return jsonResponse({ success: true, user: res.results[0] || null });
        }
      }

      // POST /api/users
      if (url.pathname === '/api/users' && request.method === 'POST') {
        const body = await request.json();
        const id = body.id || crypto.randomUUID();
        await env.DB.prepare('INSERT OR REPLACE INTO users (id, email, name) VALUES (?, ?, ?)').bind(id, body.email || null, body.name || null).run();
        const res = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).all();
        return jsonResponse({ success: true, user: res.results[0] });
      }

      // Health
      if (url.pathname === '/api/health' && request.method === 'GET') {
        return jsonResponse({ status: 'ok', time: new Date().toISOString() });
      }

      return new Response('Not found', { status: 404 });
    } catch (err) {
      return jsonResponse({ error: err.message }, 500);
    }
  }
};
