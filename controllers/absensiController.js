const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cek username
    const [rows] = await pool.query(
      "SELECT * FROM admin WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Username tidak ditemukan" });
    }

    const admin = rows[0];

    // Cek password
    const passwordValid = await bcrypt.compare(password, admin.password);
    if (!passwordValid) {
      return res.status(400).json({ error: "Password salah" });
    }

    // Generate token JWT
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role || "admin"
      },
      process.env.JWT_SECRET || "RAHASIA",
      { expiresIn: "7d" }
    );

    // Kirim respons berhasil
    return res.json({
      message: "Login berhasil",
      token,
      data: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};