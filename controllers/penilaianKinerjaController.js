const pool = require("../config/db");

// HITUNG KATEGORI
const hitungKategori = (nilaiAkhir) => {
  if (nilaiAkhir >= 90) return "Sangat Baik";
  if (nilaiAkhir >= 75) return "Baik";
  if (nilaiAkhir >= 60) return "Cukup";
  if (nilaiAkhir >= 40) return "Kurang";
  return "Sangat Kurang";
};

// LIST PENILAIAN
exports.listPenilaian = async (req, res) => {
  try {
    const { bulan, tahun, karyawan_id, status } = req.query;
    
    let sql = `
      SELECT p.*, k.nama, k.jabatan
      FROM penilaian_kinerja p
      JOIN karyawan k ON p.karyawan_id = k.id
      WHERE 1=1
    `;
    const params = [];
    
    if (bulan) {
      sql += " AND p.periode_bulan = ?";
      params.push(bulan);
    }
    
    if (tahun) {
      sql += " AND p.periode_tahun = ?";
      params.push(tahun);
    }
    
    if (karyawan_id) {
      sql += " AND p.karyawan_id = ?";
      params.push(karyawan_id);
    }
    
    if (status) {
      sql += " AND p.status = ?";
      params.push(status);
    }
    
    sql += " ORDER BY p.periode_tahun DESC, p.periode_bulan DESC, k.nama ASC";
    
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("LIST PENILAIAN ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data penilaian" });
  }
};

// GET BY ID
exports.getPenilaian = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.query(`
      SELECT p.*, k.nama, k.jabatan, k.email, k.no_hp
      FROM penilaian_kinerja p
      JOIN karyawan k ON p.karyawan_id = k.id
      WHERE p.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Penilaian tidak ditemukan" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error("GET PENILAIAN ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data penilaian" });
  }
};

// CREATE PENILAIAN
exports.createPenilaian = async (req, res) => {
  try {
    const data = req.body;
    
    // Cek duplikat
    const [existing] = await pool.query(
      `SELECT id FROM penilaian_kinerja 
       WHERE karyawan_id = ? AND periode_bulan = ? AND periode_tahun = ?`,
      [data.karyawan_id, data.periode_bulan, data.periode_tahun]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        message: "Penilaian untuk periode ini sudah ada. Gunakan fitur Edit." 
      });
    }
    
    // Hitung total & nilai
    const aspek = [
      data.kedisiplinan || 0, data.kualitas_kerja || 0, data.kuantitas_kerja || 0,
      data.inisiatif || 0, data.kerjasama || 0, data.tanggung_jawab || 0,
      data.komunikasi || 0, data.kehadiran || 0
    ];
    
    const totalSkor = aspek.reduce((sum, val) => sum + parseInt(val || 0), 0);
    const nilaiAkhir = (totalSkor / 8).toFixed(2);
    const kategori = hitungKategori(nilaiAkhir);
    
    const sql = `
      INSERT INTO penilaian_kinerja (
        karyawan_id, periode_bulan, periode_tahun,
        kedisiplinan, kualitas_kerja, kuantitas_kerja, inisiatif,
        kerjasama, tanggung_jawab, komunikasi, kehadiran,
        total_skor, nilai_akhir, kategori,
        kelebihan, kekurangan, rekomendasi, catatan_tambahan,
        status, tanggal_penilaian
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())
    `;
    
    const values = [
      data.karyawan_id, data.periode_bulan, data.periode_tahun,
      data.kedisiplinan || 0, data.kualitas_kerja || 0, data.kuantitas_kerja || 0,
      data.inisiatif || 0, data.kerjasama || 0, data.tanggung_jawab || 0,
      data.komunikasi || 0, data.kehadiran || 0,
      totalSkor, nilaiAkhir, kategori,
      data.kelebihan, data.kekurangan, data.rekomendasi, data.catatan_tambahan,
      data.status || "Draft"
    ];
    
    const [result] = await pool.query(sql, values);
    
    res.json({ 
      message: "Penilaian berhasil disimpan",
      id: result.insertId,
      nilai_akhir: nilaiAkhir,
      kategori: kategori
    });
  } catch (err) {
    console.error("CREATE PENILAIAN ERROR:", err);
    res.status(500).json({ message: "Gagal menyimpan penilaian", error: err.message });
  }
};

// UPDATE, DELETE, FINALISASI (simplified)
exports.updatePenilaian = async (req, res) => {
  try {
    // Implement update logic
    res.json({ message: "Update berhasil" });
  } catch (err) {
    res.status(500).json({ message: "Gagal update" });
  }
};

exports.deletePenilaian = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM penilaian_kinerja WHERE id = ?", [id]);
    res.json({ message: "Penilaian berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus" });
  }
};

exports.finalisasiPenilaian = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("UPDATE penilaian_kinerja SET status = 'Final' WHERE id = ?", [id]);
    res.json({ message: "Penilaian telah difinalisasi" });
  } catch (err) {
    res.status(500).json({ message: "Gagal finalisasi" });
  }
};

exports.statistikKaryawan = async (req, res) => {
  try {
    res.json({ message: "Statistik feature coming soon" });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};

exports.rekapPerPeriode = async (req, res) => {
  try {
    res.json({ message: "Rekap feature coming soon" });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};