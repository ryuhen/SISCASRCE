import { describe, it, expect, beforeAll } from 'vitest';
import { app } from '../src/server/app.js';

describe('SISCASRCE Backend REST API Tests', () => {
  it('GET /health returns OK status', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('OK');
    expect(body.system).toBe('SISCASRCE API');
  });

  it('GET /api/pnfs returns list of PNFs from seeded database', async () => {
    const res = await app.request('/api/pnfs');
    expect(res.status).toBe(200);
    const pnfs = await res.json();
    expect(Array.isArray(pnfs)).toBe(true);
    expect(pnfs.length).toBeGreaterThan(0);
    expect(pnfs[0]).toHaveProperty('code');
  });

  it('GET /api/sedes returns list of Sedes', async () => {
    const res = await app.request('/api/sedes');
    expect(res.status).toBe(200);
    const sedes = await res.json();
    expect(Array.isArray(sedes)).toBe(true);
    expect(sedes.length).toBeGreaterThan(0);
  });

  it('GET /api/periods returns academic periods', async () => {
    const res = await app.request('/api/periods');
    expect(res.status).toBe(200);
    const periods = await res.json();
    expect(Array.isArray(periods)).toBe(true);
  });

  it('GET /api/preregistration returns list of pre-registrations', async () => {
    const res = await app.request('/api/preregistration');
    expect(res.status).toBe(200);
    const preRegs = await res.json();
    expect(Array.isArray(preRegs)).toBe(true);
  });

  it('POST /api/preregistration creates a new student pre-registration', async () => {
    const randomCedula = 'V-' + Math.floor(10000000 + Math.random() * 90000000);
    const newPreReg = {
      cedula: randomCedula,
      firstName: 'Test',
      lastName: 'Student',
      email: `${randomCedula}@example.com`,
      phone: '04120000000',
      pnfId: 'pnf-1',
      sedeId: 'sede-1',
      birthDate: '2002-01-01',
      highSchool: 'Liceo Test',
      graduationYear: 2020,
      address: 'Test City',
      shiftPreference: 'Diurno',
      documents: { cedulaCopy: true, titleCopy: true, gradesCertificate: true, photo: true },
    };

    const res = await app.request('/api/preregistration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPreReg),
    });

    expect(res.status).toBe(200);
    const created = await res.json();
    expect(created.cedula).toBe(randomCedula);
    expect(created.status).toBe('Pendiente');
  });

  it('POST /api/auth/login authenticates registered users', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'director.casrce@universidad.edu.ve', password: 'password123' }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('token');
    expect(data.user.email).toBe('director.casrce@universidad.edu.ve');
  });
});
