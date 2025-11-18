const pool = require("../config/db");

// POST /gaji/hitung
exports.hitungGaji = async (req, res) => {
  try {
    const { bulan, tahun } = req.body;
    if (!bulan || !tahun) return res.status(400).json({ error: "Bulan & tahun wajib" });

    // Ambil semua karyawan + absensi pada bulan tersebut (1 query)
    const [rows] = await pool.query(
      `
      SELECT 
        k.id AS karyawan_id,
        k.nama,
        k.jabatan,
        k.gaji_pokok,
        k.uang_makan,
        k.uang_transport,
        a.status
      FROM karyawan k
      LEFT JOIN absensi a 
        ON k.id = a.karyawan_id 
        AND MONTH(a.tanggal) = ?
        AND YEAR(a.tanggal) = ?
      ORDER BY k.id
      `,
      [bulan, tahun]
    );

    // group per karyawan
    const data = {};
    for (const r of rows) {
      if (!data[r.karyawan_id]) {
        data[r.karyawan_id] = {
          karyawan_id: r.karyawan_id,
          nama: r.nama,
          jabatan: r.jabatan,
          total_hadir: 0,
          total_telat: 0,
          total_izin: 0,
          total_alpa: 0,
          gaji_pokok: Number(r.gaji_pokok || 0),
          uang_makan: Number(r.uang_makan || 0),
          uang_transport: Number(r.uang_transport || 0),
        };
      }
      if (r.status === "HADIR") data[r.karyawan_id].total_hadir++;
      if (r.status === "TELAT") data[r.karyawan_id].total_telat++;
      if (r.status === "IZIN") data[r.karyawan_id].total_izin++;
      if (r.status === "ALPA") data[r.karyawan_id].total_alpa++;
    }

    // default tunjangan/potongan - jika Anda menyimpan di karyawan, ganti pakai kolom
    const POTONGAN_PER_TELAT = 2000;
    const POTONGAN_PER_ALPA = 50000;

    const hasil = Object.values(data).map((k) => {
      const total_gaji =
        k.gaji_pokok +
        k.total_hadir * k.uang_makan +
        k.total_hadir * k.uang_transport -
        k.total_telat * POTONGAN_PER_TELAT -
        k.total_alpa * POTONGAN_PER_ALPA;

      return {
        ...k,
        total_gaji
      };
    });

    res.json(hasil);
  } catch (err) {
    console.error("ERR hitungGaji:", err);
    res.status(500).json({ error: "Gagal menghitung gaji" });
  }
};