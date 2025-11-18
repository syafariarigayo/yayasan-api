const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM admin WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Username tidak ditemukan" });
    }

    const admin = rows[0];

    const valid = await bcrypt.compare(password, admin.password);

    if (!valid) {
      return res.status(400).json({ error: "Password salah" });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        role: admin.role
      },
      process.env.JWT_SECRET || "RAHASIA",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      role: admin.role
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};
