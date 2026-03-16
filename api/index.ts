import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../dist/app.factory';

type ExpressHandler = (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => void;
let cachedHandler: ExpressHandler | null = null;

const ALLOWED_ORIGINS = [
  'https://l-edu.vercel.app',
  'http://localhost:3000',
  'https://l-edu-fe.vercel.app',
  'https://l-edu-admin.vercel.app',
  'http://localhost:3001',
];

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (/^https:\/\/l-edu-admin(-[\w-]+)?\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/l-edu(-[\w-]+)?\.vercel\.app$/.test(origin)) return true;
  if (/^https:\/\/l-edu-fe(-[\w-]+)?\.vercel\.app$/.test(origin)) return true;
  return false;
}

function setCorsHeaders(req: IncomingMessage, res: ServerResponse): void {
  const origin = req.headers?.origin;
  if (typeof origin === 'string' && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (!cachedHandler) {
    const app = await createApp();
    await app.init();
    cachedHandler = app.getHttpAdapter().getInstance() as ExpressHandler;
  }
  return new Promise<void>((resolve, reject) => {
    cachedHandler!(req, res, (err?: unknown) => (err ? reject(err) : resolve()));
  });
}
