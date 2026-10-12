import { Hono } from 'hono';
import { prisma } from '../db.js';

export const periodsRoutes = new Hono();

periodsRoutes.get('/', async (c) => {
  const periods = await prisma.academicPeriod.findMany({
    orderBy: { year: 'desc' },
  });
  return c.json(periods);
});

periodsRoutes.get('/current', async (c) => {
  const period = await prisma.academicPeriod.findFirst({
    where: { isCurrent: true },
  });
  return c.json(period);
});

periodsRoutes.get('/per-records', async (c) => {
  const records = await prisma.perRecoveryRecord.findMany();
  return c.json(records);
});
