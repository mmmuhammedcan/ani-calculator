const express = require('express');
const app = express();

app.use(express.json());

// In-memory ürün deposu
const products = [];

// Doğrulama fonksiyonu
function validateProduct(name, price) {
  // Ürün adı veya fiyat eksik mi? -> 400
  if (!name || price === undefined || price === null) {
    return { valid: false, error: 'Ürün adı ve fiyat zorunludur' };
  }

  // Fiyat 0 veya negatif sayı mı? -> 400
  if (typeof price !== 'number' || price <= 0) {
    return { valid: false, error: 'Fiyat 0 ve negatif olamaz' };
  }

  // Ürün adı 3 karakterden kısa mı? -> 400
  if (typeof name !== 'string' || name.trim().length < 3) {
    return { valid: false, error: 'Ürün adı en az 3 karakter olmalıdır' };
  }

  // Aynı isimde (büyük/küçük harf duyarsız) ürün var mı? -> 409
  const duplicateProduct = products.find(
    p => p.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (duplicateProduct) {
    return { valid: false, error: 'Bu isimde bir ürün zaten var', statusCode: 409 };
  }

  return { valid: true };
}

// Ürün ekleme endpoint'i
app.post('/products', (req, res) => {
  const { name, price } = req.body;

  // Doğrulama işlemini çalıştır
  const validation = validateProduct(name, price);

  // Doğrulama başarısız ise hata döner
  if (!validation.valid) {
    const statusCode = validation.statusCode || 400;
    return res.status(statusCode).json({ error: validation.error });
  }

  // Geçerli ürün adı + geçerli fiyat -> 201 döner ve oluşturulan ürünü JSON olarak verir
  const newProduct = {
    id: products.length + 1,
    name: name.trim(),
    price: price,
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);

  res.status(201).json(newProduct);
});

// Test etmek için GET endpoint
app.get('/products', (req, res) => {
  res.json(products);
});

// Sunucuyu başlat
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});

module.exports = app;
