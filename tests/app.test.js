const request = require('supertest');
const express = require('express');
const fs = require('fs');
const app = require('../index'); // Necesitamos exportar 'app' desde index.js

describe('API de usuarios', () => {
  const testUser = { id: 'test123', name: 'Test User', email: 'test@example.com' };

  afterAll(() => {
    // Limpieza: eliminar usuario de prueba si existe
    const users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
    const filtered = users.filter(u => u.id !== testUser.id);
    fs.writeFileSync('./users.json', JSON.stringify(filtered, null, 2), 'utf8');
  });

  it('Debe responder el endpoint raíz', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Servidor en ejecucion/i);
  });

  it('Debe crear un nuevo usuario', async () => {
    const res = await request(app).post('/users').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.user).toMatchObject(testUser);
  });

  it('Debe obtener todos los usuarios', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Debe buscar el usuario creado', async () => {
    const res = await request(app).get(`/users/${testUser.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toMatchObject(testUser);
  });
});