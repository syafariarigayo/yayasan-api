const pool = require("../config/db");

// GET /rekap-gaji/bulanan?bulan=...&tahun=...
exports.getRekapGaji = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;
    if (!bulan || !tahun) return res.status(400).json({ error: "Bulan & tahun wajib" });

    const [rows] = await pool.query(
      `
      SELECT r.*, k.nama, k.jabatan
      FROM rekap_gaji r
      JOIN karyawan k ON r.karyawan_id = k.id
      WHERE r.bulan = ? AND r.tahun = ?
      ORDER BY k.nama
      `,
      [bulan, tahun]
    );

    res.json(rows);
  } catch (err) {
    console.error("ERR getRekapGaji:", err);
    res.status(500).json({ error: "Gagal mengambil data rekap gaji" });
  }
};

// POST /rekap-gaji/simpan  body: { bulan, tahun, data: [...] }
exports.simpanRekapGaji = async (req, res) => {
  try {
    const { bulan, tahun, data } = req.body;
    if (!bulan || !tahun || !Array.isArray(data)) {
      return res.status(400).json({ error: "Bulan, tahun, dan data (array) wajib" });
    }

    // hapus rekap bulan yang sama terlebih dahulu
    await pool.query(`DELETE FROM rekap_gaji WHERE bulan = ? AND tahun = ?`, [bulan, tahun]);

    // batch insert (per item)
    const insertSql = `
      INSERT INTO rekap_gaji (
        karyawan_id, bulan, tahun,
        total_hadir, total_telat, total_izin, total_alpa,
        gaji_pokok, uang_makan, uang_transport, total_gaji
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    for (const item of data) {
      await pool.query(insertSql, [
        item.karyawan_id,
        bulan,
        tahun,
        item.total_hadir || 0,
        item.total_telat || 0,
        item.total_izin || 0,
        item.total_alpa || 0,
        item.gaji_pokok || 0,
        item.uang_makan || 0,
        item.uang_transport || 0,
        item.total_gaji || 0,
      ]);
    }

    res.json({ message: "Rekap gaji berhasil disimpan." });
  } catch (err) {
    console.error("ERR simpanRekapGaji:", err);
    res.status(500).json({ error: "Gagal menyimpan rekap gaji" });
  }
};