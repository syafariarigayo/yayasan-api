// controllers/importAbsensiController.js
const pool = require("../config/db");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

function parseDateCell(v) {
  if (!v) return null;
  // Jika sudah berbentuk Date object
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  // Jika angka (Excel serial) -> XLSX biasanya memberi Date, but fallback:
  if (typeof v === "number") {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return d.toISOString().slice(0, 10);
  }
  // jika string, coba normalisasi (yyyy-mm-dd) atau dd/mm/yyyy
  //  jika sudah "2025-11-14" return langsung
  if (/\d{4}-\d{2}-\d{2}/.test(v)) return v.split("T")[0];
  // convert dd/mm/yyyy -> yyyy-mm-dd
  const m = v.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    let [ , dd, mm, yy ] = m;
    if (yy.length === 2) yy = "20" + yy;
    dd = dd.padStart(2,"0"); mm = mm.padStart(2,"0");
    return `${yy}-${mm}-${dd}`;
  }
  // fallback -> try Date parse
  const d = new Date(v);
  if (!isNaN(d)) return d.toISOString().slice(0,10);
  return null;
}

exports.importAbsensi = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    // baca workbook
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // ubah sheet ke JSON. raw:false agar nilai tanggal terbaca string/Date
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });

    if (!Array.isArray(rows) || rows.length === 0) {
      // hapus file sementara
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "File kosong atau format tidak dikenali" });
    }

    let inserted = 0;
    let skipped = 0;
    for (const r of rows) {
      // Harap header di Excel: nama, tanggal, jam_masuk, jam_pulang, status
      // toleran terhadap variasi: Nama/nama, Tanggal/tanggal, jam_masuk/jam masuk etc.
      const nama = r.nama || r.Nama || r.Name || r.name;
      const tanggalRaw = r.tanggal || r.Tanggal || r.date || r.Date;
      const jam_masuk = r.jam_masuk || r["jam masuk"] || r.JamMasuk || r["jam_masuk"];
      const jam_pulang = r.jam_pulang || r["jam pulang"] || r.JamPulang || r["jam_pulang"];
      const status = r.status || r.Status || "Hadir";

      if (!nama || !tanggalRaw) {
        skipped++;
        continue;
      }

      const tanggal = parseDateCell(tanggalRaw);
      if (!tanggal) { skipped++; continue; }

      // cari id karyawan berdasarkan nama (ambil 1 yang cocok)
      const [krows] = await pool.query("SELECT id FROM karyawan WHERE nama = ? LIMIT 1", [nama]);
      if (!krows || krows.length === 0) {
        skipped++;
        continue;
      }
      const karyawan_id = krows[0].id;

      // optional: hindari duplikat (karyawan_id + tanggal)
      const [exist] = await pool.query("SELECT id FROM absensi WHERE karyawan_id = ? AND tanggal = ? LIMIT 1", [karyawan_id, tanggal]);
      if (exist && exist.length > 0) { skipped++; continue; }

      await pool.query(
        `INSERT INTO absensi (karyawan_id, tanggal, jam_masuk, jam_pulang, status) VALUES (?, ?, ?, ?, ?)`,
        [karyawan_id, tanggal, jam_masuk || null, jam_pulang || null, status || "Hadir"]
      );
      inserted++;
    }

    // hapus file sementara
    fs.unlinkSync(filePath);

    return res.json({
      message: `Import selesai. Disimpan: ${inserted}, dilewati: ${skipped}`
    });
  } catch (err) {
    console.error("IMPORT ERROR:", err);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch(e){}
    }
    return res.status(500).json({ error: "Import gagal", detail: err.message });
  }
};