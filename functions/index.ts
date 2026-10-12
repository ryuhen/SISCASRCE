import * as functions from 'firebase-functions';
import { app } from '../src/server/app.js';

export const api = functions.https.onRequest((req, res) => {
  // Convert Node HTTP req/res to Web Standard Request/Response for Hono app handler
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, val]) => {
    if (typeof val === 'string') headers.set(key, val);
    else if (Array.isArray(val)) headers.set(key, val.join(', '));
  });

  const requestInit: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    requestInit.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  const request = new Request(url, requestInit);

  app.fetch(request).then(async (response) => {
    res.status(response.status);
    response.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });
    const text = await response.text();
    res.send(text);
  }).catch((err) => {
    res.status(500).send(err.message || 'Error Interno del Servidor');
  });
});
