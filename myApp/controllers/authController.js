const User = require('../models/User');
const jwt = require('jsonwebtoken');

const authController = {
  // Kayıt işlemi
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Kullanıcı var mı kontrol et
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu email veya kullanıcı adı zaten kullanılıyor' });
      }

      // Yeni kullanıcı oluştur
      const user = new User({
        username,
        email,
        password
      });

      await user.save();

      // JWT token oluştur
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Kullanıcı başarıyla oluşturuldu',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Kayıt işlemi sırasında bir hata oluştu', error: error.message });
    }
  },

  // Giriş işlemi
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Kullanıcıyı bul (password alanını da getir)
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Geçersiz email veya şifre' 
        });
      }

      // Şifreyi kontrol et
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: 'Geçersiz email veya şifre' 
        });
      }

      // Son giriş tarihini güncelle
      await user.updateLastLogin();

      // JWT token oluştur
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Kullanıcı bilgilerini hazırla (password hariç)
      const userInfo = {
        id: user._id,
        email: user.email,
        lastLogin: user.lastLogin,
        isActive: user.isActive
      };

      res.json({
        success: true,
        message: 'Giriş başarılı',
        token,
        user: userInfo
      });
    } catch (error) {
      console.error('Giriş hatası:', error);
      res.status(500).json({ 
        success: false,
        message: 'Giriş işlemi sırasında bir hata oluştu',
        error: error.message 
      });
    }
  }
};

module.exports = authController; 