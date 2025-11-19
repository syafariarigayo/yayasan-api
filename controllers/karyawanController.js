const pool = require("../config/db");

// FORMAT TANGGAL
const formatDate = (date) => {
  if (!date) return null;
  return date.split("T")[0];
};

// GENERATE KODE REGISTRASI UNIK
const generateKodeRegistrasi = () => {
  const prefix = "YWC";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}${timestamp}${random}`;
};

// ==================== KARYAWAN CONTROLLER ====================

// LIST KARYAWAN
exports.listKaryawan = async (req, res) => {
  try {
    const { status_magang } = req.query;
    
    let sql = "SELECT * FROM karyawan WHERE 1=1";
    const params = [];
    
    if (status_magang) {
      sql += " AND status_magang = ?";
      params.push(status_magang);
    }
    
    sql += " ORDER BY nama ASC";
    
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("LIST KARYAWAN ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data karyawan" });
  }
};

// GET KARYAWAN BY ID
exports.getKaryawan = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM karyawan WHERE id = ?", [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Karyawan tidak ditemukan" });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error("GET KARYAWAN ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data karyawan" });
  }
};

// CREATE KARYAWAN
exports.createKaryawan = async (req, res) => {
  try {
    const data = req.body;
    
    // Generate kode registrasi
    const kodeRegistrasi = generateKodeRegistrasi();
    
    // Handle file uploads
    const files = req.files || {};
    
    const sql = `
      INSERT INTO karyawan (
        kode_registrasi, nama, gelar, jenis_kelamin, tempat_lahir, tanggal_lahir,
        nik, tanggal_mulai, jabatan, email, no_hp, unit_kerja, status_magang,
        alamat_jalan, desa, kecamatan, kabupaten, nama_pemilik_buku, nomor_rekening,
        foto_ktp, foto_buku_rekening, foto_profil
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;
    
    const values = [
      kodeRegistrasi,
      data.nama,
      data.gelar || null,
      data.jenis_kelamin,
      data.tempat_lahir || null,
      formatDate(data.tanggal_lahir),
      data.nik || null,
      formatDate(data.tanggal_mulai),
      data.jabatan,
      data.email,
      data.no_hp || null,
      data.unit_kerja || null,
      data.status_magang || "MAGANG",
      data.alamat_jalan || null,
      data.desa || null,
      data.kecamatan || null,
      data.kabupaten || null,
      data.nama_pemilik_buku || null,
      data.nomor_rekening || null,
      files.foto_ktp ? files.foto_ktp[0].filename : null,
      files.foto_buku_rekening ? files.foto_buku_rekening[0].filename : null,
      files.foto_profil ? files.foto_profil[0].filename : null
    ];
    
    const [result] = await pool.query(sql, values);
    
    res.json({
      message: "Karyawan berhasil ditambahkan",
      id: result.insertId,
      kode_registrasi: kodeRegistrasi
    });
  } catch (err) {
    console.error("CREATE KARYAWAN ERROR:", err);
    res.status(500).json({ message: "Gagal menambah karyawan", error: err.message });
  }
};

// UPDATE KARYAWAN
exports.updateKaryawan = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const files = req.files || {};
    
    // Build dynamic SQL
    let sql = "UPDATE karyawan SET ";
    const updates = [];
    const values = [];
    
    // Add fields to update
    if (data.nama) { updates.push("nama = ?"); values.push(data.nama); }
    if (data.gelar !== undefined) { updates.push("gelar = ?"); values.push(data.gelar); }
    if (data.jenis_kelamin) { updates.push("jenis_kelamin = ?"); values.push(data.jenis_kelamin); }
    if (data.tempat_lahir) { updates.push("tempat_lahir = ?"); values.push(data.tempat_lahir); }
    if (data.tanggal_lahir) { updates.push("tanggal_lahir = ?"); values.push(formatDate(data.tanggal_lahir)); }
    if (data.nik) { updates.push("nik = ?"); values.push(data.nik); }
    if (data.tanggal_mulai) { updates.push("tanggal_mulai = ?"); values.push(formatDate(data.tanggal_mulai)); }
    if (data.jabatan) { updates.push("jabatan = ?"); values.push(data.jabatan); }
    if (data.email) { updates.push("email = ?"); values.push(data.email); }
    if (data.no_hp !== undefined) { updates.push("no_hp = ?"); values.push(data.no_hp); }
    if (data.unit_kerja !== undefined) { updates.push("unit_kerja = ?"); values.push(data.unit_kerja); }
    if (data.status_magang) { updates.push("status_magang = ?"); values.push(data.status_magang); }
    
    // Handle file uploads
    if (files.foto_ktp) { updates.push("foto_ktp = ?"); values.push(files.foto_ktp[0].filename); }
    if (files.foto_buku_rekening) { updates.push("foto_buku_rekening = ?"); values.push(files.foto_buku_rekening[0].filename); }
    if (files.foto_profil) { updates.push("foto_profil = ?"); values.push(files.foto_profil[0].filename); }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: "Tidak ada data yang diupdate" });
    }
    
    sql += updates.join(", ") + " WHERE id = ?";
    values.push(id);
    
    await pool.query(sql, values);
    
    res.json({ message: "Data karyawan berhasil diupdate" });
  } catch (err) {
    console.error("UPDATE KARYAWAN ERROR:", err);
    res.status(500).json({ message: "Gagal update karyawan", error: err.message });
  }
};

// DELETE KARYAWAN
exports.deleteKaryawan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if exists
    const [check] = await pool.query("SELECT id FROM karyawan WHERE id = ?", [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: "Karyawan tidak ditemukan" });
    }
    
    await pool.query("DELETE FROM karyawan WHERE id = ?", [id]);
    
    res.json({ message: "Karyawan berhasil dihapus" });
  } catch (err) {
    console.error("DELETE KARYAWAN ERROR:", err);
    res.status(500).json({ message: "Gagal menghapus karyawan" });
  }
};

// ==================== MAGANG CONTROLLER ====================

// LIST MAGANG
exports.listMagang = async (req, res) => {
  try {
    const { hasil } = req.query;
    
    let sql = `
      SELECT 
        k.*,
        m.magang_mulai,
        m.magang_selesai,
        m.hasil as status_magang,
        m.nilai_akhir,
        m.catatan
      FROM karyawan k
      LEFT JOIN magang_riwayat m ON k.id = m.karyawan_id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (hasil && hasil !== "Semua") {
      sql += " AND m.hasil = ?";
      params.push(hasil);
    }
    
    sql += " ORDER BY m.magang_mulai DESC";
    
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("LIST MAGANG ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data magang" });
  }
};

// VERIFIKASI MAGANG
exports.verifikasiMagang = async (req, res) => {
  try {
    const { id } = req.params;
    const { hasil, nilai_akhir, catatan } = req.body;
    
    if (!hasil || !nilai_akhir) {
      return res.status(400).json({ message: "Hasil dan nilai_akhir wajib diisi" });
    }
    
    // Get karyawan info
    const [karyawan] = await pool.query("SELECT * FROM karyawan WHERE id = ?", [id]);
    if (karyawan.length === 0) {
      return res.status(404).json({ message: "Karyawan tidak ditemukan" });
    }
    
    const k = karyawan[0];
    
    // Insert ke magang_riwayat
    await pool.query(
      `INSERT INTO magang_riwayat (
        karyawan_id, magang_mulai, magang_selesai, hasil, nilai_akhir, catatan
      ) VALUES (?, ?, NOW(), ?, ?, ?)`,
      [id, k.tanggal_mulai, hasil, nilai_akhir, catatan]
    );
    
    // Update status karyawan
    const newStatus = hasil === "Lulus" ? "LULUS" : "MAGANG";
    await pool.query("UPDATE karyawan SET status_magang = ? WHERE id = ?", [newStatus, id]);
    
    res.json({
      message: `Verifikasi berhasil! Karyawan dinyatakan ${hasil}`,
      status_baru: newStatus
    });
  } catch (err) {
    console.error("VERIFIKASI MAGANG ERROR:", err);
    res.status(500).json({ message: "Gagal verifikasi magang", error: err.message });
  }
};

// GET RIWAYAT MAGANG
exports.getRiwayatMagang = async (req, res) => {
  try {
    const { karyawan_id } = req.params;
    
    const [rows] = await pool.query(
      "SELECT * FROM magang_riwayat WHERE karyawan_id = ? ORDER BY magang_mulai DESC",
      [karyawan_id]
    );
    
    res.json(rows);
  } catch (err) {
    console.error("GET RIWAYAT MAGANG ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil riwayat magang" });
  }
};
