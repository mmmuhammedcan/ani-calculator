const express = require('express');
const bcrypt = require('bcrypt');
const { validateEmail, validatePassword } = require('./validators');

const app = express();
app.use(express.json());

// In-memory store (replace with database in production)
const users = new Map();

// POST /register endpoint
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  // AC: email veya password eksik -> 400
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // AC: Geçersiz email formatı -> 400
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // AC: Şifre en az 8 karakter olmalı -> 400
  // AC: Şifre en az bir harf VE en az bir rakam içermeli -> 400
  if (!validatePassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters and contain letters and numbers'
    });
  }

  // AC: Email büyük/küçük harf duyarsızdır (normalize etme)
  const normalizedEmail = email.toLowerCase();

  // AC: Aynı email ikinci kez gönderilirse -> 409
  if (users.has(normalizedEmail)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  // AC: Geçerli email + geçerli şifre -> 201 döner
  // Hash şifreyi bcrypt ile
  const hashedPassword = await bcrypt.hash(password, 10);

  // AC: Yanıt şifreyi/hash'i İÇERMEZ
  users.set(normalizedEmail, { email: normalizedEmail, password: hashedPassword });

  res.status(201).json({
    message: 'User registered successfully',
    email: normalizedEmail
  });
});

module.exports = app;
