import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const backend = process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://localhost:3333';
  const url = backend + req.url;

  const headers: Record<string,string> = { ...(req.headers as Record<string,string>) };
  delete headers.host;

  const init: any = { method: req.method, headers };
  if (req.method !== 'GET' && req.body) {
    init.body = JSON.stringify(req.body);
    init.headers = { ...init.headers, 'content-type': req.headers['content-type'] || 'application/json' };
  }

  const response = await fetch(url, init as any);
  const text = await response.text();

  res.status(response.status);
  response.headers.forEach((v: string, k: string) => res.setHeader(k, v));
  res.send(text);
}
