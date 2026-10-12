import { Hono } from 'hono';
import { prisma } from '../db.js';

export const studentsRoutes = new Hono();

studentsRoutes.get('/', async (c) => {
  const role = c.req.query('role') || 'estudiante';
  const pnfId = c.req.query('pnfId');
  const sedeId = c.req.query('sedeId');

  const whereClause: any = { role };
  if (pnfId) whereClause.pnfId = pnfId;
  if (sedeId) whereClause.sedeId = sedeId;

  const users = await prisma.user.findMany({ where: whereClause });
  return c.json(users);
});

studentsRoutes.get('/:id/enrollments', async (c) => {
  const { id } = c.req.param();
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: id },
  });
  return c.json(enrollments);
});

studentsRoutes.get('/:id/observations', async (c) => {
  const { id } = c.req.param();
  const observations = await prisma.studentObservation.findMany({
    where: { studentId: id },
    orderBy: { date: 'desc' },
  });
  return c.json(observations);
});
