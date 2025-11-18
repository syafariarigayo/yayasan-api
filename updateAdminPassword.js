// updateAdminPassword.js
const bcrypt = require("bcryptjs");
const pool = require("./config/db"); // path sudah benar

async function updatePassword() {
  try {
    const newPassword = "123456"; // password baru
    const hashed = await bcrypt.hash(newPassword, 10);

    console.log("HASH BARU:", hashed);

    await pool.query(
      "UPDATE admin SET password = ? WHERE username = ?",
      [hashed, "admin"]
    );

    console.log("PASS ADMIN BERHASIL DIUPDATE!");
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit();
  }
}

updatePassword();