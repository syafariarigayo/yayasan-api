// middleware/auth.js
const jwt = require("jsonwebtoken");

/**
 * Middleware untuk verifikasi JWT Token
 * Melindungi route yang memerlukan autentikasi
 */
const auth = (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const authHeader = req.header("Authorization");
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: "Akses ditolak. Token tidak ditemukan.",
        code: "NO_TOKEN" 
      });
    }

    // Format: "Bearer <token>"
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ 
        error: "Format token tidak valid",
        code: "INVALID_FORMAT" 
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info ke request
    req.user = decoded;
    
    // Lanjutkan ke handler berikutnya
    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        error: "Token sudah expired. Silakan login kembali.",
        code: "TOKEN_EXPIRED" 
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        error: "Token tidak valid",
        code: "INVALID_TOKEN" 
      });
    }

    return res.status(500).json({ 
      error: "Terjadi kesalahan saat verifikasi token",
      code: "VERIFICATION_ERROR" 
    });
  }
};

module.exports = auth;