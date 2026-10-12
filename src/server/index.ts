import { serve } from '@hono/node-server';
import { app } from './app.js';
import { config } from './config.js';

console.log(`Starting SISCASRCE local server in ${config.deploymentMode} mode on port ${config.port}...`);

serve({
  fetch: app.fetch,
  port: config.port,
});
