export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = [
      'https://eliciao12.eu',
      'https://www.eliciao12.eu',
      'http://localhost:8000',
      'http://127.0.0.1:8000',
    ];
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    const readCount = async () => {
      const value = await env.VISITS.get('total');
      const parsed = Number.parseInt(value || '0', 10);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    if (url.pathname === '/count') {
      const current = await readCount();
      const next = current + 1;
      await env.VISITS.put('total', String(next));
      return new Response(JSON.stringify({ count: next }), {
        headers: corsHeaders,
      });
    }

    if (url.pathname === '/count/get') {
      const current = await readCount();
      return new Response(JSON.stringify({ count: current }), {
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: corsHeaders,
    });
  },
};
