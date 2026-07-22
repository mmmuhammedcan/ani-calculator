const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const registerRouter = require('./register');
app.use('/api/auth', registerRouter);

app.get('/', (req, res) => {
  res.json({
    message: 'Register API çalışıyor',
    endpoints: {
      register: 'POST /api/auth/register',
      users: 'GET /api/auth/users'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📝 Kayıt için: POST http://localhost:${PORT}/api/auth/register`);
});
