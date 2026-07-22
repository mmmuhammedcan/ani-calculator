const request = require('supertest');
const app = require('./register');
const bcrypt = require('bcrypt');

describe('POST /register', () => {
  // AC: Geçerli email + geçerli şifre -> 201 döner ve yanıt şifreyi/hash'i İÇERMEZ
  test('should return 201 with valid email and password, without exposing password', async () => {
    const response = await request(app)
      .post('/register')
      .send({ email: 'test@example.com', password: 'ValidPass123' });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('test@example.com');
    expect(response.body).not.toHaveProperty('password');
  });

  // AC: Geçersiz email formatı -> 400
  test('should return 400 for invalid email format', async () => {
    const response = await request(app)
      .post('/register')
      .send({ email: 'invalid-email', password: 'ValidPass123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('email');
  });

  // AC: email veya password eksik -> 400
  test('should return 400 when email is missing', async () => {
    const response = await request(app)
      .post('/register')
      .send({ password: 'ValidPass123' });

    expect(response.status).toBe(400);
  });

  test('should return 400 when password is missing', async () => {
    const response = await request(app)
      .post('/register')
      .send({ email: 'test@example.com' });

    expect(response.status).toBe(400);
  });

  // AC: Şifre en az 8 karakter olmalı; daha kısaysa -> 400
  test('should return 400 for password shorter than 8 characters', async () => {
    const response = await request(app)
      .post('/register')
      .send({ email: 'test@example.com', password: 'Pass12' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('8 characters');
  });

  // AC: Şifre en az bir harf VE en az bir rakam içermeli; içermiyorsa -> 400
  test('should return 400 for password without letters', async () => {
    const response = await request(app)
      .post('/register')
      .send({ email: 'test@example.com', password: '12345678' });

    expect(response.status).toBe(400);
  });

  test('should return 400 for password without numbers', async () => {
    const response = await request(app)
      .post('/register')
      .send({ email: 'test@example.com', password: 'abcdefgh' });

    expect(response.status).toBe(400);
  });

  // AC: Aynı email ikinci kez gönderilirse -> 409
  test('should return 409 when email already registered', async () => {
    await request(app)
      .post('/register')
      .send({ email: 'duplicate@example.com', password: 'ValidPass123' });

    const response = await request(app)
      .post('/register')
      .send({ email: 'duplicate@example.com', password: 'AnotherPass456' });

    expect(response.status).toBe(409);
  });

  // AC: Email büyük/küçük harf duyarsızdır: "A@x.com" ile "a@x.com" aynı kullanıcıdır -> 409
  test('should return 409 for case-insensitive duplicate email', async () => {
    await request(app)
      .post('/register')
      .send({ email: 'CaseSensitive@Example.COM', password: 'ValidPass123' });

    const response = await request(app)
      .post('/register')
      .send({ email: 'casesensitive@example.com', password: 'AnotherPass456' });

    expect(response.status).toBe(409);
  });
});
