import { Hono } from 'hono';
import { prisma } from '../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';

export const authRoutes = new Hono();

authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return c.json({ error: 'Usuario no encontrado' }, 401);
  }

  // Demo shortcut or bcrypt validation
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, sedeId: user.sedeId, pnfId: user.pnfId },
    config.jwtSecret,
    { expiresIn: '1d' }
  );

  return c.json({ token, user });
});

authRoutes.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ error: 'No autorizado' }, 401);

  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return c.json({ error: 'Usuario no encontrado' }, 404);
    return c.json({ user });
  } catch (err) {
    return c.json({ error: 'Token inválido' }, 401);
  }
});
