const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

let users = [];

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 8;
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation checks
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
        message: 'Şifre en az 8 karakter olmalıdır'
      });
    }

    // Check if email already exists
    const userExists = users.find(user => user.email === email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Bu email zaten kayıtlı'
      });
    }

    // Hash password and save user
    const hashedPassword = await hashPassword(password);

    const newUser = {
      id: Date.now(),
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(newUser);

    // Return response in valid JSON format
    return res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla kaydedildi',
      user: {
        id: newUser.id,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası: ' + error.message
    });
  }
});

module.exports = router;
