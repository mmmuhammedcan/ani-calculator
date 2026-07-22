const express = require('express');
const app = express();

app.use(express.json());

const products = [];

app.post('/products', (req, res) => {
  const { name, price } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'Ürün adı ve fiyatı gereklidir' });
  }

  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'Fiyat pozitif bir sayı olmalıdır' });
  }

  const product = {
    id: products.length + 1,
    name,
    price,
    createdAt: new Date().toISOString()
  };

  products.push(product);
  res.status(201).json(product);
});

app.get('/products', (req, res) => {
  res.json(products);
});

app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Ürün bulunamadı' });
  }
  res.json(product);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});

module.exports = app;
