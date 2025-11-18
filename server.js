require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ==========================
// 🔧 MIDDLEWARE
// ==========================
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

console.log("CORS ORIGIN:", process.env.CORS_ORIGIN);

// ==========================
// 📂 STATIC FILE
// ==========================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================
// 📌 ROUTES (LENGKAP & TERORGANISIR)
// ==========================

// Auth
app.use("/auth", require("./routes/auth"));

// Karyawan
app.use("/karyawan", require("./routes/karyawan"));

// Magang ✅ BARU
app.use("/magang", require("./routes/magang"));

// Keluarga (Pasangan & Anak) ✅ BARU
app.use("/keluarga", require("./routes/pasanganAnak"));

// Penilaian Kinerja ✅ BARU
app.use("/penilaian-kinerja", require("./routes/penilaianKinerja"));

// Absensi
app.use("/absensi", require("./routes/absensi"));
app.use("/import-absensi", require("./routes/importAbsensi"));

// Dashboard
app.use("/dashboard", require("./routes/dashboard"));

// Backup
app.use("/backup", require("./routes/backup"));

// Penggajian
app.use("/gaji", require("./routes/gajiRoutes"));
app.use("/rekap-gaji", require("./routes/rekapGaji"));
app.use("/slip", require("./routes/slipGaji"));

// ==========================
// 🕐 BACKUP CRON (opsional)
// ==========================
try {
  require("./cron/backupCron");
} catch (err) {
  console.log("Cron skip:", err.message);
}

// ==========================
// 🧪 TEST API
// ==========================
app.get("/", (req, res) => {
  res.send("✅ API Yayasan Wakaf Cendekia berjalan normal!");
});

// ==========================
// 🚀 START SERVER
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║   🚀 SERVER BERJALAN                      ║
  ║   📍 http://localhost:${PORT}                ║
  ║   📅 ${new Date().toLocaleString('id-ID')}     ║
  ╚════════════════════════════════════════════╝
  `);
  console.log("📋 Routes tersedia:");
  console.log("   • POST   /auth/login");
  console.log("   • GET    /karyawan");
  console.log("   • POST   /karyawan");
  console.log("   • GET    /magang");
  console.log("   • POST   /magang/:id/verifikasi");
  console.log("   • GET    /keluarga/pasangan/:karyawan_id");
  console.log("   • GET    /keluarga/anak/:karyawan_id");
  console.log("   • GET    /penilaian-kinerja");
  console.log("   • POST   /penilaian-kinerja");
  console.log("   • GET    /dashboard/summary");
  console.log("   • POST   /gaji/hitung");
  console.log("");
});

// ==========================
// ⚠️ ERROR HANDLER
// ==========================
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.stack);
  res.status(500).json({ 
    error: "Terjadi kesalahan server", 
    message: err.message 
  });
});

// ==========================
// 🚫 404 NOT FOUND
// ==========================
app.use((req, res) => {
  res.status(404).json({ 
    error: "Endpoint tidak ditemukan",
    path: req.path
  });
});