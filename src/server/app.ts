import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { authRoutes } from './routes/auth.js';
import { pnfRoutes } from './routes/pnfs.js';
import { sedesRoutes } from './routes/sedes.js';
import { periodsRoutes } from './routes/periods.js';
import { sectionsRoutes } from './routes/sections.js';
import { attendanceRoutes } from './routes/attendance.js';
import { gradesRoutes } from './routes/grades.js';
import { preregistrationRoutes } from './routes/preregistration.js';
import { studentsRoutes } from './routes/students.js';
import { notificationsRoutes } from './routes/notifications.js';

export const app = new Hono();

app.use('*', cors());

app.get('/health', (c) => c.json({ status: 'OK', system: 'SISCASRCE API', timestamp: new Date().toISOString() }));

app.route('/api/auth', authRoutes);
app.route('/api/pnfs', pnfRoutes);
app.route('/api/sedes', sedesRoutes);
app.route('/api/periods', periodsRoutes);
app.route('/api/sections', sectionsRoutes);
app.route('/api/attendance', attendanceRoutes);
app.route('/api/grades', gradesRoutes);
app.route('/api/preregistration', preregistrationRoutes);
app.route('/api/students', studentsRoutes);
app.route('/api/notifications', notificationsRoutes);
