import { Hono } from 'hono';
import { prisma } from '../db.js';

export const sedesRoutes = new Hono();

sedesRoutes.get('/', async (c) => {
  const sedes = await prisma.sede.findMany();
  const formatted = sedes.map((s) => ({
    ...s,
    pnfIdsOffered: JSON.parse(s.pnfIdsOfferedJson || '[]'),
    pnfCoordinatorsMap: s.pnfCoordinatorsMapJson ? JSON.parse(s.pnfCoordinatorsMapJson) : undefined,
  }));
  return c.json(formatted);
});

sedesRoutes.get('/:id', async (c) => {
  const sede = await prisma.sede.findUnique({ where: { id: c.req.param('id') } });
  if (!sede) return c.json({ error: 'Sede no encontrada' }, 404);
  return c.json({
    ...sede,
    pnfIdsOffered: JSON.parse(sede.pnfIdsOfferedJson || '[]'),
    pnfCoordinatorsMap: sede.pnfCoordinatorsMapJson ? JSON.parse(sede.pnfCoordinatorsMapJson) : undefined,
  });
});
