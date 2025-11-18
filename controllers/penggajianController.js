const pool = require("../config/db");

// ===============================
// KONFIGURASI GAJI (BISA DI PINDAH KE .env NANTI)
// ===============================
const GAJI_POKOK = 3000000;
const TUNJANGAN_HADIR = 10000;  
const POTONGAN_TELAT = 5000;
const POTONGAN_ALPA = 50000;

// ===============================
// HITUNG & SIMPAN GAJI BULANAN
// ===============================
exports.hitungGajiBulanan = async (req, res) => {
  try {
    const { bulan, tahun } = req.body;

    // Validasi
    if (!bulan || !tahun) {
      return res.status(400).json({ error: "Bulan dan tahun diperlukan" });
    }

    if (bulan < 1 || bulan > 12) {
      return res.status(400).json({ error: "Format bulan tidak valid (1-12)" });
    }

    // Cek apakah gaji bulan ini sudah dihitung sebelumnya
    const [cek] = await pool.query(
      `SELECT COUNT(*) AS total FROM gaji WHERE bulan = ? AND tahun = ?`,
      [bulan, tahun]
    );

    if (cek[0].total > 0) {
      return res.status(400).json({ error: "Gaji bulan ini sudah dihitung" });
    }

    // Ambil seluruh karyawan
    const [karyawan] = await pool.query("SELECT * FROM karyawan ORDER BY nama ASC");

    let hasil = [];

    for (let k of karyawan) {

      // Ambil absensi karyawan
      const [abs] = await pool.query(
        `SELECT status FROM absensi 
         WHERE karyawan_id = ? 
         AND MONTH(tanggal)=? 
         AND YEAR(tanggal)=?`,
        [k.id, bulan, tahun]
      );

      // Hitung status absensi
      let total_hadir = abs.filter(r => r.status === "HADIR").length;
      let total_telat = abs.filter(r => r.status === "TELAT").length;
      let total_izin = abs.filter(r => r.status === "IZIN").length;
      let total_alpa = abs.filter(r => r.status === "ALPA").length;

      // Jika tidak ada absensi → tetap dihitung sebagai 0
      total_hadir = total_hadir || 0;
      total_telat = total_telat || 0;
      total_izin = total_izin || 0;
      total_alpa = total_alpa || 0;

      // Hitung tunjangan & potongan
      let total_tunjangan = total_hadir * TUNJANGAN_HADIR;
      let pot_telat = total_telat * POTONGAN_TELAT;
      let pot_alpa = total_alpa * POTONGAN_ALPA;

      // Rumus final
      let gaji_bersih = GAJI_POKOK + total_tunjangan - pot_telat - pot_alpa;

      // Simpan ke database
      await pool.query(
        `INSERT INTO gaji
        (karyawan_id, bulan, tahun, 
         total_hadir, total_telat, total_izin, total_alpa,
         gaji_pokok, total_tunjangan, potongan_telat, potongan_alpa, 
         gaji_bersih, tanggal_proses)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          k.id,
          bulan,
          tahun,
          total_hadir,
          total_telat,
          total_izin,
          total_alpa,
          GAJI_POKOK,
          total_tunjangan,
          pot_telat,
          pot_alpa,
          gaji_bersih
        ]
      );

      // Tambahkan ke response ke frontend
      hasil.push({
        nama: k.nama,
        jabatan: k.jabatan,
        total_hadir,
        total_telat,
        total_izin,
        total_alpa,
        gaji_pokok: GAJI_POKOK,
        total_tunjangan,
        total_potongan: pot_telat + pot_alpa,
        gaji_bersih
      });
    }

    // Response
    res.json({
      status: "success",
      bulan,
      tahun,
      total_karyawan: hasil.length,
      data: hasil
    });

  } catch (err) {
    console.error("ERROR HITUNG GAJI:", err);
    res.status(500).json({ error: "Terjadi kesalahan saat menghitung gaji" });
  }
};