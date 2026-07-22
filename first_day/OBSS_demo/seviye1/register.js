const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

let users = [];

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre gereklidir'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz email formatı'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalıdır'
      });
    }

    const userExists = users.find(user => user.email === email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Bu email zaten kayıtlı'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now(),
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(newUser);

    return res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla kaydedildi',
      user: {
        id: newUser.id,
        email: newUser.email
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası: ' + error.message
    });
  }
});

router.get('/users', (req, res) => {
  return res.json({
    success: true,
    count: users.length,
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      createdAt: u.createdAt
    }))
  });
});

module.exports = router;
