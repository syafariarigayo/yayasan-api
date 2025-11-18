// cron/backupCron.js
const cron = require("node-cron");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
require("dotenv").config();

// ===============================
//  KONFIGURASI
// ===============================

// folder backup (jika tidak ada, dibuat otomatis)
const BACKUP_DIR = path.join(process.cwd(), process.env.BACKUP_DIR || "backup");

// lokasi mysqldump (punya Laragon)
const MYSQLDUMP_PATH =
  process.env.MYSQLDUMP_PATH ||
  "C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysqldump.exe";

// retensi backup (hapus otomatis jika > X hari)
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || "30", 10);

// membuat folder backup bila belum ada
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log("📁 Folder backup dibuat:", BACKUP_DIR);
}

// ===============================
//  HAPUS BACKUP LAMA
// ===============================
function rotateBackups() {
  try {
    const now = Date.now();
    const cutoff = RETENTION_DAYS * 86400000; // 30 hari → milisecond

    fs.readdirSync(BACKUP_DIR).forEach((file) => {
      if (!file.endsWith(".sql")) return;

      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtimeMs > cutoff) {
        fs.unlinkSync(filePath);
        console.log("🧹 Menghapus backup lama:", file);
      }
    });
  } catch (err) {
    console.error("❌ Error rotasi backup:", err);
  }
}

// ===============================
//  EKSEKUSI BACKUP
// ===============================
function runBackup() {
  const now = new Date();

  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
  const filename = `backup_${date}_${time}.sql`;

  const savePath = path.join(BACKUP_DIR, filename);

  // DB CONFIG
  const DB_USER = process.env.DB_USER || "root";
  const DB_PASS = process.env.DB_PASSWORD || "";
  const DB_NAME = process.env.DB_NAME;

  if (!DB_NAME) {
    console.error("❌ DB_NAME belum di-set di .env");
    return;
  }

  const passArg = DB_PASS ? `-p${DB_PASS}` : "";

  const mysqldumpCommand = `"${MYSQLDUMP_PATH}" -u ${DB_USER} ${passArg} ${DB_NAME} > "${savePath}"`;

  console.log("⏳ Membuat backup:", filename);

  exec(mysqldumpCommand, { shell: true }, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Backup gagal:", err.message);
      if (stderr) console.error("stderr:", stderr);
      return;
    }

    console.log("✓ Backup selesai:", filename);

    // hapus backup lama
    rotateBackups();
  });
}

// ===============================
//  JADWAL CRON
// ===============================

// default: setiap hari jam 23:59
const CRON_SCHEDULE = process.env.BACKUP_CRON || "59 23 * * *";

cron.schedule(CRON_SCHEDULE, () => {
  console.log("🔁 Cron berjalan:", CRON_SCHEDULE);
  runBackup();
});

// opsi: jalan di startup server
if (process.env.REQUEST_START_BACKUP === "true") {
  console.log("⚡ Backup berjalan saat server start...");
  runBackup();
}

console.log("✔ Backup CRON aktif → jadwal:", CRON_SCHEDULE);
console.log("📂 Folder backup:", BACKUP_DIR);