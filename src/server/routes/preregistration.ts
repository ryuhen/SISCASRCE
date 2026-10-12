import { Hono } from 'hono';
import { prisma } from '../db.js';

export const preregistrationRoutes = new Hono();

preregistrationRoutes.get('/', async (c) => {
  const list = await prisma.preRegistration.findMany({
    orderBy: { createdAt: 'desc' },
  });
  const formatted = list.map((p) => ({
    ...p,
    documents: JSON.parse(p.documentsJson || '{}'),
  }));
  return c.json(formatted);
});

preregistrationRoutes.post('/', async (c) => {
  const body = await c.req.json();
  const created = await prisma.preRegistration.create({
    data: {
      cedula: body.cedula,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      pnfId: body.pnfId,
      sedeId: body.sedeId,
      birthDate: body.birthDate,
      highSchool: body.highSchool,
      graduationYear: body.graduationYear,
      address: body.address,
      shiftPreference: body.shiftPreference,
      status: 'Pendiente',
      documentsJson: JSON.stringify(body.documents || {}),
      createdAt: new Date().toISOString(),
    },
  });
  return c.json(created);
});

preregistrationRoutes.patch('/:id/status', async (c) => {
  const { id } = c.req.param();
  const { status, reviewNotes, reviewedBy } = await c.req.json();

  const updated = await prisma.preRegistration.update({
    where: { id },
    data: {
      status,
      reviewNotes: reviewNotes || null,
      reviewedBy: reviewedBy || 'COORDINADOR',
      reviewedAt: new Date().toISOString(),
    },
  });

  return c.json(updated);
});
