// AC: Geçersiz email formatı -> 400
// Basit email regex validasyonu
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// AC: Şifre en az 8 karakter olmalı -> 400
// AC: Şifre en az bir harf VE en az bir rakam içermeli -> 400
function validatePassword(password) {
  // En az 8 karakter
  if (password.length < 8) {
    return false;
  }

  // En az bir harf (a-z, A-Z)
  const hasLetter = /[a-zA-Z]/.test(password);

  // En az bir rakam (0-9)
  const hasNumber = /[0-9]/.test(password);

  return hasLetter && hasNumber;
}

module.exports = { validateEmail, validatePassword };
