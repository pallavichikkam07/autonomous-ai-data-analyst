import type { IncomingMessage, ServerResponse } from 'http';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (body: any) => VercelResponse;
  send: (body: any) => VercelResponse;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for safe cross-origin access if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const targetUrl = 'https://pallavichikkam.app.n8n.cloud/webhook/f3a7a56e-eb8f-4928-a4c6-8feb302abca9/chat';
      const pingRes = await fetch(targetUrl, { method: 'GET' });
      res.statusCode = pingRes.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ status: pingRes.status, ok: pingRes.ok }));
    } catch (e: any) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    return;
  }

  try {
    // Parse body if not parsed
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // keep as is
      }
    } else if (!body) {
      body = await new Promise((resolve) => {
        let raw = '';
        req.on('data', (chunk) => {
          raw += chunk;
        });
        req.on('end', () => {
          try {
            resolve(JSON.parse(raw));
          } catch {
            resolve(raw);
          }
        });
      });
    }

    const targetUrl =
      (body && body.webhookUrl) ||
      'https://pallavichikkam.app.n8n.cloud/webhook/f3a7a56e-eb8f-4928-a4c6-8feb302abca9/chat';

    // Forward the chat payload to n8n from the server side (No browser CORS restrictions)
    const n8nResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
      },
      body: JSON.stringify(body),
    });

    const responseText = await n8nResponse.text();
    let responseData: any;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    res.statusCode = n8nResponse.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify(
        typeof responseData === 'object' && responseData !== null
          ? responseData
          : { output: responseData, raw: responseText }
      )
    );
  } catch (error: any) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Proxy Error',
        message: error.message || 'Failed to connect to n8n server',
      })
    );
  }
}
