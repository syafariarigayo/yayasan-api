const pool = require("../config/db");

// Rekap absensi per karyawan per bulan
exports.getRekapBulanan = async (req, res) => {
  try {
    const { karyawan_id, bulan, tahun } = req.query;

    if (!bulan || !tahun) {
      return res.status(400).json({ error: "Bulan dan tahun wajib diisi" });
    }

    let sql = `
      SELECT 
        a.*,
        k.nama
      FROM absensi a
      LEFT JOIN karyawan k ON k.id = a.karyawan_id
      WHERE MONTH(a.tanggal) = ? AND YEAR(a.tanggal) = ?
    `;
    
    let params = [bulan, tahun];

    // Filter berdasarkan karyawan (opsional)
    if (karyawan_id) {
      sql += " AND a.karyawan_id = ?";
      params.push(karyawan_id);
    }

    sql += " ORDER BY a.tanggal ASC";

    const [rows] = await pool.query(sql, params);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data rekap" });
  }
};