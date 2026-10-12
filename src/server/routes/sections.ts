import { Hono } from 'hono';
import { prisma } from '../db.js';

export const sectionsRoutes = new Hono();

sectionsRoutes.get('/', async (c) => {
  const pnfId = c.req.query('pnfId');
  const sedeId = c.req.query('sedeId');
  const periodId = c.req.query('periodId');
  const professorId = c.req.query('professorId');

  const whereClause: any = {};
  if (pnfId) whereClause.pnfId = pnfId;
  if (sedeId) whereClause.sedeId = sedeId;
  if (periodId) whereClause.periodId = periodId;
  if (professorId) whereClause.professorId = professorId;

  const sections = await prisma.section.findMany({ where: whereClause });
  const formatted = sections.map((s) => ({
    ...s,
    schedules: JSON.parse(s.schedulesJson || '[]'),
  }));
  return c.json(formatted);
});

sectionsRoutes.get('/:id', async (c) => {
  const section = await prisma.section.findUnique({ where: { id: c.req.param('id') } });
  if (!section) return c.json({ error: 'Sección no encontrada' }, 404);
  return c.json({
    ...section,
    schedules: JSON.parse(section.schedulesJson || '[]'),
  });
});
