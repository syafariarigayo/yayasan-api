const pool = require("../config/db");

// FORMAT TANGGAL
const formatDate = (date) => {
  if (!date) return null;
  return date.split("T")[0];
};

// ==================== PASANGAN ====================

// CREATE/UPDATE PASANGAN
exports.savePasangan = async (req, res) => {
  try {
    const { karyawan_id } = req.params;
    const data = req.body;
    
    const [existing] = await pool.query(
      "SELECT id FROM karyawan_pasangan WHERE karyawan_id = ?",
      [karyawan_id]
    );
    
    if (existing.length > 0) {
      // UPDATE
      const sql = `
        UPDATE karyawan_pasangan SET
          nama_lengkap=?, gelar=?, tanggal_lahir=?, tempat_lahir=?,
          jenis_kelamin=?, nama_panggilan=?, golongan_darah=?, suku=?, agama=?,
          no_kk=?, nik=?, alamat_lengkap=?, desa=?, kecamatan=?, kabupaten=?,
          kewarganegaraan=?, no_wa=?
        WHERE karyawan_id=?
      `;
      
      const values = [
        data.nama_lengkap, data.gelar, formatDate(data.tanggal_lahir), 
        data.tempat_lahir, data.jenis_kelamin, data.nama_panggilan,
        data.golongan_darah, data.suku, data.agama, data.no_kk, data.nik,
        data.alamat_lengkap, data.desa, data.kecamatan, data.kabupaten,
        data.kewarganegaraan || "Indonesia", data.no_wa,
        karyawan_id
      ];
      
      await pool.query(sql, values);
      res.json({ message: "Data pasangan berhasil diupdate" });
      
    } else {
      // INSERT
      const sql = `
        INSERT INTO karyawan_pasangan (
          karyawan_id, nama_lengkap, gelar, tanggal_lahir, tempat_lahir,
          jenis_kelamin, nama_panggilan, golongan_darah, suku, agama,
          no_kk, nik, alamat_lengkap, desa, kecamatan, kabupaten,
          kewarganegaraan, no_wa
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `;
      
      const values = [
        karyawan_id,
        data.nama_lengkap, data.gelar, formatDate(data.tanggal_lahir), 
        data.tempat_lahir, data.jenis_kelamin, data.nama_panggilan,
        data.golongan_darah, data.suku, data.agama, data.no_kk, data.nik,
        data.alamat_lengkap, data.desa, data.kecamatan, data.kabupaten,
        data.kewarganegaraan || "Indonesia", data.no_wa
      ];
      
      await pool.query(sql, values);
      res.json({ message: "Data pasangan berhasil ditambahkan" });
    }
    
  } catch (err) {
    console.error("SAVE PASANGAN ERROR:", err);
    res.status(500).json({ message: "Gagal menyimpan data pasangan", error: err.message });
  }
};

// GET PASANGAN
exports.getPasangan = async (req, res) => {
  try {
    const { karyawan_id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM karyawan_pasangan WHERE karyawan_id = ?",
      [karyawan_id]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error("GET PASANGAN ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data pasangan" });
  }
};

// DELETE PASANGAN
exports.deletePasangan = async (req, res) => {
  try {
    const { karyawan_id } = req.params;
    await pool.query("DELETE FROM karyawan_pasangan WHERE karyawan_id = ?", [karyawan_id]);
    res.json({ message: "Data pasangan berhasil dihapus" });
  } catch (err) {
    console.error("DELETE PASANGAN ERROR:", err);
    res.status(500).json({ message: "Gagal menghapus data pasangan" });
  }
};


// ==================== ANAK ====================

// GET LIST ANAK
exports.listAnak = async (req, res) => {
  try {
    const { karyawan_id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM karyawan_anak WHERE karyawan_id = ? ORDER BY anak_ke",
      [karyawan_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("LIST ANAK ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data anak" });
  }
};

// CREATE ANAK
exports.createAnak = async (req, res) => {
  try {
    const { karyawan_id } = req.params;
    const data = req.body;
    
    const sql = `
      INSERT INTO karyawan_anak (
        karyawan_id, nama_lengkap, nama_panggilan, tempat_lahir, tanggal_lahir,
        jenis_kelamin, golongan_darah, nik, anak_ke
      ) VALUES (?,?,?,?,?,?,?,?,?)
    `;
    
    const values = [
      karyawan_id,
      data.nama_lengkap, data.nama_panggilan, data.tempat_lahir,
      formatDate(data.tanggal_lahir), data.jenis_kelamin, data.golongan_darah,
      data.nik, data.anak_ke
    ];
    
    await pool.query(sql, values);
    res.json({ message: "Data anak berhasil ditambahkan" });
  } catch (err) {
    console.error("CREATE ANAK ERROR:", err);
    res.status(500).json({ message: "Gagal menyimpan data anak", error: err.message });
  }
};

// UPDATE ANAK
exports.updateAnak = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const sql = `
      UPDATE karyawan_anak SET
        nama_lengkap=?, nama_panggilan=?, tempat_lahir=?, tanggal_lahir=?,
        jenis_kelamin=?, golongan_darah=?, nik=?, anak_ke=?
      WHERE id=?
    `;
    
    const values = [
      data.nama_lengkap, data.nama_panggilan, data.tempat_lahir,
      formatDate(data.tanggal_lahir), data.jenis_kelamin, data.golongan_darah,
      data.nik, data.anak_ke, id
    ];
    
    await pool.query(sql, values);
    res.json({ message: "Data anak berhasil diupdate" });
  } catch (err) {
    console.error("UPDATE ANAK ERROR:", err);
    res.status(500).json({ message: "Gagal update data anak" });
  }
};

// DELETE ANAK
exports.deleteAnak = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM karyawan_anak WHERE id = ?", [id]);
    res.json({ message: "Data anak berhasil dihapus" });
  } catch (err) {
    console.error("DELETE ANAK ERROR:", err);
    res.status(500).json({ message: "Gagal menghapus data anak" });
  }
};