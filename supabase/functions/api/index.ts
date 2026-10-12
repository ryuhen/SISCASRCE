import { app } from '../../src/server/app.ts';

// Supabase Edge Functions use standard Deno/Web Fetch handler
export default {
  fetch(req: Request) {
    return app.fetch(req);
  },
};
