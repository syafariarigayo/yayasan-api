const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

exports.backupDatabase = (req, res) => {
  try {
    // Folder tempat menyimpan backup
    const backupDir = path.join(process.cwd(), "backup");

    // Buat folder jika belum ada
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Nama file backup
    const fileName = `backup-${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}.sql`;

    // Path file tujuan
    const filePath = path.join(backupDir, fileName);

    // Perintah mysqldump (Laragon)
    const dumpCommand = `"C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysqldump.exe" -u root ${process.env.DB_NAME} > "${filePath}"`;

    exec(dumpCommand, (err) => {
      if (err) {
        console.error("Backup error:", err);
        return res.status(500).json({ error: "Gagal melakukan backup" });
      }

      res.json({
        message: "Backup berhasil dibuat",
        file: fileName,
        lokasi: filePath
      });
    });
  } catch (error) {
    console.error("Backup error:", error);
    res.status(500).json({ error: "Backup error (server)" });
  }
};