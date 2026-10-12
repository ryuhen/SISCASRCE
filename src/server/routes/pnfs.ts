import { Hono } from 'hono';
import { prisma } from '../db.js';

export const pnfRoutes = new Hono();

pnfRoutes.get('/', async (c) => {
  const pnfs = await prisma.pNF.findMany();
  const formatted = pnfs.map((p) => ({
    ...p,
    sedeIds: JSON.parse(p.sedeIdsJson || '[]'),
    colorTheme: JSON.parse(p.colorThemeJson || '{}'),
  }));
  return c.json(formatted);
});

pnfRoutes.get('/:id', async (c) => {
  const pnf = await prisma.pNF.findUnique({ where: { id: c.req.param('id') } });
  if (!pnf) return c.json({ error: 'PNF no encontrado' }, 404);
  return c.json({
    ...pnf,
    sedeIds: JSON.parse(pnf.sedeIdsJson || '[]'),
    colorTheme: JSON.parse(pnf.colorThemeJson || '{}'),
  });
});

pnfRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const pnf = await prisma.pNF.create({
    data: {
      code: body.code,
      name: body.name,
      modality: body.modality,
      tramosPerTrayecto: body.tramosPerTrayecto,
      totalTrayectos: body.totalTrayectos,
      description: body.description,
      sedeIdsJson: JSON.stringify(body.sedeIds || []),
      coordinatorId: body.coordinatorId,
      colorThemeJson: JSON.stringify(body.colorTheme || {}),
    },
  });
  return c.json(pnf);
});
