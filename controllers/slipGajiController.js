const pool = require("../config/db");
const PDFDocument = require("pdfkit");

// GET /slip/:id  -> detail JSON
exports.getSlipDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT r.*, k.nama, k.jabatan FROM rekap_gaji r JOIN karyawan k ON r.karyawan_id = k.id WHERE r.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Slip tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) {
    console.error("ERR getSlipDetail:", err);
    res.status(500).json({ error: "Gagal mengambil slip" });
  }
};

// GET /slip/download/:id -> PDF stream
exports.downloadSlipGaji = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT r.*, k.nama, k.jabatan FROM rekap_gaji r JOIN karyawan k ON r.karyawan_id = k.id WHERE r.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Slip tidak ditemukan" });

    const data = rows[0];

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=slip-gaji-${data.nama}-${data.bulan}-${data.tahun}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(18).text("SLIP GAJI", { align: "center" });
    doc.moveDown(1);

    // Info
    doc.fontSize(12);
    doc.text(`Nama       : ${data.nama}`);
    doc.text(`Jabatan    : ${data.jabatan}`);
    doc.text(`Periode    : ${data.bulan} / ${data.tahun}`);
    doc.moveDown();

    // Rincian
    doc.text("Rincian Gaji:");
    doc.moveDown(0.3);
    doc.text(`Hadir       : ${data.total_hadir}`);
    doc.text(`Telat       : ${data.total_telat}`);
    doc.text(`Izin        : ${data.total_izin}`);
    doc.text(`Alpa        : ${data.total_alpa}`);
    doc.moveDown();

    // Komponen gaji
    doc.text(`Gaji Pokok       : Rp ${Number(data.gaji_pokok).toLocaleString()}`);
    doc.text(`Uang Makan       : Rp ${Number(data.uang_makan).toLocaleString()}`);
    doc.text(`Uang Transport   : Rp ${Number(data.uang_transport).toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text(`TOTAL GAJI : Rp ${Number(data.total_gaji).toLocaleString()}`, { align: "right" });

    doc.end();
  } catch (err) {
    console.error("ERR downloadSlipGaji:", err);
    res.status(500).json({ error: "Gagal membuat slip PDF" });
  }
};