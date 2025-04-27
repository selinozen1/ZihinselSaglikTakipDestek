const express = require('express');
const router = express.Router();

// Kullanıcı bilgilerini getirme
router.get('/profile', async (req, res) => {
  try {
    // Burada kullanıcı bilgilerini getirme işlemi yapılacak
    res.json({ message: 'Kullanıcı profili' });
  } catch (error) {
    res.status(500).json({ message: 'Bir hata oluştu', error: error.message });
  }
});

module.exports = router; 