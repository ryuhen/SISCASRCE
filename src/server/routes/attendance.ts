import { Hono } from 'hono';
import { prisma } from '../db.js';

export const attendanceRoutes = new Hono();

attendanceRoutes.get('/sessions', async (c) => {
  const sectionId = c.req.query('sectionId');
  const sessions = await prisma.classSession.findMany({
    where: sectionId ? { sectionId } : {},
    orderBy: { sessionNumber: 'asc' },
  });
  return c.json(sessions);
});

attendanceRoutes.post('/sessions', async (c) => {
  const body = await c.req.json();
  const session = await prisma.classSession.create({
    data: {
      sectionId: body.sectionId,
      sessionNumber: body.sessionNumber,
      date: body.date,
      topic: body.topic,
      objective: body.objective,
      registeredBy: body.registeredBy,
      registeredAt: new Date().toISOString(),
      isCompleted: body.isCompleted ?? true,
      notes: body.notes || null,
    },
  });
  return c.json(session);
});

attendanceRoutes.get('/records', async (c) => {
  const sectionId = c.req.query('sectionId');
  const sessionId = c.req.query('sessionId');
  const studentId = c.req.query('studentId');

  const whereClause: any = {};
  if (sectionId) whereClause.sectionId = sectionId;
  if (sessionId) whereClause.sessionId = sessionId;
  if (studentId) whereClause.studentId = studentId;

  const records = await prisma.attendanceRecord.findMany({ where: whereClause });
  return c.json(records);
});

attendanceRoutes.post('/records', async (c) => {
  const { records } = await c.req.json(); // Array of { sessionId, sectionId, studentId, status, justificationReason }
  const created = [];
  for (const r of records) {
    const item = await prisma.attendanceRecord.create({
      data: {
        sessionId: r.sessionId,
        sectionId: r.sectionId,
        studentId: r.studentId,
        status: r.status,
        justificationReason: r.justificationReason || null,
        updatedAt: new Date().toISOString(),
      },
    });
    created.push(item);
  }
  return c.json(created);
});
