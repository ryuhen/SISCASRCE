import dotenv from 'dotenv';

dotenv.config();

export const config = {
  deploymentMode: (process.env.DEPLOYMENT_MODE || 'LOCAL') as 'LOCAL' | 'SUPABASE' | 'FIREBASE',
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'siscasrce-secret-key',
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
  },
};
