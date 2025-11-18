// ============================================
// controllers/karyawanController.js
// Berisi: Karyawan + Magang Controller
// ============================================
const pool = require("../config/db");  // ✅ HANYA 1X DI ATAS

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

exports.listKaryawan = async (req, res) => {
  // ... kode listKaryawan
};

exports.getKaryawan = async (req, res) => {
  // ... kode getKaryawan
};

exports.createKaryawan = async (req, res) => {
  // ... kode createKaryawan
};

exports.updateKaryawan = async (req, res) => {
  // ... kode updateKaryawan
};

exports.deleteKaryawan = async (req, res) => {
  // ... kode deleteKaryawan
};

// ==================== MAGANG CONTROLLER ====================
// ❌ HAPUS BARIS INI: const pool = require("../config/db");

exports.listMagang = async (req, res) => {
  // ... kode listMagang
};

exports.verifikasiMagang = async (req, res) => {
  // ... kode verifikasiMagang
};

exports.getRiwayatMagang = async (req, res) => {
  // ... kode getRiwayatMagang
};