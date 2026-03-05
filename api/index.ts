import { createApp } from '../dist/app.factory';
import type { Request, Response, RequestHandler } from 'express';

let cachedHandler: RequestHandler | null = null;

export default async function handler(req: Request, res: Response) {
  if (!cachedHandler) {
    const app = await createApp();
    await app.init();
    cachedHandler = app.getHttpAdapter().getInstance();
  }
  return new Promise<void>((resolve, reject) => {
    cachedHandler!(req, res, (err?: unknown) => (err ? reject(err) : resolve()));
  });
}
