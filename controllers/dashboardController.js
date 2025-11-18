const pool = require("../config/db");

// Total karyawan
exports.getSummary = async (req, res) => {
  try {
    const [[total]] = await pool.query(`SELECT COUNT(*) AS total FROM karyawan`);
    const [status] = await pool.query(`
        SELECT status_magang AS status, COUNT(*) AS jumlah 
        FROM karyawan 
        GROUP BY status_magang
    `);
    const [jabatan] = await pool.query(`
        SELECT jabatan, COUNT(*) AS jumlah
        FROM karyawan
        GROUP BY jabatan
    `);

    res.json({
      total: total.total,
      status,
      jabatan
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data dashboard" });
  }
};