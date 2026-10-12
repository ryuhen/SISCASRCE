import { Hono } from 'hono';
import { prisma } from '../db.js';

export const gradesRoutes = new Hono();

gradesRoutes.get('/plan', async (c) => {
  const sectionId = c.req.query('sectionId');
  const items = await prisma.evaluationPlanItem.findMany({
    where: sectionId ? { sectionId } : {},
    orderBy: { corteNumber: 'asc' },
  });
  return c.json(items);
});

gradesRoutes.post('/plan', async (c) => {
  const body = await c.req.json();
  const item = await prisma.evaluationPlanItem.create({
    data: {
      sectionId: body.sectionId,
      corteNumber: body.corteNumber,
      title: body.title,
      weightPercentage: body.weightPercentage,
      maxScore: body.maxScore || 20,
      instrument: body.instrument,
      dueDate: body.dueDate,
      isPublished: body.isPublished ?? false,
    },
  });
  return c.json(item);
});

gradesRoutes.get('/records', async (c) => {
  const sectionId = c.req.query('sectionId');
  const studentId = c.req.query('studentId');

  const whereClause: any = {};
  if (sectionId) whereClause.sectionId = sectionId;
  if (studentId) whereClause.studentId = studentId;

  const records = await prisma.gradeRecord.findMany({ where: whereClause });
  return c.json(records);
});

gradesRoutes.post('/records', async (c) => {
  const { records } = await c.req.json(); // Array of grade records
  const updated = [];
  for (const g of records) {
    const rec = await prisma.gradeRecord.upsert({
      where: { id: g.id || 'new-temp-id-' + Math.random() },
      update: {
        score: g.score,
        feedback: g.feedback || null,
        updatedBy: g.updatedBy,
        updatedAt: new Date().toISOString(),
      },
      create: {
        evaluationPlanItemId: g.evaluationPlanItemId,
        sectionId: g.sectionId,
        studentId: g.studentId,
        score: g.score,
        feedback: g.feedback || null,
        updatedBy: g.updatedBy,
        updatedAt: new Date().toISOString(),
      },
    });
    updated.push(rec);
  }
  return c.json(updated);
});
